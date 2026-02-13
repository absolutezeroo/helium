#!/usr/bin/env python3
"""
Flash binaryData -> HTML/CSS Converter

Parses Habbo Flash client XML layout files and generates HTML/CSS preview pages.

Usage:
    python tools/flash2html/main.py
    python tools/flash2html/main.py --filter "HabboHabboNavigatorCom_*"
    python tools/flash2html/main.py --theme ubuntu --verbose
"""

from __future__ import annotations

import argparse
import fnmatch
import sys
import time
from pathlib import Path

from models import ModuleLayout
from parsers import (
    parse_all_module_layouts,
    parse_all_skins,
    parse_all_window_layouts,
    parse_element_registry,
    parse_text_styles,
)
from renderer import (
    HtmlRenderer,
    load_external_texts,
    render_base_css,
    render_master_index,
    to_snake_case,
)
from resolver import ElementResolver
from slicer import clear_cache


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert Flash binaryData XML layouts to HTML/CSS previews."
    )
    parser.add_argument(
        "--binary-dir",
        type=Path,
        default=Path("sources/win63_2021_version/binaryData"),
        help="Path to binaryData directory containing .bin XML files",
    )
    parser.add_argument(
        "--assets-dir",
        type=Path,
        default=Path("packages/helium-client/src/assets/images"),
        help="Path to atlas PNG images directory",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("tools/flash2html/output"),
        help="Output directory for generated HTML/CSS",
    )
    parser.add_argument(
        "--theme",
        choices=["ubuntu", "volter", "illumina_light", "illumina_dark"],
        default="ubuntu",
        help="UI theme (default: ubuntu)",
    )
    parser.add_argument(
        "--filter",
        type=str,
        default=None,
        help="Glob pattern to filter files (e.g. 'HabboHabboNavigatorCom_*')",
    )
    parser.add_argument(
        "--skip-slicing",
        action="store_true",
        help="Skip atlas slicing, reuse existing assets",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging",
    )

    args = parser.parse_args()

    binary_dir: Path = args.binary_dir
    assets_dir: Path = args.assets_dir
    output_dir: Path = args.output_dir
    verbose: bool = args.verbose

    # Validate input paths
    if not binary_dir.exists():
        print(f"ERROR: Binary data directory not found: {binary_dir}")
        return 1
    if not assets_dir.exists():
        print(f"ERROR: Assets directory not found: {assets_dir}")
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)

    t0 = time.time()

    # =========================================================================
    # Stage 1: Parse all data sources
    # =========================================================================
    print("=" * 60)
    print("Stage 1: Parsing XML data")
    print("=" * 60)

    # 1a. Element registry
    registry_path = binary_dir / "HabboHabboWindowManagerCom_habbo_element_description_xml.bin"
    if not registry_path.exists():
        print(f"ERROR: Element registry not found: {registry_path}")
        return 1

    print(f"  Parsing element registry...")
    registry = parse_element_registry(registry_path)
    print(f"    -> {len(registry)} element descriptions")

    # 1b. Skins
    print(f"  Parsing skin files...")
    skins = parse_all_skins(binary_dir)
    print(f"    -> {len(skins)} skins")

    # 1c. Window layouts
    print(f"  Parsing window layouts...")
    window_layouts = parse_all_window_layouts(binary_dir)
    print(f"    -> {len(window_layouts)} window layouts")

    # 1d. Text styles
    text_styles_path = binary_dir / "HabboHabboWindowManagerCom_text_styles_css.bin"
    text_styles = {}
    if text_styles_path.exists():
        print(f"  Parsing text styles...")
        text_styles = parse_text_styles(text_styles_path)
        print(f"    -> {len(text_styles)} text styles")

    # 1e. External texts
    external_texts_path = Path("tools/flash2html/ExternalTexts.json")
    external_texts = {}
    if external_texts_path.exists():
        print(f"  Loading external texts...")
        external_texts = load_external_texts(external_texts_path)
        print(f"    -> {len(external_texts)} text entries")
    else:
        print(f"  Warning: ExternalTexts.json not found at {external_texts_path}")

    # 1f. Module layouts
    print(f"  Parsing module layouts...")
    all_layouts = parse_all_module_layouts(binary_dir)
    print(f"    -> {len(all_layouts)} module layouts")

    # Apply filter
    if args.filter:
        before = len(all_layouts)
        all_layouts = [
            l for l in all_layouts
            if fnmatch.fnmatch(l.filename, args.filter)
        ]
        print(f"    -> Filtered to {len(all_layouts)} layouts (from {before}) matching '{args.filter}'")

    t1 = time.time()
    print(f"\n  Parsing completed in {t1 - t0:.2f}s")

    # =========================================================================
    # Stage 2: Resolve elements
    # =========================================================================
    print()
    print("=" * 60)
    print("Stage 2: Resolving elements")
    print("=" * 60)

    resolver = ElementResolver(registry, skins, window_layouts)
    print(f"  Resolver initialized with {len(registry)} elements, {len(skins)} skins, {len(window_layouts)} window layouts")

    # =========================================================================
    # Stage 3: Generate shared assets
    # =========================================================================
    print()
    print("=" * 60)
    print("Stage 3: Generating shared assets")
    print("=" * 60)

    if not args.skip_slicing:
        clear_cache()
        shared_assets_dir = output_dir / "shared" / "assets"
        shared_assets_dir.mkdir(parents=True, exist_ok=True)
        print(f"  Assets will be written to {shared_assets_dir}")
    else:
        print("  Skipping atlas slicing (--skip-slicing)")

    # Generate base CSS with local fonts
    fonts_dir = binary_dir.parent / "fonts"
    font_dirs = []
    if fonts_dir.exists():
        font_dirs.append(fonts_dir)
    render_base_css(output_dir, text_styles, font_dirs=font_dirs)
    if font_dirs:
        print(f"  Copied local fonts from {fonts_dir}")
    print(f"  Generated shared/base.css")

    t2 = time.time()

    # =========================================================================
    # Stage 4: Render HTML pages
    # =========================================================================
    print()
    print("=" * 60)
    print("Stage 4: Rendering HTML pages")
    print("=" * 60)

    renderer = HtmlRenderer(
        resolver=resolver,
        text_styles=text_styles,
        assets_dir=assets_dir,
        output_dir=output_dir,
        skip_slicing=args.skip_slicing,
        verbose=verbose,
        external_texts=external_texts,
    )

    layouts_by_module: dict[str, list[tuple[str, Path]]] = {}
    success_count = 0
    error_count = 0

    for i, layout in enumerate(all_layouts):
        if verbose:
            print(f"  [{i + 1}/{len(all_layouts)}] {layout.module}/{layout.layout_name}")

        try:
            output_path = renderer.render_module_layout(layout)
            if output_path:
                # Normalize module and layout names for consistent indexing
                normalized_module = to_snake_case(layout.module)
                normalized_layout = to_snake_case(layout.layout_name)
                if normalized_module not in layouts_by_module:
                    layouts_by_module[normalized_module] = []
                layouts_by_module[normalized_module].append((normalized_layout, output_path))
                success_count += 1
            else:
                error_count += 1
        except Exception as e:
            error_count += 1
            if verbose:
                print(f"    ERROR: {e}")

    print(f"\n  Rendered {success_count} layouts ({error_count} errors)")

    # =========================================================================
    # Stage 5: Generate master index
    # =========================================================================
    print()
    print("=" * 60)
    print("Stage 5: Generating master index")
    print("=" * 60)

    index_path = render_master_index(output_dir, layouts_by_module)
    print(f"  Generated {index_path}")

    t3 = time.time()

    # =========================================================================
    # Summary
    # =========================================================================
    print()
    print("=" * 60)
    print("Complete!")
    print("=" * 60)
    print(f"  Layouts: {success_count} rendered, {error_count} errors")
    print(f"  Modules: {len(layouts_by_module)}")
    print(f"  Time: {t3 - t0:.2f}s total ({t1 - t0:.2f}s parse, {t3 - t2:.2f}s render)")
    print(f"  Output: {output_dir}")
    print(f"  Open:   {index_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
