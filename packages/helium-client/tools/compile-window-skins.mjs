#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import { DOMParser } from '@xmldom/xmldom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const DEFAULT_INPUT = path.resolve(repoRoot, 'sources', 'win63_2021_version', 'binaryData');
const DEFAULT_OUTPUT = path.resolve(__dirname, '../src/assets/window-skins');

const SCALE_TYPE =
{
    fixed: 0,
    move: 1,
    strech: 2,
    tiled: 4,
    center: 8
};

function readArgs()
{
    const [, , ...argv] = process.argv;
    const args = { input: DEFAULT_INPUT, out: DEFAULT_OUTPUT, filter: 'habbo_skin_' };

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

function readAttributes(element)
{
    const attrs = {};

    if (!element?.attributes)
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

function getChildElements(node, name)
{
    return Array.from(node?.childNodes ?? [])
        .filter((child) =>
            child.nodeType === child.ELEMENT_NODE && (!name || child.nodeName === name)
        );
}

function resolveVar(value, vars)
{
    if (!value)
    {
        return '';
    }

    if (value.startsWith('$'))
    {
        const key = value.slice(1);
        return vars[key] ?? '';
    }

    return value;
}

function parseNumber(value, fallback)
{
    if (value === undefined || value === null || value === '')
    {
        return fallback;
    }

    const str = String(value);
    if (str.startsWith('0x') || str.startsWith('0X'))
    {
        return Number.parseInt(str, 16);
    }

    const parsed = Number(str);
    return Number.isNaN(parsed) ? fallback : parsed;
}

function parseRectangle(regionNode, vars)
{
    const rectNode = getChildElements(regionNode, 'Rectangle')[0];
    if (!rectNode)
    {
        return { x: 0, y: 0, width: 0, height: 0 };
    }

    const attrs = readAttributes(rectNode);

    return {
        x: parseNumber(resolveVar(attrs.x, vars), 0),
        y: parseNumber(resolveVar(attrs.y, vars), 0),
        width: parseNumber(resolveVar(attrs.width, vars), 0),
        height: parseNumber(resolveVar(attrs.height, vars), 0)
    };
}

function parseScaleValue(value)
{
    if (!value)
    {
        return SCALE_TYPE.fixed;
    }

    const key = value.toLowerCase();
    return SCALE_TYPE[key] ?? SCALE_TYPE.fixed;
}

function parseSkinVariables(skinNode)
{
    const vars = {};
    const variablesNode = getChildElements(skinNode, 'variables')[0];
    if (!variablesNode)
    {
        return vars;
    }

    getChildElements(variablesNode, 'variable').forEach((variable) =>
    {
        const attrs = readAttributes(variable);
        const key = attrs.key ?? attrs.name;
        const value = attrs.value ?? '';
        if (key)
        {
            vars[key] = value;
        }
    });

    return vars;
}

function parseSkinTemplates(skinNode, vars)
{
    const templatesNode = getChildElements(skinNode, 'templates')[0];
    if (!templatesNode)
    {
        return [];
    }

    return getChildElements(templatesNode, 'template').map((template) =>
    {
        const attrs = readAttributes(template);
        const entitiesNode = getChildElements(template, 'entities')[0];
        const entities = getChildElements(entitiesNode, 'entity').map((entity) =>
        {
            const entityAttrs = readAttributes(entity);
            const regionNode = getChildElements(entity, 'region')[0];
            return {
                id: parseNumber(resolveVar(entityAttrs.id, vars), 0),
                name: resolveVar(entityAttrs.name, vars),
                type: resolveVar(entityAttrs.type, vars),
                region: parseRectangle(regionNode, vars)
            };
        });

        return {
            name: resolveVar(attrs.name, vars),
            asset: resolveVar(attrs.asset, vars),
            entities
        };
    });
}

function parseSkinLayouts(skinNode, vars)
{
    const layoutsNode = getChildElements(skinNode, 'layouts')[0];
    if (!layoutsNode)
    {
        return [];
    }

    return getChildElements(layoutsNode, 'layout').map((layout) =>
    {
        const attrs = readAttributes(layout);
        const entitiesNode = getChildElements(layout, 'entities')[0];
        const entities = getChildElements(entitiesNode, 'entity').map((entity) =>
        {
            const entityAttrs = readAttributes(entity);
            const colorNode = getChildElements(entity, 'color')[0];
            const blendNode = getChildElements(entity, 'blend')[0];
            const scaleNode = getChildElements(entity, 'scale')[0];
            const regionNode = getChildElements(entity, 'region')[0];
            const scaleAttrs = readAttributes(scaleNode);
            const colorValue = colorNode?.textContent?.trim() ?? '';
            const blendValue = blendNode?.textContent?.trim() ?? '';
            const colorizeValue = entityAttrs.colorize;

            return {
                id: parseNumber(resolveVar(entityAttrs.id, vars), 0),
                name: resolveVar(entityAttrs.name, vars),
                colorize: colorizeValue === '' || colorizeValue === undefined ? true : colorizeValue === 'true',
                color: parseNumber(resolveVar(colorValue, vars), 0),
                blend: parseNumber(resolveVar(blendValue, vars), 0xffffffff),
                scaleH: parseScaleValue(resolveVar(scaleAttrs.horizontal, vars)),
                scaleV: parseScaleValue(resolveVar(scaleAttrs.vertical, vars)),
                region: parseRectangle(regionNode, vars)
            };
        });

        return {
            name: resolveVar(attrs.name, vars),
            transparent: attrs.transparent === 'true',
            blendMode: attrs.blendMode ?? '',
            entities
        };
    });
}

function parseSkinStates(skinNode, vars)
{
    const statesNode = getChildElements(skinNode, 'states')[0];
    if (!statesNode)
    {
        return [];
    }

    return getChildElements(statesNode, 'state').map((state) =>
    {
        const attrs = readAttributes(state);
        return {
            name: resolveVar(attrs.name, vars),
            layout: resolveVar(attrs.layout, vars),
            template: resolveVar(attrs.template, vars)
        };
    });
}

function parseSkinXml(xml, sourcePath, assetId)
{
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const skinNode = doc.getElementsByTagName('skin')[0];
    if (!skinNode)
    {
        return null;
    }

    const vars = parseSkinVariables(skinNode);
    const skinName = skinNode.getAttribute('name') ?? '';

    return {
        id: assetId,
        name: skinName,
        source: path.relative(repoRoot, sourcePath),
        variables: vars,
        templates: parseSkinTemplates(skinNode, vars),
        layouts: parseSkinLayouts(skinNode, vars),
        states: parseSkinStates(skinNode, vars)
    };
}

function parseElementDescriptionXml(xml, sourcePath, assetId)
{
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const windows = Array.from(doc.getElementsByTagName('window')).map((windowNode) =>
    {
        const attrs = readAttributes(windowNode);
        const statesNode = getChildElements(windowNode, 'states')[0];
        const states = getChildElements(statesNode, 'state').map((state) =>
        {
            const stateAttrs = readAttributes(state);
            return {
                name: stateAttrs.name ?? '',
                layout: stateAttrs.layout ?? '',
                template: stateAttrs.template ?? ''
            };
        });

        return {
            type: attrs.type ?? '',
            intent: attrs.intent ?? '',
            style: attrs.style ?? '0',
            renderer: attrs.renderer ?? '',
            asset: attrs.asset ?? '',
            layout: attrs.layout ?? '',
            windowLayout: attrs.window_layout ?? '',
            defaults:
            {
                threshold: parseNumber(attrs.treshold, 10),
                background: attrs.background === 'true',
                blend: parseNumber(attrs.blend, 1),
                color: parseNumber(attrs.color, 0xffffff),
                widthMin: parseNumber(attrs.width_min, -2147483648),
                widthMax: parseNumber(attrs.width_max, 2147483647),
                heightMin: parseNumber(attrs.height_min, -2147483648),
                heightMax: parseNumber(attrs.height_max, 2147483647)
            },
            states
        };
    });

    return {
        id: assetId,
        source: path.relative(repoRoot, sourcePath),
        windows
    };
}

function findBinFiles(dir, filter)
{
    return fs.readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.bin'))
        .map((entry) => path.join(dir, entry.name))
        .filter((filePath) => !filter || path.basename(filePath).includes(filter));
}

function toAssetId(filePath)
{
    return path.basename(filePath, '.bin')
        .replace(/^HabboHabboWindowManagerCom_/, '')
        .replace(/^HabboWindowManagerCom_/, '');
}

function writeJson(outDir, name, data)
{
    const targetPath = path.join(outDir, `${name}.json`);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
}

function main()
{
    const args = readArgs();

    fs.mkdirSync(args.out, { recursive: true });

    const elementDescription = fs.readdirSync(args.input)
        .map((entry) => path.join(args.input, entry))
        .find((entry) => entry.includes('habbo_element_description_xml.bin'));

    if (!elementDescription)
    {
        throw new Error('Unable to locate habbo_element_description_xml.bin.');
    }

    const elementAssetId = toAssetId(elementDescription);
    const elementXml = readBinaryAsXml(elementDescription);
    writeJson(args.out, 'element-description', parseElementDescriptionXml(elementXml, elementDescription, elementAssetId));
    console.log(`Compiled ${path.relative(repoRoot, elementDescription)}`);

    const skinFiles = findBinFiles(args.input, args.filter);
    if (skinFiles.length === 0)
    {
        console.warn('No skin .bin files found matching the provided criteria.');
        return;
    }

    skinFiles.forEach((filePath) =>
    {
        try
        {
            const xml = readBinaryAsXml(filePath);
            const assetId = toAssetId(filePath);
            const compiled = parseSkinXml(xml, filePath, assetId);
            if (!compiled)
            {
                return;
            }

            writeJson(args.out, assetId, compiled);
            console.log(`Compiled ${path.relative(repoRoot, filePath)}`);
        }
        catch (error)
        {
            console.error(`Failed to compile ${filePath}: ${error.message}`);
        }
    });
}

main();
