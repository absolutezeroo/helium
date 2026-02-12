"""Parsers for Flash binaryData XML files."""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import unquote

from models import (
    ElementDescription,
    LayoutNode,
    ModuleLayout,
    Rectangle,
    Skin,
    SkinEntity,
    SkinState,
    TextStyle,
    WindowLayout,
    WindowLayoutChild,
)


def _parse_int(value: str | None, default: int = 0) -> int:
    """Parse an integer from a string, handling hex (0x...) and decimal."""
    if value is None:
        return default
    value = value.strip()
    if not value:
        return default
    try:
        if value.startswith("0x") or value.startswith("0X"):
            return int(value, 16)
        return int(value)
    except ValueError:
        try:
            return int(float(value))
        except ValueError:
            return default


def _parse_color(value: str | None) -> int | None:
    """Parse a color value (0xAARRGGBB or 0xRRGGBB) → integer."""
    if value is None:
        return None
    value = value.strip()
    if not value:
        return None
    try:
        if value.startswith("0x") or value.startswith("0X"):
            return int(value, 16)
        if value.startswith("#"):
            return int("0xff" + value[1:], 16)
        return int(value)
    except ValueError:
        return None


def _parse_rect(elem: ET.Element) -> Rectangle:
    """Parse a <Rectangle x= y= width= height= /> element."""
    return Rectangle(
        x=_parse_int(elem.get("x")),
        y=_parse_int(elem.get("y")),
        width=_parse_int(elem.get("width")),
        height=_parse_int(elem.get("height")),
    )


def _decode_caption(raw: str | None) -> str | None:
    """URL-decode a caption string (%24%7B...%7D → ${...})."""
    if raw is None:
        return None
    return unquote(raw)


# ---------------------------------------------------------------------------
# 1. Element Registry Parser
# ---------------------------------------------------------------------------

def parse_element_registry(filepath: Path) -> dict[tuple[str, int], ElementDescription]:
    """
    Parse the element description XML file.

    Returns dict keyed by (type, style) → ElementDescription.
    """
    registry: dict[tuple[str, int], ElementDescription] = {}

    tree = ET.parse(filepath)
    root = tree.getroot()

    for win_elem in root.findall("window"):
        elem_type = win_elem.get("type", "")
        style = _parse_int(win_elem.get("style"))

        states: list[SkinState] | None = None
        states_elem = win_elem.find("states")
        if states_elem is not None:
            states = []
            for state_el in states_elem.findall("state"):
                states.append(SkinState(
                    name=state_el.get("name", ""),
                    layout_name=state_el.get("layout", ""),
                    template_name=state_el.get("template", ""),
                ))

        desc = ElementDescription(
            type=elem_type,
            style=style,
            intent=win_elem.get("intent", "default"),
            renderer=win_elem.get("renderer", "null"),
            asset=win_elem.get("asset"),
            layout=win_elem.get("layout"),
            window_layout=win_elem.get("window_layout"),
            color=_parse_color(win_elem.get("color")),
            threshold=_parse_int(win_elem.get("treshold")) if win_elem.get("treshold") else None,
            background=win_elem.get("background", "false").lower() == "true",
            states=states,
        )

        registry[(elem_type, style)] = desc

    return registry


# ---------------------------------------------------------------------------
# 2. Skin Parser
# ---------------------------------------------------------------------------

def parse_skin(filepath: Path) -> Skin:
    """Parse a skin XML file (habbo_skin_*_xml.bin)."""
    tree = ET.parse(filepath)
    root = tree.getroot()

    skin = Skin(name=root.get("name", ""))

    # Variables (atlas reference)
    variables_elem = root.find("variables")
    if variables_elem is not None:
        for var_elem in variables_elem.findall("variable"):
            if var_elem.get("key") == "asset":
                skin.atlas_ref = var_elem.get("value", "")

    # States
    states_elem = root.find("states")
    if states_elem is not None:
        for state_el in states_elem.findall("state"):
            skin.states.append(SkinState(
                name=state_el.get("name", ""),
                layout_name=state_el.get("layout", ""),
                template_name=state_el.get("template", ""),
            ))

    # Templates (atlas source regions)
    templates_elem = root.find("templates")
    if templates_elem is not None:
        for tmpl_el in templates_elem.findall("template"):
            tmpl_name = tmpl_el.get("name", "")
            entities: list[SkinEntity] = []
            entities_elem = tmpl_el.find("entities")
            if entities_elem is not None:
                for ent_el in entities_elem.findall("entity"):
                    region = Rectangle()
                    region_wrap = ent_el.find("region")
                    if region_wrap is not None:
                        rect_el = region_wrap.find("Rectangle")
                        if rect_el is not None:
                            region = _parse_rect(rect_el)
                    entities.append(SkinEntity(
                        name=ent_el.get("name", ""),
                        region=region,
                    ))
            skin.templates[tmpl_name] = entities

    # Layouts (destination regions + scale modes)
    layouts_elem = root.find("layouts")
    if layouts_elem is not None:
        for layout_el in layouts_elem.findall("layout"):
            layout_name = layout_el.get("name", "")
            entities: list[SkinEntity] = []
            entities_elem = layout_el.find("entities")
            if entities_elem is not None:
                for ent_el in entities_elem.findall("entity"):
                    region = Rectangle()
                    region_wrap = ent_el.find("region")
                    if region_wrap is not None:
                        rect_el = region_wrap.find("Rectangle")
                        if rect_el is not None:
                            region = _parse_rect(rect_el)

                    scale_h = "fixed"
                    scale_v = "fixed"
                    scale_el = ent_el.find("scale")
                    if scale_el is not None:
                        scale_h = scale_el.get("horizontal", "fixed")
                        scale_v = scale_el.get("vertical", "fixed")

                    colorize = ent_el.get("colorize", "true").lower() != "false"

                    entities.append(SkinEntity(
                        name=ent_el.get("name", ""),
                        region=region,
                        scale_h=scale_h,
                        scale_v=scale_v,
                        colorize=colorize,
                        entity_id=_parse_int(ent_el.get("id")),
                    ))
            skin.layouts[layout_name] = entities

    return skin


def parse_all_skins(binary_dir: Path) -> dict[str, Skin]:
    """
    Parse all skin XML files from the binaryData directory.

    Returns dict keyed by the asset name (e.g. 'habbo_skin_frame_3_xml') → Skin.
    """
    skins: dict[str, Skin] = {}

    for filepath in sorted(binary_dir.glob("*skin_*_xml.bin")):
        # Extract the asset key from filename:
        # HabboHabboWindowManagerCom_habbo_skin_frame_3_xml.bin → habbo_skin_frame_3_xml
        # Also handle illumina_dark_skin_* and illumina_light_skin_*
        fname = filepath.stem  # remove .bin
        # The asset key is the part after the first underscore following the module prefix
        # Module prefix is like "HabboHabboWindowManagerCom_"
        parts = fname.split("_", 1)
        if len(parts) > 1:
            asset_key = parts[1]
        else:
            asset_key = fname

        # For files like HabboHabboWindowManagerCom_habbo_skin_frame_3_xml
        # asset_key = habbo_skin_frame_3_xml
        # For files like HabboHabboWindowManagerCom_illumina_dark_skin_frame_xml
        # asset_key = illumina_dark_skin_frame_xml

        try:
            skin = parse_skin(filepath)
            skins[asset_key] = skin
        except ET.ParseError as e:
            print(f"  [WARN] Failed to parse skin {filepath.name}: {e}")

    return skins


# ---------------------------------------------------------------------------
# 3. Module Layout Parser
# ---------------------------------------------------------------------------

def _parse_layout_node(elem: ET.Element) -> LayoutNode:
    """Recursively parse a layout node from XML."""
    node = LayoutNode(
        tag=elem.tag,
        name=elem.get("name"),
        x=_parse_int(elem.get("x")),
        y=_parse_int(elem.get("y")),
        width=_parse_int(elem.get("width")),
        height=_parse_int(elem.get("height")),
        params=_parse_int(elem.get("params")),
        style=_parse_int(elem.get("style")),
        caption=_decode_caption(elem.get("caption")),
        color=_parse_color(elem.get("color")),
        visible=elem.get("visible", "true").lower() != "false",
        tags=_decode_caption(elem.get("tags")),
        background=elem.get("background", "false").lower() == "true",
        id_attr=elem.get("id"),
        width_min=_parse_int(elem.get("width_min")) if elem.get("width_min") else None,
        width_max=_parse_int(elem.get("width_max")) if elem.get("width_max") else None,
        height_min=_parse_int(elem.get("height_min")) if elem.get("height_min") else None,
        height_max=_parse_int(elem.get("height_max")) if elem.get("height_max") else None,
    )

    # Variables
    variables_elem = elem.find("variables")
    if variables_elem is not None:
        for var_el in variables_elem.findall("var"):
            key = var_el.get("key", "")
            value = var_el.get("value", "")
            if key:
                node.variables[key] = value

    # Filters
    filters_elem = elem.find("filters")
    if filters_elem is not None:
        for filt_el in filters_elem:
            filt_dict = {"type": filt_el.tag}
            filt_dict.update(filt_el.attrib)
            node.filters.append(filt_dict)

    # Children
    children_elem = elem.find("children")
    if children_elem is not None:
        for child_el in children_elem:
            node.children.append(_parse_layout_node(child_el))

    return node


def parse_module_layout(filepath: Path) -> ModuleLayout | None:
    """Parse a module layout XML file."""
    try:
        tree = ET.parse(filepath)
    except ET.ParseError:
        return None

    root = tree.getroot()
    if root.tag != "layout":
        return None

    # Determine module from filename
    # HabboHabboNavigatorCom_grs_main_window_xml.bin → navigator
    fname = filepath.stem
    module = _extract_module_name(fname)

    layout = ModuleLayout(
        filename=filepath.name,
        module=module,
        layout_name=root.get("name", fname),
        width=_parse_int(root.get("width")),
        height=_parse_int(root.get("height")),
    )

    # The root <layout> has a <window> child that wraps the actual tree
    window_elem = root.find("window")
    if window_elem is not None and len(window_elem) > 0:
        # The first child of <window> is the root layout node
        layout.root = _parse_layout_node(window_elem[0])

    return layout


def _extract_module_name(filename: str) -> str:
    """
    Extract module name from filename.

    HabboHabboNavigatorCom_grs_main_window_xml → navigator
    HabboHabboCatalogCom_catalog_ubuntu_xml → catalog
    HabboHabboRoomUICom_room_vote_xml → room_ui
    HabboBCFloorPlanEditor_Habbofloor_plan_editor_xml → floor_plan_editor
    """
    # Common prefix patterns
    module_map = {
        "HabboHabboNavigatorCom": "navigator",
        "HabboHabboNewNavigatorCom": "new_navigator",
        "HabboHabboCatalogCom": "catalog",
        "HabboHabboRoomUICom": "room_ui",
        "HabboHabboFriendBarCom": "friend_bar",
        "HabboHabboFriendListCom": "friend_list",
        "HabboHabboInventoryCom": "inventory",
        "HabboHabboAvatarEditorCom": "avatar_editor",
        "HabboHabboToolbarCom": "toolbar",
        "HabboHabboWindowManagerCom": "window_manager",
        "HabboHabboModerationCom": "moderation",
        "HabboHabboQuestEngineCom": "quest_engine",
        "HabboHabboQuestsCom": "quests",
        "HabboHabboHelpCom": "help",
        "HabboHabboGroupsCom": "groups",
        "HabboHabboNotificationCom": "notification",
        "HabboHabboPollsCom": "polls",
        "HabboHabboAdManagerCom": "ad_manager",
        "HabboHabboCameraCom": "camera",
        "HabboHabboGameCom": "game",
        "HabboHabboMysteryBoxCom": "mystery_box",
        "HabboHabboTraxMachineCom": "trax_machine",
        "HabboHabboSoundMachineCom": "sound_machine",
        "HabboHabboPagesViewer": "pages_viewer",
        "HabboHabboFloorPlanEditor": "floor_plan_editor",
        "HabboBCFloorPlanEditor": "floor_plan_editor",
        "HabboHabboFreeFlowChatCom": "free_flow_chat",
        "HabboHabboInfobusCom": "infobus",
        "HabboHabboCompetitionCom": "competition",
        "HabboHabboWiredCom": "wired",
        "HabboHabboGuideToolCom": "guide_tool",
        "HabboHabboNuxCom": "nux",
        "HabboHabboCraftingCom": "crafting",
        "HabboHabboProfileCom": "profile",
        "HabboHabboAchievementsCom": "achievements",
    }

    for prefix, module in module_map.items():
        if filename.startswith(prefix):
            return module

    # Fallback: extract from CamelCase
    match = re.match(r"Habbo(?:Habbo|BC)(\w+?)(?:Com)?_", filename)
    if match:
        name = match.group(1)
        # Convert CamelCase to snake_case
        name = re.sub(r"(?<=[a-z])(?=[A-Z])", "_", name).lower()
        return name

    return "misc"


def parse_all_module_layouts(binary_dir: Path) -> list[ModuleLayout]:
    """
    Parse all module layout XML files from binaryData.

    Skips skin files, window_layout files, text_styles, manifest, etc.
    """
    layouts: list[ModuleLayout] = []
    skip_patterns = [
        "_skin_",
        "window_layout",
        "text_styles",
        "manifest_xml",
        "element_description",
        "_regpoints_",
        "_SafeStr_",
    ]

    for filepath in sorted(binary_dir.glob("*.bin")):
        fname = filepath.name
        if any(pattern in fname for pattern in skip_patterns):
            continue

        layout = parse_module_layout(filepath)
        if layout is not None and layout.root is not None:
            layouts.append(layout)

    return layouts


# ---------------------------------------------------------------------------
# 4. Window Layout Parser
# ---------------------------------------------------------------------------

def parse_window_layout(filepath: Path) -> WindowLayout | None:
    """Parse a window layout XML file (habbo_window_layout_*_xml.bin)."""
    try:
        tree = ET.parse(filepath)
    except ET.ParseError:
        return None

    root = tree.getroot()
    if root.tag != "layout":
        return None

    wl = WindowLayout(
        name=root.get("name", ""),
        width=_parse_int(root.get("width")),
        height=_parse_int(root.get("height")),
    )

    # Filters
    filters_elem = root.find("filters")
    if filters_elem is not None:
        for filt_el in filters_elem:
            filt_dict = {"type": filt_el.tag}
            filt_dict.update(filt_el.attrib)
            wl.filters.append(filt_dict)

    # Window children
    window_elem = root.find("window")
    if window_elem is not None:
        for child_el in window_elem:
            wlc = _parse_window_layout_child(child_el)
            wl.children.append(wlc)

    return wl


def _parse_window_layout_child(elem: ET.Element) -> WindowLayoutChild:
    """Parse a single child element within a window layout."""
    child = WindowLayoutChild(
        tag=elem.tag,
        name=elem.get("name", ""),
        style=_parse_int(elem.get("style")),
        x=_parse_int(elem.get("x")),
        y=_parse_int(elem.get("y")),
        width=_parse_int(elem.get("width")),
        height=_parse_int(elem.get("height")),
        visible=elem.get("visible", "true").lower() != "false",
        tags=elem.get("tags", ""),
    )

    # Params (named params in window layouts)
    params_elem = elem.find("params")
    if params_elem is not None:
        for param_el in params_elem.findall("param"):
            name = param_el.get("name", "")
            if name:
                child.params.append(name)

    # Variables
    variables_elem = elem.find("variables")
    if variables_elem is not None:
        for var_el in variables_elem.findall("var"):
            key = var_el.get("key", "")
            value = var_el.get("value", "")
            if key:
                child.variables[key] = value

    return child


def parse_all_window_layouts(binary_dir: Path) -> dict[str, WindowLayout]:
    """
    Parse all window layout XML files.

    Returns dict keyed by asset name (e.g. 'habbo_window_layout_frame_xml') → WindowLayout.
    """
    layouts: dict[str, WindowLayout] = {}

    for filepath in sorted(binary_dir.glob("*window_layout*_xml.bin")):
        fname = filepath.stem
        # Extract asset key
        parts = fname.split("_", 1)
        asset_key = parts[1] if len(parts) > 1 else fname

        wl = parse_window_layout(filepath)
        if wl is not None:
            layouts[asset_key] = wl

    return layouts


# ---------------------------------------------------------------------------
# 5. Text Styles Parser
# ---------------------------------------------------------------------------

def parse_text_styles(filepath: Path) -> dict[str, TextStyle]:
    """
    Parse text_styles_css.bin (Flash CSS format).

    Format:
        style_name {
            property: value;
            ...
        }
    """
    styles: dict[str, TextStyle] = {}

    text = filepath.read_text(encoding="utf-8")

    # Match: name { ... }
    pattern = re.compile(r"(\S+)\s*\{([^}]*)\}", re.MULTILINE)

    for match in pattern.finditer(text):
        name = match.group(1).strip()
        body = match.group(2)

        style = TextStyle(name=name)

        for line in body.split(";"):
            line = line.strip()
            if ":" not in line:
                continue
            prop, _, val = line.partition(":")
            prop = prop.strip()
            val = val.strip()

            if prop == "font-family":
                style.font_family = val
            elif prop == "font-size":
                try:
                    style.font_size = int(val)
                except ValueError:
                    pass
            elif prop == "font-weight":
                style.font_weight = val
            elif prop == "font-style":
                style.font_style = val
            elif prop == "color":
                style.color = val
            elif prop == "text-decoration":
                style.text_decoration = val
            elif prop == "etching-color":
                style.etching_color = val
            elif prop == "etching-position":
                style.etching_position = val

        styles[name] = style

    return styles
