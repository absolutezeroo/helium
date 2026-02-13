"""
HTML + CSS renderer for Flash layout trees.

Converts resolved layout nodes into self-contained HTML preview files.
"""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

import shutil

from models import (
    LayoutNode,
    ModuleLayout,
    ParamFlags,
    TextStyle,
    WindowLayout,
)
from resolver import ElementResolver, ResolvedElement, decode_params, resolve_atlas_path
from slicer import SlicedSprite, slice_all_skin_states


def to_snake_case(text: str) -> str:
    """
    Convert text to strictly lowercase snake_case.

    Handles:
    - CamelCase/PascalCase -> snake_case (e.g., AvatarEditor -> avatar_editor)
    - Mixed_case -> lowercase (e.g., Achievement_competition -> achievement_competition)
    - Multiple underscores -> single underscore cleanup

    Examples:
        >>> to_snake_case("AvatarEditor")
        'avatar_editor'
        >>> to_snake_case("Achievement_competition_hall_of_fame")
        'achievement_competition_hall_of_fame'
        >>> to_snake_case("Inventory_furni")
        'inventory_furni'
    """
    # Step 1: Insert underscore before uppercase letters that follow lowercase letters
    # e.g., "AvatarEditor" -> "Avatar_Editor"
    s1 = re.sub(r'([a-z])([A-Z])', r'\1_\2', text)

    # Step 2: Insert underscore before uppercase letters that are followed by lowercase letters
    # This handles cases like "HTTPSConnection" -> "HTTPS_Connection"
    s2 = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1_\2', s1)

    # Step 3: Convert to lowercase
    s3 = s2.lower()

    # Step 4: Replace multiple consecutive underscores with a single underscore
    s4 = re.sub(r'_+', '_', s3)

    # Step 5: Strip leading/trailing underscores
    return s4.strip('_')


def _color_to_css(color: int | None) -> str | None:
    """Convert 0xAARRGGBB to CSS #rrggbb or rgba(...)."""
    if color is None:
        return None
    a = (color >> 24) & 0xFF
    r = (color >> 16) & 0xFF
    g = (color >> 8) & 0xFF
    b = color & 0xFF
    if a == 0 and (r > 0 or g > 0 or b > 0):
        a = 0xFF
    if a == 0xFF or a == 0:
        return f"#{r:02x}{g:02x}{b:02x}"
    return f"rgba({r},{g},{b},{a / 255:.2f})"


def _escape(text: str | None) -> str:
    """HTML-escape a string."""
    if text is None:
        return ""
    return html.escape(text)


def _get_image_size(path: Path) -> tuple[int, int] | None:
    """Return image size for PNG/GIF assets without external deps."""
    suffix = path.suffix.lower()
    try:
        with path.open("rb") as f:
            if suffix == ".png":
                sig = f.read(8)
                if sig != b"\x89PNG\r\n\x1a\n":
                    return None
                f.read(4)
                chunk = f.read(4)
                if chunk != b"IHDR":
                    return None
                data = f.read(8)
                if len(data) != 8:
                    return None
                w = int.from_bytes(data[:4], "big")
                h = int.from_bytes(data[4:], "big")
                return (w, h)
            if suffix == ".gif":
                header = f.read(10)
                if len(header) < 10 or not header.startswith(b"GIF"):
                    return None
                w = int.from_bytes(header[6:8], "little")
                h = int.from_bytes(header[8:10], "little")
                return (w, h)
    except OSError:
        return None
    return None


def _resolve_asset_path(assets_dir: Path, asset_uri: str) -> Path | None:
    """Resolve asset_uri to a file path in assets_dir."""
    if not asset_uri:
        return None

    candidates = []
    if asset_uri.lower().endswith((".png", ".gif")):
        candidates.append(assets_dir / asset_uri)
    else:
        candidates.append(assets_dir / f"{asset_uri}.png")
        candidates.append(assets_dir / f"{asset_uri}.gif")

    base = asset_uri
    if base.endswith("_png"):
        base = base[:-4]
    elif base.endswith("_gif"):
        base = base[:-4]

    if base != asset_uri:
        candidates.append(assets_dir / f"{base}.png")
        candidates.append(assets_dir / f"{base}.gif")

    for p in candidates:
        if p.exists():
            return p
    return None


def load_external_texts(json_path: Path) -> dict[str, str]:
    """
    Load ExternalTexts.json and return a dictionary of text keys to values.

    Args:
        json_path: Path to ExternalTexts.json

    Returns:
        Dictionary mapping text keys to their values
    """
    if not json_path.exists():
        return {}

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        print(f"Warning: Failed to load ExternalTexts.json: {e}")
        return {}


def replace_text_variables(text: str | None, external_texts: dict[str, str], max_depth: int = 5) -> str:
    """
    Replace ${...} variables in text with values from ExternalTexts.json.

    Handles nested variables (e.g., "${ACH_pinatabreaker1_badge_name}" -> "Piñata Breaker %roman%").

    Args:
        text: Text potentially containing ${...} variables
        external_texts: Dictionary of text keys to values from ExternalTexts.json
        max_depth: Maximum recursion depth to prevent infinite loops

    Returns:
        Text with all ${...} variables replaced, or original text if no variables found

    Examples:
        >>> texts = {"floor.plan.editor.import.export": "Import / Export"}
        >>> replace_text_variables("${floor.plan.editor.import.export}", texts)
        'Import / Export'
    """
    if text is None or not text:
        return ""

    if max_depth <= 0:
        return text  # Prevent infinite recursion

    # Pattern to match ${variable.name}
    pattern = re.compile(r'\$\{([^}]+)\}')

    def replacer(match: re.Match) -> str:
        key = match.group(1)
        # Look up the key in external_texts
        if key in external_texts:
            value = external_texts[key]
            # Recursively replace variables in the value (for nested variables)
            return replace_text_variables(value, external_texts, max_depth - 1)
        else:
            # Keep original if not found
            return match.group(0)

    return pattern.sub(replacer, text)


class HtmlRenderer:
    """Generates HTML + CSS files from resolved layout trees."""

    def __init__(
        self,
        resolver: ElementResolver,
        text_styles: dict[str, TextStyle],
        assets_dir: Path,
        output_dir: Path,
        skip_slicing: bool = False,
        verbose: bool = False,
        external_texts: dict[str, str] | None = None,
    ):
        self._resolver = resolver
        self._text_styles = text_styles
        self._assets_dir = assets_dir
        self._output_dir = output_dir
        self._skip_slicing = skip_slicing
        self._verbose = verbose
        self._external_texts = external_texts or {}
        self._shared_assets_dir = output_dir / "shared" / "assets"
        self._css_rules: list[str] = []
        self._selector_count: int = 0

    def render_module_layout(self, layout: ModuleLayout) -> Path | None:
        """Render a single module layout to an HTML file. Returns the output path."""
        if layout.root is None:
            return None

        self._css_rules = []
        self._selector_count = 0

        # Build HTML tree
        html_content = self._render_node(layout.root, depth=0)

        # Build CSS
        css_text = "\n".join(self._css_rules)

        # Determine output path
        module_dir = self._output_dir / to_snake_case(layout.module)
        # Derive a clean layout name
        clean_name = to_snake_case(layout.layout_name.replace(" ", "_"))
        layout_dir = module_dir / clean_name
        layout_dir.mkdir(parents=True, exist_ok=True)
        output_path = layout_dir / "index.html"

        # Calculate relative path to shared assets
        rel_shared = _relative_path(layout_dir, self._output_dir / "shared")

        # Write HTML
        preview_w = layout.width if layout.width > 0 else 600
        preview_h = layout.height if layout.height > 0 else 400
        page = _build_page(
            title=f"{layout.layout_name} - Flash Layout Preview",
            css=css_text,
            body=html_content,
            preview_w=preview_w,
            preview_h=preview_h,
            shared_css_path=f"{rel_shared}/base.css",
        )

        output_path.write_text(page, encoding="utf-8")
        return output_path

    def _render_node(self, node: LayoutNode, depth: int) -> str:
        """Recursively render a layout node to HTML."""
        resolved = self._resolver.resolve(node)
        params = resolved.params

        # Generate a unique selector
        self._selector_count += 1
        data_name = to_snake_case(node.name) if node.name else f"anon_{self._selector_count}"
        selector = f".hwm-{node.tag}[data-name=\"{data_name}\"]"
        if not node.name:
            # Use a numbered class for anonymous nodes
            selector = f".hwm-node-{self._selector_count}"

        css_class = f"hwm-{node.tag}"
        extra_classes = ""
        if not node.name:
            extra_classes = f" hwm-node-{self._selector_count}"

        # Generate CSS for this node
        css = self._generate_node_css(selector, node, resolved, params, depth)
        if css:
            self._css_rules.append(css)

        # Build HTML
        indent = "  " * (depth + 2)
        attrs = f'class="{css_class}{extra_classes}"'
        if node.name:
            attrs += f' data-name="{_escape(data_name)}"'
        if node.style:
            attrs += f' data-style="{node.style}"'
        if node.id_attr:
            attrs += f' data-id="{_escape(node.id_attr)}"'
        if not node.visible:
            attrs += ' data-hidden="true"'
        if node.tags:
            attrs += f' data-tags="{_escape(node.tags)}"'

        parts: list[str] = []

        # Caption handling: text elements display caption as content, others use it as tooltip
        # Elements that should display caption as visible text
        text_display_tags = {
            "text", "label", "formatted_text", "link", "password", "input",
            "button", "button_thick", "tab_button", "container_button",
            "tab_container_button", "closebutton"
        }

        if node.caption:
            resolved_caption = replace_text_variables(node.caption, self._external_texts)
            if node.tag in text_display_tags:
                # Display caption as visible text content
                parts.append(f"{indent}<div {attrs}>")
                parts.append(f"{indent}  <span class=\"hwm-caption\">{_escape(resolved_caption)}</span>")
            else:
                # Use caption as tooltip (title attribute)
                attrs += f' title="{_escape(resolved_caption)}"'
                parts.append(f"{indent}<div {attrs}>")
        else:
            parts.append(f"{indent}<div {attrs}>")

        # Frame margin offset: wrap children in a content area container
        margin_top = int(node.variables.get("margin_top", "0") or "0")
        margin_left = int(node.variables.get("margin_left", "0") or "0")
        margin_right = int(node.variables.get("margin_right", "0") or "0")
        margin_bottom = int(node.variables.get("margin_bottom", "0") or "0")
        has_margins = node.tag == "frame" and (margin_top or margin_left or margin_right or margin_bottom)

        if has_margins:
            # Generate a content wrapper with the margin offsets
            self._selector_count += 1
            wrapper_sel = f".hwm-content-{self._selector_count}"
            wrapper_css_parts = [
                "position: absolute",
                f"left: {margin_left}px",
                f"top: {margin_top}px",
                f"width: calc(100% - {margin_left + margin_right}px)",
                f"height: calc(100% - {margin_top + margin_bottom}px)",
            ]
            wrapper_css = f"{wrapper_sel} {{\n" + ";\n".join(f"  {p}" for p in wrapper_css_parts) + ";\n}"
            self._css_rules.append(wrapper_css)
            parts.append(f"{indent}  <div class=\"hwm-content-{self._selector_count}\">")

        # Children
        child_depth = depth + 2 if has_margins else depth + 1
        for child in node.children:
            parts.append(self._render_node(child, child_depth))

        if has_margins:
            parts.append(f"{indent}  </div>")

        parts.append(f"{indent}</div>")

        return "\n".join(parts)

    def _generate_node_css(
        self,
        selector: str,
        node: LayoutNode,
        resolved: ResolvedElement,
        params: ParamFlags,
        depth: int = 0,
    ) -> str:
        """Generate CSS rules for a single node."""
        props: list[str] = []

        # Positioning — root node (depth 0) is relative, all others absolute
        is_root = depth == 0
        if is_root:
            props.append("position: relative")
        else:
            props.append("position: absolute")

        # Horizontal positioning based on h_scale
        # For root element (depth=0), don't apply left/top offsets (they're relative to page, not parent)
        if params.h_scale == "fixed":
            if not is_root:
                props.append(f"left: {node.x}px")
            if node.width > 0:
                props.append(f"width: {node.width}px")
        elif params.h_scale == "stretch":
            if not is_root:
                props.append(f"left: {node.x}px")
            # right = parent doesn't know size, use width as default but mark as stretch
            if node.width > 0:
                props.append(f"width: {node.width}px")
            props.append("/* h_scale: stretch */")
        elif params.h_scale == "move":
            # Anchored to right
            if not is_root:
                props.append(f"left: {node.x}px")
            if node.width > 0:
                props.append(f"width: {node.width}px")
            props.append("/* h_scale: move (right-anchored) */")
        elif params.h_scale == "center":
            props.append("left: 50%")
            if node.width > 0:
                props.append(f"width: {node.width}px")
                props.append(f"margin-left: -{node.width // 2}px")

        # Vertical positioning based on v_scale
        if params.v_scale == "fixed":
            if not is_root:
                props.append(f"top: {node.y}px")
            if node.height > 0:
                props.append(f"height: {node.height}px")
        elif params.v_scale == "stretch":
            if not is_root:
                props.append(f"top: {node.y}px")
            if node.height > 0:
                props.append(f"height: {node.height}px")
            props.append("/* v_scale: stretch */")
        elif params.v_scale == "move":
            if not is_root:
                props.append(f"top: {node.y}px")
            if node.height > 0:
                props.append(f"height: {node.height}px")
            props.append("/* v_scale: move (bottom-anchored) */")
        elif params.v_scale == "center":
            props.append("top: 50%")
            if node.height > 0:
                props.append(f"height: {node.height}px")
                props.append(f"margin-top: -{node.height // 2}px")

        # Size constraints
        if node.width_min is not None:
            props.append(f"min-width: {node.width_min}px")
        if node.width_max is not None:
            props.append(f"max-width: {node.width_max}px")
        if node.height_min is not None:
            props.append(f"min-height: {node.height_min}px")

        # Visibility
        if not node.visible:
            props.append("display: none")

        # Overflow clipping
        if params.clipping:
            props.append("overflow: hidden")

        # Background color
        if node.background and node.color is not None:
            css_color = _color_to_css(node.color)
            if css_color:
                props.append(f"background-color: {css_color}")

        # Skin-based background (9-slice border-image)
        if resolved.skin and resolved.states and not self._skip_slicing:
            self._generate_skin_css(props, resolved, node)

        # asset_uri images (static_bitmap, bitmap, icon elements with asset_uri variable)
        asset_uri = node.variables.get("asset_uri", "")
        if asset_uri and not asset_uri.startswith("${"):
            self._generate_asset_uri_css(props, node, asset_uri)

        # Text styling
        if node.tag in ("text", "label", "formatted_text", "link", "password", "input"):
            self._generate_text_css(props, node)

        # Drop shadow filter
        for filt in node.filters:
            ftype = filt.get("type", "")
            if ftype == "DropShadowFilter":
                import math
                distance = float(filt.get("distance", "4"))
                angle_deg = float(filt.get("angle", "45"))
                blur_x = filt.get("blurX", "4")
                alpha = filt.get("alpha", "0.35")
                try:
                    alpha_f = float(alpha)
                except ValueError:
                    alpha_f = 0.35
                # Flash angle: 0=right, 90=down; CSS: x-offset, y-offset
                angle_rad = angle_deg * math.pi / 180
                dx = round(distance * math.cos(angle_rad), 1)
                dy = round(distance * math.sin(angle_rad), 1)
                # Format as int if whole number
                dx_s = f"{int(dx)}" if dx == int(dx) else f"{dx}"
                dy_s = f"{int(dy)}" if dy == int(dy) else f"{dy}"
                props.append(f"box-shadow: {dx_s}px {dy_s}px {blur_x}px rgba(0,0,0,{alpha_f:.2f})")

        if not props:
            return ""

        lines = [f"{selector} {{"]
        for p in props:
            lines.append(f"  {p};")
        lines.append("}")

        return "\n".join(lines)

    # Composite widget types that should NOT render their parent skin as a background.
    # These are assembled from child components (track + buttons + lift) in Flash.
    _COMPOSITE_WIDGET_TYPES = {
        "scrollbar_vertical", "scrollbar_horizontal",
        "scrollbar_slider_track_vertical", "scrollbar_slider_track_horizontal",
        "scrollbar_slider_bar_vertical", "scrollbar_slider_bar_horizontal",
        "scrollbar_slider_button_up", "scrollbar_slider_button_down",
        "scrollbar_slider_button_left", "scrollbar_slider_button_right",
        "scrollable_itemlist_vertical", "scrollable_itemgrid_vertical",
        "tab_context",
    }

    def _generate_skin_css(
        self,
        props: list[str],
        resolved: ResolvedElement,
        node: LayoutNode,
    ) -> None:
        """Add skin background/border-image CSS properties."""
        # Skip composite widgets — their skin has no standalone visual
        if node.tag in self._COMPOSITE_WIDGET_TYPES:
            return

        skin = resolved.skin
        if skin is None:
            return

        atlas_path = resolve_atlas_path(skin.atlas_ref, self._assets_dir)
        desc = resolved.description

        # Slice default state
        default_state = None
        for state in resolved.states:
            if state.name == "default":
                default_state = state
                break
        if default_state is None and resolved.states:
            default_state = resolved.states[0]

        if default_state is None:
            return

        color = resolved.color
        sprites = slice_all_skin_states(
            skin, atlas_path, color, self._shared_assets_dir,
            name_prefix=desc.layout if desc and desc.layout else skin.name,
        )

        default_sprite = sprites.get("default") or sprites.get(default_state.name)
        if default_sprite is None:
            return

        rel_path = _relative_path(
            self._output_dir,  # Will be adjusted per-layout later
            default_sprite.path,
        )
        # Use shared assets path
        asset_rel = f"../../shared/assets/{default_sprite.path.name}"

        if default_sprite.border_top > 0 or default_sprite.border_left > 0:
            # Use border-image for 9-slice.
            # IMPORTANT: border-width must be 0 so that absolutely positioned children
            # remain relative to the element's edge (not offset by border area).
            # border-image-width provides the visual border without affecting layout.
            bt = default_sprite.border_top
            br = default_sprite.border_right
            bb = default_sprite.border_bottom
            bl = default_sprite.border_left
            props.append("border-style: solid")
            props.append("border-width: 0")
            props.append(f"border-image-source: url('{asset_rel}')")
            props.append(f"border-image-slice: {bt} {br} {bb} {bl} fill")
            props.append(f"border-image-width: {bt}px {br}px {bb}px {bl}px")
            props.append("border-image-repeat: stretch")
        else:
            # Simple fixed-size sprite (checkbox, radio, icon)
            props.append(f"background-image: url('{asset_rel}')")
            props.append(f"background-size: {default_sprite.width}px {default_sprite.height}px")
            props.append("background-repeat: no-repeat")
            props.append("background-position: center")

    def _generate_asset_uri_css(
        self,
        props: list[str],
        node: LayoutNode,
        asset_uri: str,
    ) -> None:
        """Add background-image CSS for elements with asset_uri variable."""
        source_path = _resolve_asset_path(self._assets_dir, asset_uri)

        if source_path is None:
            return

        # Copy to shared assets if not already there
        dest_path = self._shared_assets_dir / source_path.name
        if not dest_path.exists():
            shutil.copy2(source_path, dest_path)

        asset_rel = f"../../shared/assets/{source_path.name}"
        stretched_x = node.variables.get("stretched_x", "true").lower() == "true"
        stretched_y = node.variables.get("stretched_y", "true").lower() == "true"
        fit_to_contents = node.variables.get("fit_size_to_contents", "false").lower() == "true"
        if fit_to_contents:
            stretched_x = False
            stretched_y = False

        props.append(f"background-image: url('{asset_rel}')")
        if stretched_x and stretched_y:
            props.append("background-size: 100% 100%")
        elif stretched_x:
            props.append("background-size: 100% auto")
            props.append("background-repeat: no-repeat")
            props.append("background-position: center")
        elif stretched_y:
            props.append("background-size: auto 100%")
            props.append("background-repeat: no-repeat")
            props.append("background-position: center")
        else:
            props.append("background-size: auto")
            props.append("background-repeat: no-repeat")
            props.append("background-position: center")
            if fit_to_contents:
                size = _get_image_size(source_path)
                if size:
                    props.append(f"width: {size[0]}px")
                    props.append(f"height: {size[1]}px")

    def _generate_text_css(self, props: list[str], node: LayoutNode) -> None:
        """Add text styling CSS properties."""
        text_style_name = node.variables.get("text_style", "")
        style: TextStyle | None = None

        if text_style_name and text_style_name in self._text_styles:
            style = self._text_styles[text_style_name]
        elif node.tag in ("label",):
            style = self._text_styles.get("button_regular")

        if style:
            props.append(f"font-family: '{style.font_family}', sans-serif")
            props.append(f"font-size: {style.font_size}px")
            if style.font_weight:
                props.append(f"font-weight: {style.font_weight}")
            if style.font_style:
                props.append(f"font-style: {style.font_style}")
            if style.color:
                props.append(f"color: {style.color}")
            if style.text_decoration:
                props.append(f"text-decoration: {style.text_decoration}")

        # Inline font overrides from variables
        font_face = node.variables.get("font_face")
        font_size = node.variables.get("font_size")
        if font_face:
            props.append(f"font-family: '{font_face}', sans-serif")
        if font_size:
            props.append(f"font-size: {font_size}px")

        # Auto size (text alignment)
        auto_size = node.variables.get("auto_size", "")
        if auto_size == "center":
            props.append("text-align: center")
        elif auto_size == "right":
            props.append("text-align: right")
        elif auto_size == "left":
            props.append("text-align: left")

        # Margins -> padding to keep node dimensions while offsetting text
        def _pad(name: str, css: str) -> None:
            val = node.variables.get(name)
            if val is None:
                return
            try:
                num = float(val)
            except ValueError:
                return
            props.append(f"{css}: {num:g}px")

        _pad("margin_top", "padding-top")
        _pad("margin_bottom", "padding-bottom")
        _pad("margin_left", "padding-left")
        _pad("margin_right", "padding-right")

        # Color from node
        if node.color is not None:
            css_color = _color_to_css(node.color)
            if css_color:
                props.append(f"color: {css_color}")


_FONT_RENAME_MAP: list[tuple[str, str]] = [
    # Order matters: longer/more-specific patterns first
    ("ubuntu_bold_italic", "Ubuntu-ib.ttf"),
    ("ubuntu_thick_bold", "Ubuntu-thick-b.ttf"),
    ("ubuntu_condensed", "Ubuntu-C.ttf"),
    ("ubuntu_regular", "Ubuntu.ttf"),
    ("ubuntu_medium", "Ubuntu-m.ttf"),
    ("ubuntu_italic", "Ubuntu-i.ttf"),
    ("ubuntu_bold", "Ubuntu-b.ttf"),
    ("volterb", "Volter Bold.ttf"),
    ("volter", "Volter.ttf"),
]


def _copy_fonts(font_dirs: list[Path], output_fonts_dir: Path) -> bool:
    """Copy font files from multiple directories to output with normalized names."""
    output_fonts_dir.mkdir(parents=True, exist_ok=True)
    found = False
    for font_dir in font_dirs:
        if not font_dir.exists():
            continue
        for font_file in font_dir.glob("*.ttf"):
            # Try to rename Habbo-prefixed fonts to short names
            fname_lower = font_file.stem.lower()
            dest_name = None
            for key, short_name in _FONT_RENAME_MAP:
                if key in fname_lower:
                    dest_name = short_name
                    break
            if dest_name is None:
                dest_name = font_file.name
            # Skip duplicates (e.g. HabboLoaderUI and HabboHabboWindowManagerCom have the same fonts)
            dest_path = output_fonts_dir / dest_name
            if not dest_path.exists():
                shutil.copy2(font_file, dest_path)
            found = True
        for font_file in font_dir.glob("*.woff*"):
            dest_path = output_fonts_dir / font_file.name
            if not dest_path.exists():
                shutil.copy2(font_file, dest_path)
            found = True
    return found


def render_base_css(
    output_dir: Path,
    text_styles: dict[str, TextStyle],
    font_dirs: list[Path] | None = None,
) -> None:
    """Generate the shared base.css file."""
    shared_dir = output_dir / "shared"
    shared_dir.mkdir(parents=True, exist_ok=True)

    # Copy fonts if available
    fonts_dir = shared_dir / "fonts"
    has_local_fonts = False
    if font_dirs:
        has_local_fonts = _copy_fonts(font_dirs, fonts_dir)

    lines: list[str] = [
        "/* Flash Layout Preview - Base CSS */",
        "/* Auto-generated by flash2html */",
        "",
        "* { margin: 0; padding: 0; box-sizing: border-box; }",
        "",
    ]

    # Font declarations
    if has_local_fonts:
        lines.extend([
            "/* Habbo Ubuntu fonts (custom build, not Google Ubuntu) */",
            "@font-face { font-family: 'Ubuntu'; src: url('fonts/Ubuntu.ttf'); font-weight: normal; font-style: normal; }",
            "@font-face { font-family: 'Ubuntu'; src: url('fonts/Ubuntu-b.ttf'); font-weight: bold; font-style: normal; }",
            "@font-face { font-family: 'Ubuntu'; src: url('fonts/Ubuntu-i.ttf'); font-weight: normal; font-style: italic; }",
            "@font-face { font-family: 'Ubuntu'; src: url('fonts/Ubuntu-ib.ttf'); font-weight: bold; font-style: italic; }",
            "@font-face { font-family: 'Ubuntu'; src: url('fonts/Ubuntu-m.ttf'); font-weight: 500; font-style: normal; }",
            "@font-face { font-family: 'UbuntuCondensed'; src: url('fonts/Ubuntu-C.ttf'); font-weight: normal; font-style: normal; }",
            "",
            "/* Habbo Volter pixel font */",
            "@font-face { font-family: 'Volter'; src: url('fonts/Volter.ttf'); font-weight: normal; font-style: normal; }",
            "@font-face { font-family: 'Volter'; src: url('fonts/Volter Bold.ttf'); font-weight: bold; font-style: normal; }",
            "/* Legacy: Volter Bold as separate family for backwards compatibility */",
            "@font-face { font-family: 'Volter Bold'; src: url('fonts/Volter Bold.ttf'); font-weight: normal; font-style: normal; }",
            "",
        ])
    else:
        lines.extend([
            "/* Fallback: Google Ubuntu (not identical to Habbo's custom build) */",
            "@import url('https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,400;0,700;1,400;1,700&display=swap');",
            "",
        ])

    lines.extend([
        "body {",
        "  font-family: 'Ubuntu', sans-serif;",
        "  font-size: 12px;",
        "  background: #e0e0e0;",
        "  padding: 20px;",
        "}",
        "",
        ".flash-preview {",
        "  position: relative;",
        "  margin: 20px auto;",
        "  background: transparent;",
        "}",
        "",
        "/* Element type defaults */",
        "",
        ".hwm-frame { position: relative; overflow: hidden; }",
        ".hwm-container { position: absolute; overflow: visible; }",
        ".hwm-button { position: absolute; cursor: pointer; }",
        ".hwm-text { position: absolute; overflow: hidden; }",
        ".hwm-label { position: absolute; }",
        ".hwm-border { position: absolute; }",
        ".hwm-header { position: absolute; cursor: move; }",
        ".hwm-tab_context { position: absolute; }",
        ".hwm-tab_button { position: absolute; cursor: pointer; }",
        ".hwm-tab_content { position: absolute; }",
        ".hwm-itemlist { position: absolute; overflow: hidden; }",
        ".hwm-input { position: absolute; }",
        ".hwm-icon { position: absolute; }",
        ".hwm-bitmap { position: absolute; }",
        ".hwm-static_bitmap { position: absolute; }",
        ".hwm-scaler { position: absolute; cursor: nwse-resize; }",
        ".hwm-closebutton { position: absolute; cursor: pointer; }",
        ".hwm-dropmenu { position: absolute; }",
        ".hwm-dropmenu_item { position: absolute; }",
        ".hwm-droplist { position: absolute; }",
        ".hwm-radiobutton { position: absolute; cursor: pointer; }",
        ".hwm-checkbox { position: absolute; cursor: pointer; }",
        ".hwm-container_button { position: absolute; cursor: pointer; }",
        ".hwm-formatted_text { position: absolute; overflow: hidden; }",
        ".hwm-link { position: absolute; cursor: pointer; text-decoration: underline; }",
        ".hwm-password { position: absolute; }",
        "",
        "/* Scrollbar styling (composite widgets — not rendered from atlas) */",
        ".hwm-scrollbar_vertical {",
        "  position: absolute;",
        "  background: #c8c8c8;",
        "  border: 1px solid #a0a0a0;",
        "  border-radius: 2px;",
        "}",
        ".hwm-scrollbar_horizontal {",
        "  position: absolute;",
        "  background: #c8c8c8;",
        "  border: 1px solid #a0a0a0;",
        "  border-radius: 2px;",
        "}",
        "",
        ".hwm-caption {",
        "  display: block;",
        "  padding: 2px 4px;",
        "  white-space: nowrap;",
        "  overflow: hidden;",
        "  text-overflow: ellipsis;",
        "  user-select: none;",
        "}",
        "",
        "[data-hidden='true'] { display: none; }",
        "",
    ])

    # Generate text style classes
    lines.append("/* Text styles from text_styles_css.bin */")
    lines.append("")
    for name, style in sorted(text_styles.items()):
        lines.append(f".text-style-{name} {{")
        lines.append(f"  font-family: '{style.font_family}', sans-serif;")
        lines.append(f"  font-size: {style.font_size}px;")
        if style.font_weight:
            lines.append(f"  font-weight: {style.font_weight};")
        if style.font_style:
            lines.append(f"  font-style: {style.font_style};")
        if style.color:
            lines.append(f"  color: {style.color};")
        if style.text_decoration:
            lines.append(f"  text-decoration: {style.text_decoration};")
        lines.append("}")
        lines.append("")

    (shared_dir / "base.css").write_text("\n".join(lines), encoding="utf-8")


def render_master_index(
    output_dir: Path,
    layouts_by_module: dict[str, list[tuple[str, Path]]],
) -> Path:
    """Generate the master index.html with links to all layouts."""
    total_count = sum(len(v) for v in layouts_by_module.values())

    parts: list[str] = [
        "<!DOCTYPE html>",
        "<html>",
        "<head>",
        "  <meta charset=\"utf-8\">",
        "  <title>Flash Layout Browser</title>",
        "  <style>",
        "    * { margin: 0; padding: 0; box-sizing: border-box; }",
        "    body { font-family: 'Ubuntu', Arial, sans-serif; background: #1a1a2e; color: #eee; padding: 20px; }",
        "    h1 { margin-bottom: 10px; color: #e94560; }",
        "    .stats { color: #888; margin-bottom: 30px; }",
        "    .module { margin-bottom: 24px; }",
        "    .module h2 { color: #0f3460; background: #16213e; padding: 8px 14px; border-radius: 4px; margin-bottom: 8px; color: #e94560; }",
        "    .module h2 span { color: #888; font-size: 14px; font-weight: normal; }",
        "    .layout-grid { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 14px; }",
        "    .layout-grid a { color: #a8d8ea; text-decoration: none; font-size: 13px; padding: 3px 8px; background: #16213e; border-radius: 3px; }",
        "    .layout-grid a:hover { background: #0f3460; color: #fff; }",
        "    .search { margin-bottom: 20px; }",
        "    .search input { padding: 8px 14px; width: 400px; font-size: 14px; border: 1px solid #333; border-radius: 4px; background: #16213e; color: #eee; }",
        "  </style>",
        "</head>",
        "<body>",
        "  <h1>Flash Layout Browser</h1>",
        f"  <p class=\"stats\">{total_count} layouts across {len(layouts_by_module)} modules</p>",
        "  <div class=\"search\"><input type=\"text\" id=\"filter\" placeholder=\"Filter layouts...\" oninput=\"filterLayouts()\"></div>",
    ]

    for module_name in sorted(layouts_by_module.keys()):
        layout_list = sorted(layouts_by_module[module_name], key=lambda x: x[0])
        parts.append(f"  <div class=\"module\" data-module=\"{module_name}\">")
        parts.append(f"    <h2>{module_name} <span>({len(layout_list)} layouts)</span></h2>")
        parts.append("    <div class=\"layout-grid\">")
        for name, path in layout_list:
            rel = str(path.relative_to(output_dir)).replace("\\", "/")
            parts.append(f"      <a href=\"{rel}\" data-layout=\"{name.lower()}\">{_escape(name)}</a>")
        parts.append("    </div>")
        parts.append("  </div>")

    parts.extend([
        "  <script>",
        "    function filterLayouts() {",
        "      const q = document.getElementById('filter').value.toLowerCase();",
        "      document.querySelectorAll('.module').forEach(m => {",
        "        let visible = 0;",
        "        m.querySelectorAll('a').forEach(a => {",
        "          const show = a.dataset.layout.includes(q) || m.dataset.module.includes(q);",
        "          a.style.display = show ? '' : 'none';",
        "          if (show) visible++;",
        "        });",
        "        m.style.display = visible > 0 || !q ? '' : 'none';",
        "      });",
        "    }",
        "  </script>",
        "</body>",
        "</html>",
    ])

    index_path = output_dir / "index.html"
    index_path.write_text("\n".join(parts), encoding="utf-8")
    return index_path


def _build_page(
    title: str,
    css: str,
    body: str,
    preview_w: int,
    preview_h: int,
    shared_css_path: str,
) -> str:
    """Build a complete HTML page."""
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{_escape(title)}</title>
  <link rel="stylesheet" href="{shared_css_path}">
  <style>
{css}
  </style>
</head>
<body>
  <div class="flash-preview" style="width:{preview_w}px; height:{preview_h}px;">
{body}
  </div>
</body>
</html>
"""


def _relative_path(from_dir: Path, to_path: Path) -> str:
    """Calculate relative path from from_dir to to_path as a string with forward slashes."""
    try:
        rel = to_path.relative_to(from_dir)
        return str(rel).replace("\\", "/")
    except ValueError:
        # Different roots, use os.path.relpath
        try:
            import os
            rel = os.path.relpath(to_path, from_dir)
            return rel.replace("\\", "/")
        except ValueError:
            return str(to_path).replace("\\", "/")
