#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import zlib from 'node:zlib';
import {DOMParser} from '@xmldom/xmldom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const DEFAULT_INPUT = path.resolve("C:\\Users\\Clayton\\Desktop\\helium\\sources\\win63_2021_version\\binaryData");
const DEFAULT_OUTPUT = path.resolve(__dirname, '../src/assets/window-layouts');

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

function buildNode(element)
{
    const node = {
        tag: element.nodeName,
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
        const targetPath = path.join(outDir, `${layout.name}.json`);
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
