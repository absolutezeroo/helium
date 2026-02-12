"""Data models for Flash binaryData → HTML/CSS converter."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Rectangle:
    """Rectangle with position and size."""
    x: int = 0
    y: int = 0
    width: int = 0
    height: int = 0


@dataclass
class ElementDescription:
    """Describes a window element type from the element registry."""
    type: str = ""
    style: int = 0
    intent: str = "default"
    renderer: str = "null"
    asset: str | None = None
    layout: str | None = None
    window_layout: str | None = None
    color: int | None = None
    threshold: int | None = None
    background: bool = False
    states: list[SkinState] | None = None


@dataclass
class SkinEntity:
    """A single entity within a skin template or layout."""
    name: str = ""
    region: Rectangle = field(default_factory=Rectangle)
    scale_h: str = "fixed"
    scale_v: str = "fixed"
    colorize: bool = True
    entity_id: int = 0


@dataclass
class SkinState:
    """Maps a state name to a layout and template."""
    name: str = ""
    layout_name: str = ""
    template_name: str = ""


@dataclass
class Skin:
    """Parsed skin with atlas reference, states, templates, and layouts."""
    name: str = ""
    atlas_ref: str = ""
    states: list[SkinState] = field(default_factory=list)
    templates: dict[str, list[SkinEntity]] = field(default_factory=dict)
    layouts: dict[str, list[SkinEntity]] = field(default_factory=dict)


@dataclass
class LayoutNode:
    """A node in a parsed module layout tree."""
    tag: str = ""
    name: str | None = None
    x: int = 0
    y: int = 0
    width: int = 0
    height: int = 0
    params: int = 0
    style: int = 0
    caption: str | None = None
    color: int | None = None
    visible: bool = True
    tags: str | None = None
    background: bool = False
    id_attr: str | None = None
    width_min: int | None = None
    width_max: int | None = None
    height_min: int | None = None
    height_max: int | None = None
    variables: dict[str, str] = field(default_factory=dict)
    filters: list[dict[str, str]] = field(default_factory=list)
    children: list[LayoutNode] = field(default_factory=list)


@dataclass
class WindowLayout:
    """A parsed window layout (button, frame, header, etc.) with child descriptors."""
    name: str = ""
    width: int = 0
    height: int = 0
    filters: list[dict[str, str]] = field(default_factory=list)
    children: list[WindowLayoutChild] = field(default_factory=list)


@dataclass
class WindowLayoutChild:
    """A child element within a window layout."""
    tag: str = ""
    name: str = ""
    style: int = 0
    x: int = 0
    y: int = 0
    width: int = 0
    height: int = 0
    visible: bool = True
    tags: str = ""
    params: list[str] = field(default_factory=list)
    variables: dict[str, str] = field(default_factory=dict)


@dataclass
class TextStyle:
    """A parsed text style from text_styles_css.bin."""
    name: str = ""
    font_family: str = "Ubuntu"
    font_size: int = 12
    font_weight: str | None = None
    font_style: str | None = None
    color: str | None = None
    text_decoration: str | None = None
    etching_color: str | None = None
    etching_position: str | None = None


@dataclass
class ModuleLayout:
    """A complete parsed module layout file."""
    filename: str = ""
    module: str = ""
    layout_name: str = ""
    width: int = 0
    height: int = 0
    root: LayoutNode | None = None


@dataclass
class ParamFlags:
    """Decoded parameter bitmask flags."""
    h_scale: str = "fixed"
    v_scale: str = "fixed"
    draggable: bool = False
    clipping: bool = False
    input_event: bool = False
    use_parent_gc: bool = False
    bound_to_parent: bool = False
    inherit_caption: bool = False
    reflect_resize: bool = False
    raw: int = 0
