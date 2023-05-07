import { Vec2, vec2_add, vec2_div } from "../../utils/vec2.js";
import { MetricGrid } from "./metric_grid.js";
import { Node } from "../graph/node.js";
import { FlowGrid } from "../grid/flow_grid.js";
import { LineDir, Lines, Tile } from "../grid/tile.js";
import { get_tile_set_offset } from "./get_grid_offset.js";
import { get_tile_size } from "./get_tile_size.js";
import { config } from "../config.js";
import { Graph } from "../graph/graph.js";
import { IEntry } from "../grid/grid.js";

// draw html
const container = document.getElementById("flowchart-container") as HTMLElement;
function create_div(...classes: string[]): HTMLElement {
    const div = document.createElement('div');
    for (const cls of classes) {
        div.classList.add(cls);
    }
    return div;
}
function draw_element(el: HTMLElement, pos: Vec2, size?: Vec2): void {
    el.style.left = (pos.x - offset.x).toString() + 'px';
    el.style.top = (pos.y - offset.y).toString() + 'px';
    if (size !== undefined) {
        if (size.x !== null) {
            el.style.width = size.x.toString() + 'px';
        }
        if (size.y !== null) {
            el.style.height = size.y.toString() + 'px';
        }
    }
    container.appendChild(el);
}

// create html elements
function create_node(node: Node, graph: Graph): HTMLElement {
    if (node.is_start()) {
        const el = create_div('flow-start');
        el.id = node.task.id.toString();
        return el;
    }
    else if (node.is_end()) {
        const el = create_div('flow-end');
        el.id = node.task.id.toString();
        return el;
    }
    else {
        const el = create_div('flow-task');
        el.innerText = node.task.description;
        el.id = node.task.id.toString();

        // editor
        const add = create_div('editor-add', 'fa-solid', 'fa-plus', 'fa-sharp', 'fa-xl');
        const remove = create_div('editor-remove', 'fa-solid', 'fa-minus', 'fa-sharp', 'fa-xl');
        el.append(add);
        el.append(remove);
        if (!node.is_last_step()) {
            const connector = create_div('editor-connector');
            el.appendChild(connector);
        }
        return el;
    }
}
function create_cook_title(title: string): HTMLElement {
    const el = create_div('cook-title');
    el.textContent = title;
    return el;
}
function create_line(dir: LineDir): HTMLElement {
    const el = create_div('line');
    return el;
}
function create_sync_line(type: 'left' | 'middle' | 'right'): HTMLElement {
    const el = create_div('sync-line-' + type);
    return el;
}
function create_cook_line(): HTMLElement {
    return create_div('cook-line');
}
function create_crossing(): HTMLElement {
    return create_div('crossing', 'fa-solid', 'fa-diamond', 'fa-2xs');
}
function create_caret(dir: LineDir): HTMLElement {
    if (dir == 'up') {
        return create_div('caret-up', 'fa-solid', 'fa-angle-up', 'fa-2xs');
    }
    else if (dir == 'right') {
        return create_div('caret-right', 'fa-solid', 'fa-angle-right', 'fa-2xs');
    }
    else if (dir == 'down') {
        return create_div('caret-down', 'fa-solid', 'fa-angle-down', 'fa-2xs');
    }
    else {
        return create_div('caret-left', 'fa-solid', 'fa-angle-left', 'fa-2xs');
    }
}

let offset = null as Vec2;
function draw_lines(entry: IEntry<Tile>, metric_grid: MetricGrid) {
    const coords = entry.coords;
    const tile = entry.tile;
    const metric_tile = metric_grid.get(coords);
    const lines = tile.lines;
    for (const [where, dir1, dir2] of [['top', 'up', 'down'], ['bottom', 'down', 'up']]) {
        if (lines[where] !== null) {
            const dir = (lines[where] == 'in' ? dir2 : dir1) as LineDir;
            const size = metric_grid.diff(coords, coords[dir1]());
            const pos = metric_tile.pos[dir1](size.y / 2);
            draw_element(create_line(dir), pos, new Vec2(null, size.y));
            if (lines[where] == 'in' && tile.is_solid()) {
                draw_element(create_caret(dir), metric_tile.pos[dir1](metric_tile.no_margin.y / 2));
            }
        }
    }
    for (const [where, dir1, dir2] of [['right', 'right', 'left'], ['left', 'left', 'right']]) {
        if (lines[where] !== null) {
            const dir = (lines[where] == 'in' ? dir2 : dir1) as LineDir;
            const size = metric_grid.diff(coords, coords[dir1]());
            const pos = metric_grid.get(coords).pos[dir1](size.x / 2);
            draw_element(create_line(dir), pos, new Vec2(size.x, null));
            if (lines[where] == 'in' && tile.is_solid()) {
                draw_element(create_caret(dir), metric_tile.pos[dir1](metric_tile.no_margin.x / 2));
            }
        }
    } 
}
export function draw_grid(flow_grid: FlowGrid, metric_grid: MetricGrid, graph: Graph): void {
    container.innerHTML = "";
    // metric_grid.reduce_x();
    offset = metric_grid.get_grid_center();

    // if (graph.get_cooks().size > 1) {
    //     for (const cook of graph.get_cooks()) {
    //         const bounds = metric_grid.get_hor_bounds((node: Node) => node.task.cook == cook, flow_grid);
    //         draw_element(create_cook_title(cook.name), new Vec2(bounds.center(), 0));
    //     }
    // }
    for (const [tile, coords] of flow_grid.get_entries()) {
        const size = get_tile_size(tile, false);
        const pos = metric_grid.get(coords).pos;
        const tile_size = metric_grid.get(coords).dim;

        // node
        if (tile.node && !tile.node.task.is_empty()) {
            const html_node = create_node(tile.node, graph);
            config.apply(html_node);
            draw_element(html_node, pos);
        }

        // connector
        if (tile.lines.has_connector()) {
            draw_element(create_crossing(), pos);
        }

        // sync-lines
        if (coords.y != 1 && coords.y != flow_grid.get_size().y - 2) {
            if (tile.sync_lines.top) {
                if (tile.sync_lines.top == 'left') {
                    draw_element(create_sync_line(tile.sync_lines.top), pos, new Vec2(metric_grid.diff(coords, coords.right()).x, null));
                }
                else if (tile.sync_lines.top == 'middle') {
                    draw_element(create_sync_line(tile.sync_lines.top), pos, new Vec2(metric_grid.diff(coords.left(), coords.right()).x, null));
                }
                else if (tile.sync_lines.top == 'right') {
                    draw_element(create_sync_line(tile.sync_lines.top), pos, new Vec2(metric_grid.diff(coords.left(), coords).x, null));
                }
            }
            if (tile.sync_lines.bottom) {
                if (tile.sync_lines.bottom == 'left') {
                    draw_element(create_sync_line(tile.sync_lines.bottom), pos, new Vec2(metric_grid.diff(coords, coords.right()).x, null));
                }
                else if (tile.sync_lines.bottom == 'middle') {
                    draw_element(create_sync_line(tile.sync_lines.bottom), pos, new Vec2(metric_grid.diff(coords.left(), coords.right()).x, null));
                }
                else if (tile.sync_lines.bottom == 'right') {
                    draw_element(create_sync_line(tile.sync_lines.bottom), pos, new Vec2(metric_grid.diff(coords.left(), coords).x, null));
                }
            }
        }

        // lines
        draw_lines(new IEntry(tile, coords), metric_grid);
    }
    // draw start end sync-line so that it covers the whole chart
    const top_pos = new Vec2(metric_grid.get_grid_center().x, metric_grid.get(new Vec2(0, 1)).pos.y);
    const bottom_pos = new Vec2(metric_grid.get_grid_center().x, metric_grid.get(new Vec2(0, metric_grid.get_size().y - 2)).pos.y);
    const length = metric_grid.get_grid_dim().x;
    draw_element(create_sync_line('middle'), top_pos, new Vec2(length, null));
    draw_element(create_sync_line('middle'), bottom_pos, new Vec2(length, null));

    for (let x = 0; x < flow_grid.get_size().x; ++x) {
        if (flow_grid.get(new Vec2(x, 2)).cook_line) {
            const from = metric_grid.get(new Vec2(x, 1)).pos;
            const to = metric_grid.get(new Vec2(x, metric_grid.get_size().y - 2)).pos;
            draw_element(create_cook_line(), vec2_div(vec2_add(from, to), 2), new Vec2(null, to.y - from.y));
        }
    }
}