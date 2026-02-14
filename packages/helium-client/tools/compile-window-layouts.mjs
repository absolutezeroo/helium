#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import zlib from 'node:zlib';
import {DOMParser} from '@xmldom/xmldom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const DEFAULT_INPUT = path.resolve(repoRoot, 'sources', 'win63_2021_version', 'binaryData');
const DEFAULT_OUTPUT = path.resolve(__dirname, '../src/assets/window-layouts');

/**
 * Element type name -> type ID mapping.
 * Must stay in sync with compile-window-skins.mjs TYPE_MAP.
 */
const TYPE_MAP =
{
    'null': 0, 'icon': 1, 'background': 2, 'container': 4, 'region': 5,
    'header': 6, 'toolbar': 7, 'tooltip': 8, 'notify': 9, 'text': 10,
    'html': 11, 'label': 12, 'link': 14, 'formatted_text': 15, 'widget': 16,
    'boxsizer': 17, 'display_object_wrapper': 20, 'bitmap': 21,
    'shape_wrapper': 22, 'static_bitmap': 23, 'border': 30, 'border_thin': 31,
    'border_thick': 32, 'border_notify': 33, 'frame': 35, 'frame_thin': 36,
    'frame_thick': 37, 'frame_notify': 38, 'activator': 40,
    'container_button': 41, 'selector': 42, 'selector_list': 43, 'bubble': 45,
    'bubble_pointer_up': 46, 'bubble_pointer_right': 47,
    'bubble_pointer_down': 48, 'bubble_pointer_left': 49, 'itemlist': 50,
    'itemlist_vertical': 50, 'itemlist_horizontal': 51, 'itemgrid': 52,
    'itemgrid_vertical': 53, 'itemgrid_horizontal': 54,
    'scrollable_itemlist': 55, 'scrollable_itemlist_vertical': 56,
    'scrollable_itemlist_horizontal': 57, 'button': 60, 'button_thick': 61,
    'button_icon': 62, 'button_up': 63, 'button_down': 64, 'button_left': 65,
    'button_right': 66, 'button_group_left': 67, 'button_group_center': 68,
    'button_group_right': 69, 'checkbox': 70, 'radiobutton': 71,
    'closebutton': 72, 'minimizebox': 73, 'maximizebox': 74,
    'restorebox': 75, 'dragbar': 76, 'input': 77, 'password': 78,
    'tab_content': 90, 'tab_context': 91, 'tab_selector': 92,
    'tab_button': 93, 'tab_container_button': 94, 'menu': 100,
    'menu_item': 101, 'dropmenu': 102, 'dropmenu_item': 103, 'submenu': 104,
    'droplist': 105, 'droplist_item': 106, 'slider': 110,
    'slider_horizontal': 111, 'slider_vertical': 112, 'scaler': 120,
    'scaler_vertical': 121, 'scaler_horizontal': 122,
    'scrollbar_horizontal': 130, 'scrollbar_vertical': 131,
    'scrollbar_slider_bar_horizontal': 132, 'scrollbar_slider_bar_vertical': 133,
    'scrollbar_slider_track_horizontal': 134,
    'scrollbar_slider_track_vertical': 135,
    'scrollbar_slider_button_right': 136, 'scrollbar_slider_button_down': 137,
    'scrollbar_slider_button_left': 138, 'scrollbar_slider_button_up': 139,
    'scrollable_itemgrid_vertical': 140
};

/**
 * Param name -> bitwise flag mapping for resolving <params> children.
 */
const PARAM_MAP =
{
    'null': 0x0, 'input_event_processor': 0x1,
    'route_input_events_to_parent': 0x3, 'observe_parent_input_events': 0x5,
    'internal_event_handling': 0x9, 'use_parent_graphic_context': 0x10,
    'bound_to_parent_rect': 0x20, 'relative_horizontal_scale_fixed': 0x0,
    'relative_horizontal_scale_move': 0x40,
    'relative_horizontal_scale_strech': 0x80,
    'relative_horizontal_scale_center': 0xC0,
    'relative_vertical_scale_fixed': 0x0,
    'relative_vertical_scale_move': 0x400,
    'relative_vertical_scale_strech': 0x800,
    'relative_vertical_scale_center': 0xC00,
    'relative_scale_fixed': 0x0, 'relative_scale_move': 0x440,
    'relative_scale_strech': 0x880, 'relative_scale_center': 0xCC0,
    'expand_to_accommodate_children': 0x20000,
    'resize_to_accommodate_children': 0x24000,
    'mouse_dragging_target': 0x8000, 'mouse_dragging_trigger': 0x101,
    'draggable_with_mouse': 0x8101, 'mouse_scaling_target': 0x10000,
    'horizontal_mouse_scaling_trigger': 0x1000,
    'vertical_mouse_scaling_trigger': 0x2000,
    'mouse_scaling_trigger': 0x3000, 'scalable_with_mouse': 0x13000,
    'on_accommodate_align_left': 0x0, 'on_accommodate_align_right': 0x40000,
    'on_accommodate_align_center': 0xC0000,
    'on_accommodate_align_top': 0x0,
    'on_accommodate_align_bottom': 0x100000,
    'on_accommodate_align_middle': 0x300000,
    'on_resize_align_left': 0x0, 'on_resize_align_right': 0x40000,
    'on_resize_align_center': 0xC0000, 'on_resize_align_top': 0x0,
    'on_resize_align_bottom': 0x100000, 'on_resize_align_middle': 0x300000,
    'reflect_horizontal_resize_to_parent': 0x400000,
    'reflect_vertical_resize_to_parent': 0x800000,
    'reflect_resize_to_parent': 0xC00000, 'parent_window': 0x1,
    'child_window': 0x21, 'embedded_controller': 0x33,
    'force_clipping': 0x40000000, 'inherit_caption': 0x80000000
};

function readArgs()
{
    const [, , ...argv] = process.argv;
    const args = { input: DEFAULT_INPUT, out: DEFAULT_OUTPUT, filter: null };

    for (let i = 0; i < argv.length; i += 1)
    {
        const key = argv[i];

        if (key === '--input' || key === '-i')
        {
            args.input = path.resolve(argv[i + 1]);
            i += 1;
        }
        else if (key === '--out' || key === '-o')
        {
            args.out = path.resolve(argv[i + 1]);
            i += 1;
        }
        else if (key === '--filter' || key === '-f')
        {
            args.filter = argv[i + 1];
            i += 1;
        }
    }

    return args;
}

function readBinaryAsXml(filePath)
{
    const buffer = fs.readFileSync(filePath);
    const utf8 = buffer.toString('utf8').trim();

    if (utf8.startsWith('<'))
    {
        return utf8;
    }

    const decoders = [
        () => zlib.inflateSync(buffer),
        () => zlib.inflateRawSync(buffer)
    ];

    for (const decode of decoders)
    {
        try
        {
            const inflated = decode().toString('utf8').trim();

            if (inflated.startsWith('<'))
            {
                return inflated;
            }
        }
        catch
        {
            // Try next decoder
        }
    }

    throw new Error(`Unable to decode ${filePath} as XML (plain or zlib).`);
}

function castValue(value, typeHint)
{
    if (value === undefined || value === null)
    {
        return null;
    }

    switch ((typeHint || '').toLowerCase())
    {
        case 'boolean':
            return String(value).toLowerCase() === 'true';
        case 'int':
        case 'number':
            return Number(value);
        case 'uint':
        case 'hex':
            return Number.parseInt(String(value), 16);
        case 'array':
            return String(value)
                .split(',')
                .map((entry) => entry.trim())
                .filter((entry) => entry.length > 0);
        default:
            return value;
    }
}

function parsePoint(node)
{
    const attrs = readAttributes(node);

    return {
        x: Number(attrs.x ?? 0),
        y: Number(attrs.y ?? 0)
    };
}

function parseRectangle(node)
{
    const attrs = readAttributes(node);

    return {
        x: Number(attrs.x ?? 0),
        y: Number(attrs.y ?? 0),
        width: Number(attrs.width ?? 0),
        height: Number(attrs.height ?? 0)
    };
}

function parseVarNode(varNode)
{
    const attrs = readAttributes(varNode);
    const key = attrs.key ?? attrs.name;
    const typeHint = attrs.type;
    let value = attrs.value;

    const hasChildElements = Array.from(varNode.childNodes).some((child) => child.nodeType === child.ELEMENT_NODE);

    if (!value && hasChildElements)
    {
        const child = Array.from(varNode.childNodes).find((node) => node.nodeType === node.ELEMENT_NODE);

        if (child)
        {
            if (child.nodeName === 'Point')
            {
                value = parsePoint(child);
            }
            else if (child.nodeName === 'Rectangle')
            {
                value = parseRectangle(child);
            }
            else if (child.nodeName === 'Array')
            {
                value = Array.from(child.childNodes)
                    .filter((node) => node.nodeType === node.ELEMENT_NODE && node.nodeName === 'var')
                    .map((node) => parseVarNode(node).value);
            }
            else if (child.nodeName === 'Map')
            {
                value = {};
                Array.from(child.childNodes)
                    .filter((node) => node.nodeType === node.ELEMENT_NODE && node.nodeName === 'var')
                    .forEach((node) =>
                    {
                        const parsed = parseVarNode(node);
                        value[parsed.key] = parsed.value;
                    });
            }
        }
    }

    return { key, value: castValue(value, typeHint) };
}

function readAttributes(element)
{
    const attrs = {};

    if (!element.attributes)
    {
        return attrs;
    }

    for (let i = 0; i < element.attributes.length; i += 1)
    {
        const attr = element.attributes.item(i);
        attrs[attr.name] = attr.value;
    }

    return attrs;
}

function parseFilters(filterContainer)
{
    const filters = [];

    Array.from(filterContainer.childNodes)
        .filter((node) => node.nodeType === node.ELEMENT_NODE)
        .forEach((node) =>
        {
            filters.push({
                type: node.nodeName,
                attributes: readAttributes(node)
            });
        });

    return filters;
}

function resolveParams(paramsNode)
{
    let flags = 0;

    Array.from(paramsNode.childNodes)
        .filter((child) => child.nodeType === child.ELEMENT_NODE && child.nodeName === 'param')
        .forEach((param) =>
        {
            const text = (param.textContent ?? '').trim().toLowerCase();

            if (PARAM_MAP[text] !== undefined)
            {
                flags |= PARAM_MAP[text];
            }
            else
            {
                const numValue = Number(text);

                if (!Number.isNaN(numValue))
                {
                    flags |= numValue;
                }
            }
        });

    return flags;
}

function buildNode(element)
{
    const tag = element.nodeName;
    const typeId = TYPE_MAP[tag] ?? -1;
    const node = {
        tag,
        typeId,
        attributes: readAttributes(element),
        children: []
    };

    Array.from(element.childNodes)
        .filter((child) => child.nodeType === child.ELEMENT_NODE)
        .forEach((child) =>
        {
            if (child.nodeName === 'children')
            {
                Array.from(child.childNodes)
                    .filter((grandChild) => grandChild.nodeType === grandChild.ELEMENT_NODE)
                    .forEach((grandChild) => node.children.push(buildNode(grandChild)));
            }
            else if (child.nodeName === 'params')
            {
                node.params = resolveParams(child);
            }
            else if (child.nodeName !== 'variables' && child.nodeName !== 'filters')
            {
                node.children.push(buildNode(child));
            }
        });

    return node;
}

function compileLayout(xml, sourcePath, outDir)
{
    const document = new DOMParser().parseFromString(xml, 'text/xml');
    const layouts = [];
    const vars = {};
    const filters = [];

    const layoutElements = Array.from(document.getElementsByTagName('layout'));

    const windowElements = layoutElements.length > 0
        ? Array.from(layoutElements[0].getElementsByTagName('window'))
        : Array.from(document.getElementsByTagName('window'));

    const variablesContainers = layoutElements.length > 0
        ? Array.from(layoutElements[0].getElementsByTagName('variables'))
        : Array.from(document.getElementsByTagName('variables'));

    const filterContainers = layoutElements.length > 0
        ? Array.from(layoutElements[0].getElementsByTagName('filters'))
        : Array.from(document.getElementsByTagName('filters'));

    variablesContainers.forEach((container) =>
    {
        Array.from(container.childNodes)
            .filter((node) => node.nodeType === node.ELEMENT_NODE && node.nodeName === 'var')
            .forEach((node) =>
            {
                const parsed = parseVarNode(node);
                vars[parsed.key] = parsed.value;
            });
    });

    filterContainers.forEach((container) =>
    {
        filters.push(...parseFilters(container));
    });

    windowElements.forEach((element, index) =>
    {
        const layoutName = (layoutElements[0] && layoutElements[0].getAttribute('name'))
            || element.getAttribute('name')
            || path.basename(sourcePath, '.bin');

        layouts.push({
            name: layoutName + (windowElements.length > 1 ? `#${index}` : ''),
            source: path.relative(repoRoot, sourcePath),
            window: buildNode(element),
            vars,
            filters
        });
    });

    layouts.forEach((layout) =>
    {
        const safeName = layout.name.replace(/[\\/:*?"<>|#]/g, '_');
        const targetPath = path.join(outDir, `${safeName}.json`);
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, JSON.stringify(layout, null, 2), 'utf8');
    });
}

function findBinFiles(dir, filter)
{
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries)
    {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory())
        {
            files.push(...findBinFiles(fullPath, filter));
        }
        else if (entry.isFile() && entry.name.toLowerCase().endsWith('.bin'))
        {
            if (!filter || entry.name.includes(filter))
            {
                files.push(fullPath);
            }
        }
    }

    return files;
}

function main()
{
    const args = readArgs();
    const binFiles = findBinFiles(args.input, args.filter);

    if (binFiles.length === 0)
    {
        console.warn('No .bin files found matching the provided criteria.');
        return;
    }

    fs.mkdirSync(args.out, { recursive: true });

    binFiles.forEach((filePath) =>
    {
        try
        {
            const xml = readBinaryAsXml(filePath);
            compileLayout(xml, filePath, args.out);
            console.log(`Compiled ${path.relative(repoRoot, filePath)}`);
        }
        catch (error)
        {
            console.error(`Failed to compile ${filePath}: ${error.message}`);
        }
    });
}

main();
