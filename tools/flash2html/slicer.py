"""
Atlas slicer: crops 9-slice regions from atlas PNGs and assembles composites.

Uses Pillow for image manipulation.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from pathlib import Path

try:
    from PIL import Image, ImageChops
except ImportError:
    Image = None  # type: ignore
    ImageChops = None  # type: ignore

from models import Rectangle, Skin, SkinEntity, SkinState


@dataclass
class SlicedSprite:
    """Result of slicing a skin state into a composite sprite."""
    path: Path
    width: int
    height: int
    border_top: int = 0
    border_right: int = 0
    border_bottom: int = 0
    border_left: int = 0


# Cache of already-sliced sprites: (atlas_path, template_name, layout_name, color_hex) → SlicedSprite
_sprite_cache: dict[str, SlicedSprite] = {}


def _cache_key(atlas_path: Path, skin_name: str, state_name: str, color: int | None) -> str:
    """Generate a unique cache key for a sliced sprite."""
    color_hex = f"{color:08x}" if color is not None else "none"
    return f"{atlas_path.name}|{skin_name}|{state_name}|{color_hex}"


def _color_to_rgba(color: int | None) -> tuple[int, int, int, int]:
    """Convert a 0xAARRGGBB integer to (R, G, B, A) tuple."""
    if color is None:
        return (255, 255, 255, 255)
    a = (color >> 24) & 0xFF
    r = (color >> 16) & 0xFF
    g = (color >> 8) & 0xFF
    b = color & 0xFF
    if a == 0 and (r > 0 or g > 0 or b > 0):
        a = 0xFF
    return (r, g, b, a)


def _tint_image(img: Image.Image, color: tuple[int, int, int, int]) -> Image.Image:
    """Apply multiply tint to an image."""
    if ImageChops is None:
        return img
    r, g, b, _a = color
    tint = Image.new("RGBA", img.size, (r, g, b, 255))
    # Multiply blend: result = (src * tint) / 255
    result = ImageChops.multiply(img.convert("RGBA"), tint)
    # Preserve original alpha
    _, _, _, orig_alpha = img.convert("RGBA").split()
    result.putalpha(orig_alpha)
    return result


def _sanitize_filename(name: str) -> str:
    """Create a filesystem-safe filename."""
    return name.replace("/", "_").replace("\\", "_").replace(" ", "_")


def _get_entity_by_name(entities: list[SkinEntity], name: str) -> SkinEntity | None:
    """Find an entity by name in a list."""
    for e in entities:
        if e.name == name:
            return e
    return None


# Standard 9-slice entity name sets
NINE_SLICE_NAMES = [
    # Row: top
    ("top_left", "top_center", "top_right"),
    # Row: mid/center
    ("mid_left", "center_left", "mid_center", "center_center", "mid_right", "center_right"),
    # Row: bottom
    ("btm_left", "bottom_left", "btm_center", "bottom_center", "btm_right", "bottom_right"),
]

# Map of alternative names for 9-slice positions
POSITION_ALIASES: dict[str, str] = {
    "mid_left": "center_left",
    "center_left": "mid_left",
    "mid_center": "center_center",
    "center_center": "mid_center",
    "mid_right": "center_right",
    "center_right": "mid_right",
    "btm_left": "bottom_left",
    "bottom_left": "btm_left",
    "btm_center": "bottom_center",
    "bottom_center": "btm_center",
    "btm_right": "bottom_right",
    "bottom_right": "btm_right",
}

# All canonical 9-slice positions (used for suffix detection)
_CANONICAL_POSITIONS = {
    "top_left", "top_center", "top_right",
    "center_left", "mid_left", "center_center", "mid_center", "center_right", "mid_right",
    "bottom_left", "btm_left", "bottom_center", "btm_center", "bottom_right", "btm_right",
}


def _find_entity(entities: list[SkinEntity], *names: str) -> SkinEntity | None:
    """Find an entity by any of the given names."""
    for name in names:
        ent = _get_entity_by_name(entities, name)
        if ent is not None:
            return ent
        # Try alias
        alias = POSITION_ALIASES.get(name)
        if alias:
            ent = _get_entity_by_name(entities, alias)
            if ent is not None:
                return ent
    return None


def _normalize_position(name: str) -> str:
    """Normalize a position name to its canonical form (e.g. mid_left -> center_left)."""
    mapping = {
        "mid_left": "center_left",
        "mid_center": "center_center",
        "mid_right": "center_right",
        "btm_left": "bottom_left",
        "btm_center": "bottom_center",
        "btm_right": "bottom_right",
    }
    return mapping.get(name, name)


def _group_entities_by_layer(
    entities: list[SkinEntity],
) -> dict[str, dict[str, SkinEntity]]:
    """
    Group entities into layers by name prefix.

    For standard names (top_left, center_center), the prefix is "".
    For prefixed names (border_top_left, background_center_center), the prefix is
    "border", "background", etc.

    Returns {prefix: {normalized_position: entity}}.
    """
    layers: dict[str, dict[str, SkinEntity]] = {}

    for ent in entities:
        name = ent.name
        prefix = ""
        position = name

        # Check if name itself is a standard position
        if name in _CANONICAL_POSITIONS:
            prefix = ""
            position = name
        else:
            # Try to strip a prefix: look for *_<position>
            found = False
            for pos in _CANONICAL_POSITIONS:
                suffix = "_" + pos
                if name.endswith(suffix):
                    prefix = name[: -len(suffix)]
                    position = pos
                    found = True
                    break
            if not found:
                continue  # Not a 9-slice entity

        norm_pos = _normalize_position(position)

        if prefix not in layers:
            layers[prefix] = {}
        layers[prefix][norm_pos] = ent

    return layers


def _compute_layer_layout(layer: dict[str, SkinEntity]) -> tuple[int, int, int, int, int, int, int, int] | None:
    """
    Compute 9-slice dimensions from a layer's layout entities.

    Returns (border_left, border_top, border_right, border_bottom,
             center_w, center_h, total_w, total_h), or None if not a valid 9-slice.
    """
    tl = layer.get("top_left")
    tr = layer.get("top_right")
    bl = layer.get("bottom_left")
    br = layer.get("bottom_right")
    mc = layer.get("center_center")

    if tl is None:
        return None

    b_left = tl.region.width
    b_top = tl.region.height
    b_right = tr.region.width if tr else b_left
    b_bottom = bl.region.height if bl else b_top
    c_w = mc.region.width if mc else 1
    c_h = mc.region.height if mc else 1

    return (b_left, b_top, b_right, b_bottom, c_w, c_h,
            b_left + c_w + b_right, b_top + c_h + b_bottom)


def slice_nine_patch(
    atlas_path: Path,
    template_entities: list[SkinEntity],
    layout_entities: list[SkinEntity],
    color: int | None,
    output_dir: Path,
    sprite_name: str,
) -> SlicedSprite | None:
    """
    Slice a 9-patch sprite from an atlas and assemble into a composite.

    Handles both standard entity names (top_left, center_center) and
    prefixed multi-layer names (border_top_left, background_center_center).
    """
    if Image is None:
        return None

    try:
        atlas = Image.open(atlas_path).convert("RGBA")
    except Exception as e:
        print(f"  [WARN] Cannot open atlas {atlas_path}: {e}")
        return None

    # Try standard (unprefixed) entity names first
    tl_l = _find_entity(layout_entities, "top_left")
    br_l = _find_entity(layout_entities, "btm_right", "bottom_right")

    if tl_l is not None and br_l is not None:
        # Standard 9-slice: use original single-layer path
        return _slice_standard_nine_patch(
            atlas, template_entities, layout_entities, color, output_dir, sprite_name
        )

    # Try multi-layer approach: group entities by prefix
    tmpl_layers = _group_entities_by_layer(template_entities)
    layout_layers = _group_entities_by_layer(layout_entities)

    if not tmpl_layers or not layout_layers:
        return _slice_simple(atlas, template_entities, layout_entities, color, output_dir, sprite_name)

    # Find the outermost layer (the one with the largest total composite size)
    # and the fill layer (typically "background")
    best_prefix = None
    best_layout = None
    best_dims = None
    max_area = 0

    for prefix, layer_map in layout_layers.items():
        dims = _compute_layer_layout(layer_map)
        if dims is None:
            continue
        area = dims[6] * dims[7]  # total_w * total_h
        if area > max_area:
            max_area = area
            best_prefix = prefix
            best_layout = layer_map
            best_dims = dims

    if best_dims is None:
        return _slice_simple(atlas, template_entities, layout_entities, color, output_dir, sprite_name)

    b_left, b_top, b_right, b_bottom, c_w, c_h, total_w, total_h = best_dims

    composite = Image.new("RGBA", (total_w, total_h), (0, 0, 0, 0))
    rgba_color = _color_to_rgba(color)

    # Determine layer draw order: "background" first, then others (border/button)
    sorted_prefixes = sorted(
        layout_layers.keys(),
        key=lambda p: (0 if p == "background" else 1, p),
    )

    for prefix in sorted_prefixes:
        l_layer = layout_layers.get(prefix, {})
        t_layer = tmpl_layers.get(prefix, {})
        if not l_layer or not t_layer:
            continue

        layer_dims = _compute_layer_layout(l_layer)
        if layer_dims is None:
            continue

        lb_left, lb_top, lb_right, lb_bottom, lc_w, lc_h, _lw, _lh = layer_dims

        # The nine positions for this layer
        positions = [
            ("top_left",      0,             0,             lb_left,  lb_top),
            ("top_center",    lb_left,       0,             lc_w,     lb_top),
            ("top_right",     lb_left+lc_w,  0,             lb_right, lb_top),
            ("center_left",   0,             lb_top,        lb_left,  lc_h),
            ("center_center", lb_left,       lb_top,        lc_w,     lc_h),
            ("center_right",  lb_left+lc_w,  lb_top,        lb_right, lc_h),
            ("bottom_left",   0,             lb_top+lc_h,   lb_left,  lb_bottom),
            ("bottom_center", lb_left,       lb_top+lc_h,   lc_w,     lb_bottom),
            ("bottom_right",  lb_left+lc_w,  lb_top+lc_h,   lb_right, lb_bottom),
        ]

        # Calculate offset of this layer within the overall composite
        # (background may be inset from border)
        layer_tl = l_layer.get("top_left")
        if layer_tl:
            offset_x = layer_tl.region.x
            offset_y = layer_tl.region.y
        else:
            offset_x = 0
            offset_y = 0

        for pos_name, dx, dy, dw, dh in positions:
            t_ent = t_layer.get(pos_name)
            l_ent = l_layer.get(pos_name)
            if t_ent is None or l_ent is None:
                continue
            if dw <= 0 or dh <= 0:
                continue

            r = t_ent.region
            try:
                piece = atlas.crop((r.x, r.y, r.x + r.width, r.y + r.height))
            except Exception:
                continue

            if piece.width != dw or piece.height != dh:
                piece = piece.resize((dw, dh), Image.NEAREST)

            if l_ent.colorize and color is not None:
                piece = _tint_image(piece, rgba_color)

            composite.paste(piece, (offset_x + dx, offset_y + dy), piece)

    # Border values for CSS come from the outermost layer (largest)
    output_dir.mkdir(parents=True, exist_ok=True)
    safe_name = _sanitize_filename(sprite_name)
    output_path = output_dir / f"{safe_name}.png"
    composite.save(output_path)

    return SlicedSprite(
        path=output_path,
        width=total_w,
        height=total_h,
        border_top=b_top,
        border_right=b_right,
        border_bottom=b_bottom,
        border_left=b_left,
    )


def _slice_standard_nine_patch(
    atlas: Image.Image,
    template_entities: list[SkinEntity],
    layout_entities: list[SkinEntity],
    color: int | None,
    output_dir: Path,
    sprite_name: str,
) -> SlicedSprite | None:
    """Slice a standard 9-patch with unprefixed entity names."""

    tl_t = _find_entity(template_entities, "top_left")
    tc_t = _find_entity(template_entities, "top_center")
    tr_t = _find_entity(template_entities, "top_right")
    ml_t = _find_entity(template_entities, "mid_left", "center_left")
    mc_t = _find_entity(template_entities, "mid_center", "center_center")
    mr_t = _find_entity(template_entities, "mid_right", "center_right")
    bl_t = _find_entity(template_entities, "btm_left", "bottom_left")
    bc_t = _find_entity(template_entities, "btm_center", "bottom_center")
    br_t = _find_entity(template_entities, "btm_right", "bottom_right")

    tl_l = _find_entity(layout_entities, "top_left")
    tc_l = _find_entity(layout_entities, "top_center")
    tr_l = _find_entity(layout_entities, "top_right")
    ml_l = _find_entity(layout_entities, "mid_left", "center_left")
    mc_l = _find_entity(layout_entities, "mid_center", "center_center")
    mr_l = _find_entity(layout_entities, "mid_right", "center_right")
    bl_l = _find_entity(layout_entities, "btm_left", "bottom_left")
    bc_l = _find_entity(layout_entities, "btm_center", "bottom_center")
    br_l = _find_entity(layout_entities, "btm_right", "bottom_right")

    border_left = tl_l.region.width
    border_top = tl_l.region.height
    border_right = tr_l.region.width if tr_l else border_left
    border_bottom = bl_l.region.height if bl_l else border_top

    total_w = border_left + (mc_l.region.width if mc_l else 1) + border_right
    total_h = border_top + (mc_l.region.height if mc_l else 1) + border_bottom

    composite = Image.new("RGBA", (total_w, total_h), (0, 0, 0, 0))
    rgba_color = _color_to_rgba(color)

    def _crop_and_place(
        tmpl_ent: SkinEntity | None,
        layout_ent: SkinEntity | None,
        dest_x: int, dest_y: int, dest_w: int, dest_h: int,
    ) -> None:
        if tmpl_ent is None or layout_ent is None:
            return
        r = tmpl_ent.region
        try:
            piece = atlas.crop((r.x, r.y, r.x + r.width, r.y + r.height))
        except Exception:
            return
        if piece.width != dest_w or piece.height != dest_h:
            if dest_w > 0 and dest_h > 0:
                piece = piece.resize((dest_w, dest_h), Image.NEAREST)
        if layout_ent.colorize and color is not None:
            piece = _tint_image(piece, rgba_color)
        composite.paste(piece, (dest_x, dest_y), piece)

    center_x = border_left
    center_y = border_top
    center_w = mc_l.region.width if mc_l else 1
    center_h = mc_l.region.height if mc_l else 1
    right_x = center_x + center_w
    bottom_y = center_y + center_h

    _crop_and_place(tl_t, tl_l, 0, 0, border_left, border_top)
    _crop_and_place(tc_t, tc_l, center_x, 0, center_w, border_top)
    _crop_and_place(tr_t, tr_l, right_x, 0, border_right, border_top)
    _crop_and_place(ml_t, ml_l, 0, center_y, border_left, center_h)
    _crop_and_place(mc_t, mc_l, center_x, center_y, center_w, center_h)
    _crop_and_place(mr_t, mr_l, right_x, center_y, border_right, center_h)
    _crop_and_place(bl_t, bl_l, 0, bottom_y, border_left, border_bottom)
    _crop_and_place(bc_t, bc_l, center_x, bottom_y, center_w, border_bottom)
    _crop_and_place(br_t, br_l, right_x, bottom_y, border_right, border_bottom)

    output_dir.mkdir(parents=True, exist_ok=True)
    safe_name = _sanitize_filename(sprite_name)
    output_path = output_dir / f"{safe_name}.png"
    composite.save(output_path)

    return SlicedSprite(
        path=output_path,
        width=total_w,
        height=total_h,
        border_top=border_top,
        border_right=border_right,
        border_bottom=border_bottom,
        border_left=border_left,
    )


def _infer_border_values(
    layout_entities: list[SkinEntity],
) -> tuple[int, int, int, int]:
    """
    Infer CSS border-image-slice values from layout entities' scale modes.

    Only produces non-zero borders when the layout has stretchable entities,
    indicating an actual 9-slice structure. Simple sprites (all fixed) return (0,0,0,0).
    """
    # A real 9-slice requires at least one stretchable axis
    has_stretch = any(
        le.scale_h == "strech" or le.scale_v == "strech"
        for le in layout_entities
    )
    if not has_stretch:
        return (0, 0, 0, 0)

    border_top = 0
    border_bottom = 0
    border_left = 0
    border_right = 0

    for le in layout_entities:
        sv = le.scale_v
        sh = le.scale_h

        # Top border: fixed-v entities at top edge
        if sv == "fixed" and le.region.y == 0:
            border_top = max(border_top, le.region.height)

        # Bottom border: move-v entities (bottom-anchored)
        if sv == "move":
            border_bottom = max(border_bottom, le.region.height)

        # Left border: fixed-h entities at left edge
        if sh == "fixed" and le.region.x == 0:
            border_left = max(border_left, le.region.width)

        # Right border: move-h entities (right-anchored)
        if sh == "move":
            border_right = max(border_right, le.region.width)

    return (border_top, border_right, border_bottom, border_left)


def _slice_simple(
    atlas: Image.Image,
    template_entities: list[SkinEntity],
    layout_entities: list[SkinEntity],
    color: int | None,
    output_dir: Path,
    sprite_name: str,
) -> SlicedSprite | None:
    """Slice a non-standard sprite and infer border values from scale modes."""
    if not template_entities:
        return None

    rgba_color = _color_to_rgba(color)

    # Find total bounds from layout
    max_w = 0
    max_h = 0
    for le in layout_entities:
        rw = le.region.x + le.region.width
        rh = le.region.y + le.region.height
        max_w = max(max_w, rw)
        max_h = max(max_h, rh)

    if max_w == 0 or max_h == 0:
        # Use template dimensions as fallback
        for te in template_entities:
            max_w = max(max_w, te.region.width)
            max_h = max(max_h, te.region.height)

    if max_w == 0 or max_h == 0:
        return None

    composite = Image.new("RGBA", (max_w, max_h), (0, 0, 0, 0))

    for te in template_entities:
        # Find matching layout entity
        le = _get_entity_by_name(layout_entities, te.name)
        if le is None:
            continue

        r = te.region
        try:
            piece = atlas.crop((r.x, r.y, r.x + r.width, r.y + r.height))
        except Exception:
            continue

        dest_w = le.region.width if le.region.width > 0 else piece.width
        dest_h = le.region.height if le.region.height > 0 else piece.height

        if piece.width != dest_w or piece.height != dest_h:
            if dest_w > 0 and dest_h > 0:
                piece = piece.resize((dest_w, dest_h), Image.NEAREST)

        if le.colorize and color is not None:
            piece = _tint_image(piece, rgba_color)

        composite.paste(piece, (le.region.x, le.region.y), piece)

    # Infer border values from entity scale modes
    b_top, b_right, b_bottom, b_left = _infer_border_values(layout_entities)

    output_dir.mkdir(parents=True, exist_ok=True)
    safe_name = _sanitize_filename(sprite_name)
    output_path = output_dir / f"{safe_name}.png"
    composite.save(output_path)

    return SlicedSprite(
        path=output_path,
        width=max_w,
        height=max_h,
        border_top=b_top,
        border_right=b_right,
        border_bottom=b_bottom,
        border_left=b_left,
    )


def slice_skin_state(
    skin: Skin,
    state: SkinState,
    atlas_path: Path | None,
    color: int | None,
    output_dir: Path,
    name_prefix: str = "",
) -> SlicedSprite | None:
    """
    Slice a single skin state into a composite sprite.

    Looks up template + layout from the skin, crops from atlas, assembles.
    """
    if atlas_path is None or not atlas_path.exists():
        return None

    key = _cache_key(atlas_path, name_prefix or skin.name, state.name, color)
    if key in _sprite_cache:
        return _sprite_cache[key]

    template_ents = skin.templates.get(state.template_name, [])
    layout_ents = skin.layouts.get(state.layout_name, [])

    if not template_ents or not layout_ents:
        return None

    color_suffix = f"_tinted_{color & 0xFFFFFF:06x}" if color is not None else ""
    sprite_name = f"{name_prefix or skin.name}_{state.name}{color_suffix}"

    result = slice_nine_patch(
        atlas_path, template_ents, layout_ents, color, output_dir, sprite_name
    )

    if result is not None:
        _sprite_cache[key] = result

    return result


def slice_all_skin_states(
    skin: Skin,
    atlas_path: Path | None,
    color: int | None,
    output_dir: Path,
    name_prefix: str = "",
) -> dict[str, SlicedSprite]:
    """Slice all states of a skin, returning dict of state_name → SlicedSprite."""
    results: dict[str, SlicedSprite] = {}

    for state in skin.states:
        sprite = slice_skin_state(skin, state, atlas_path, color, output_dir, name_prefix)
        if sprite is not None:
            results[state.name] = sprite

    return results


def clear_cache() -> None:
    """Clear the sprite cache."""
    _sprite_cache.clear()
