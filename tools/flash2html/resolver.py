"""
Element resolution and parameter decoding.

Resolves (type, style) → skin/layout and decodes integer bitmask parameters.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from models import (
    ElementDescription,
    LayoutNode,
    ParamFlags,
    Skin,
    SkinState,
    WindowLayout,
)


# ---------------------------------------------------------------------------
# Parameter bitmask decoder (HabboWindowParam.as)
# ---------------------------------------------------------------------------

# Named param → bitmask value mapping
NAMED_PARAMS: dict[str, int] = {
    "relative_horizontal_scale_fixed": 0,
    "relative_horizontal_scale_move": 64,
    "relative_horizontal_scale_strech": 128,
    "relative_horizontal_scale_center": 192,
    "relative_vertical_scale_fixed": 0,
    "relative_vertical_scale_move": 1024,
    "relative_vertical_scale_strech": 2048,
    "relative_vertical_scale_center": 3072,
    "input_event_processor": 1,
    "use_parent_graphic_context": 16,
    "mouse_dragging_trigger": 32768,
    "bound_to_parent_rect": 8192,
    "inherit_caption": 131072,
    "reflect_resize_to_parent": 4096,
    "force_clipping": 1073741824,
}


def decode_params(value: int) -> ParamFlags:
    """Decode an integer bitmask into ParamFlags."""
    h_bits = value & 192  # bits 6-7
    v_bits = value & 3072  # bits 10-11

    h_scale_map = {0: "fixed", 64: "move", 128: "stretch", 192: "center"}
    v_scale_map = {0: "fixed", 1024: "move", 2048: "stretch", 3072: "center"}

    return ParamFlags(
        h_scale=h_scale_map.get(h_bits, "fixed"),
        v_scale=v_scale_map.get(v_bits, "fixed"),
        draggable=bool(value & 32768),
        clipping=bool(value & 1073741824),
        input_event=bool(value & 1),
        use_parent_gc=bool(value & 16),
        bound_to_parent=bool(value & 8192),
        inherit_caption=bool(value & 131072),
        reflect_resize=bool(value & 4096),
        raw=value,
    )


def named_params_to_int(param_names: list[str]) -> int:
    """Convert a list of named params to an integer bitmask."""
    result = 0
    for name in param_names:
        result |= NAMED_PARAMS.get(name, 0)
    return result


# ---------------------------------------------------------------------------
# Asset name → file path mapping
# ---------------------------------------------------------------------------

# Flash asset name → actual PNG filename mapping
ATLAS_NAME_MAP: dict[str, str] = {
    "habbo_skin_ubuntu_png": "skin_ubuntu.png",
    "habbo_blue_skin_png": "blue_skin.png",
    "habbo_skin_illumina_light_png": "skin_illumina_light.png",
    "habbo_skin_illumina_dark_png": "skin_illumina_dark.png",
    "habbo_skin_ubuntu_bg_9_png": "skin_ubuntu_bg_9.png",
}


def resolve_atlas_path(atlas_ref: str, assets_dir: Path) -> Path | None:
    """
    Resolve a Flash atlas reference to a file path.

    Tries the known mapping first, then heuristic fallbacks.
    """
    if not atlas_ref:
        return None

    if atlas_ref in ATLAS_NAME_MAP:
        p = assets_dir / ATLAS_NAME_MAP[atlas_ref]
        if p.exists() and p.is_file():
            return p

    # Heuristic: strip "habbo_" prefix and replace trailing "_png" with ".png"
    name = atlas_ref
    if name.startswith("habbo_"):
        name = name[6:]
    if name.endswith("_png"):
        name = name[:-4] + ".png"
    else:
        # No _png suffix: try appending .png directly
        name = name + ".png"

    if not name or name == ".png":
        return None

    p = assets_dir / name
    if p.exists() and p.is_file():
        return p

    # Try with dashes
    name2 = name.replace("_", "-")
    p2 = assets_dir / name2
    if p2.exists() and p2.is_file():
        return p2

    return None


def resolve_skin_filename(asset_name: str) -> str:
    """
    Convert a skin asset name to its binaryData filename.

    habbo_skin_frame_3_xml → HabboHabboWindowManagerCom_habbo_skin_frame_3_xml.bin
    illumina_dark_skin_frame_xml → HabboHabboWindowManagerCom_illumina_dark_skin_frame_xml.bin
    """
    return f"HabboHabboWindowManagerCom_{asset_name}.bin"


def resolve_window_layout_filename(wl_name: str) -> str:
    """
    Convert a window layout asset name to its binaryData filename.

    habbo_window_layout_frame_xml → HabboHabboWindowManagerCom_habbo_window_layout_frame_xml.bin
    """
    return f"HabboHabboWindowManagerCom_{wl_name}.bin"


# ---------------------------------------------------------------------------
# Element Resolution
# ---------------------------------------------------------------------------

@dataclass
class ResolvedElement:
    """Result of resolving a layout node's element description."""
    description: ElementDescription | None = None
    skin: Skin | None = None
    window_layout: WindowLayout | None = None
    params: ParamFlags = field(default_factory=ParamFlags)
    color: int | None = None
    states: list[SkinState] = field(default_factory=list)


class ElementResolver:
    """Resolves layout node (type, style) to full element descriptions."""

    def __init__(
        self,
        registry: dict[tuple[str, int], ElementDescription],
        skins: dict[str, Skin],
        window_layouts: dict[str, WindowLayout],
    ):
        self._registry = registry
        self._skins = skins
        self._window_layouts = window_layouts

    def resolve(self, node: LayoutNode) -> ResolvedElement:
        """Resolve a layout node to its element description, skin, and window layout."""
        result = ResolvedElement()
        result.params = decode_params(node.params)

        # Look up element in registry
        key = (node.tag, node.style)
        desc = self._registry.get(key)
        if desc is None:
            # Fallback to style 0
            desc = self._registry.get((node.tag, 0))
        result.description = desc

        if desc is None:
            return result

        # Resolve color: node color overrides element default
        result.color = node.color if node.color is not None else desc.color

        # Resolve skin
        if desc.asset and desc.asset in self._skins:
            result.skin = self._skins[desc.asset]
            # Collect states from skin, or from element description overrides
            if desc.states:
                result.states = desc.states
            elif result.skin.states:
                result.states = result.skin.states

        # Resolve window layout
        if desc.window_layout and desc.window_layout in self._window_layouts:
            result.window_layout = self._window_layouts[desc.window_layout]

        return result

    def resolve_by_type_style(self, type_str: str, style: int) -> ResolvedElement:
        """Resolve directly by type and style."""
        node = LayoutNode(tag=type_str, style=style)
        return self.resolve(node)
