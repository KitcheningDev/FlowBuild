import { Vec2, vec2_add } from "../../utils/vec2.js";
import { get_node_size, get_tile_size } from "./get_tile_size.js";
const container = document.getElementById("flowchart-container");
function create_div(...classes) {
    const div = document.createElement('div');
    for (const cls of classes) {
        div.classList.add(cls);
    }
    return div;
}
function draw_element(el, pos, size) {
    el.style.left = pos.x.toString() + 'px';
    el.style.top = pos.y.toString() + 'px';
    if (size !== undefined) {
        el.style.width = size.x.toString() + 'px';
        el.style.height = size.y.toString() + 'px';
    }
    container.appendChild(el);
}
function create_node(node) {
    const el = create_div('task');
    el.innerHTML = node.task.description;
    return el;
}
function create_line(dir) {
    const el = create_div('line');
    return el;
}
function create_caret(dir) {
    return create_div('caret-' + dir, 'fa-solid', 'fa-angle-down', 'fa-2xs');
}
function create_sync_line(type) {
    const el = create_div('sync-line-' + type);
    return el;
}
function create_cook_line() {
    return create_div('cook-line');
}
function create_crossing() {
    return create_div('crossing', 'fa-solid', 'fa-diamond', 'fa-2xs');
}
const line_stroke = 0;
const sync_line_stroke = 2;
const cook_line_stroke = 0;
function get_syncline_height() {
    return sync_line_stroke + 2 * 1;
}
export function draw_tile_set(tileset) {
    for (const [tile, pos, tile_size] of tileset) {
        const size = get_tile_size(tile);
        if (tile.node) {
            const html_node = create_node(tile.node);
            draw_element(html_node, pos);
        }
        if (tile.has_connector()) {
            draw_element(create_crossing(), pos);
        }
        if (tile.sync_lines.top) {
            draw_element(create_sync_line(tile.sync_lines.top), pos, new Vec2(tile_size.x, sync_line_stroke));
        }
        if (tile.sync_lines.bottom) {
            draw_element(create_sync_line(tile.sync_lines.bottom), pos, new Vec2(tile_size.x, sync_line_stroke));
        }
        if (tile.lines.top !== null) {
            if (tile.node !== null || tile.has_connector() || (tile.sync_lines.top || tile.sync_lines.bottom)) {
                draw_element(create_line('down'), vec2_add(pos, new Vec2(0, -tile_size.y / 4)), new Vec2(line_stroke, tile_size.y / 2));
                if (tile.node !== null) {
                    draw_element(create_caret('down'), vec2_add(pos, new Vec2(0, -get_node_size(tile.node).y / 2 - 1)));
                }
                else if (tile.sync_lines.top || tile.sync_lines.bottom) {
                    draw_element(create_caret('down'), vec2_add(pos, new Vec2(0, -get_syncline_height() / 2 - 1)));
                }
            }
            else {
                draw_element(create_line('down'), vec2_add(pos, new Vec2(0, -tile_size.y / 4)), new Vec2(line_stroke, tile_size.y / 2));
            }
        }
        if (tile.lines.right !== null) {
            if (tile.lines.right == 'in') {
                draw_element(create_line('left'), vec2_add(pos, new Vec2(tile_size.x / 4, 0)), new Vec2(tile_size.x / 2, line_stroke));
            }
            else {
                draw_element(create_line('right'), vec2_add(pos, new Vec2(tile_size.x / 4, 0)), new Vec2(tile_size.x / 2, line_stroke));
            }
        }
        if (tile.lines.left !== null) {
            if (tile.lines.left == 'in') {
                draw_element(create_line('right'), vec2_add(pos, new Vec2(-tile_size.x / 4, 0)), new Vec2(tile_size.x / 2, line_stroke));
            }
            else {
                draw_element(create_line('left'), vec2_add(pos, new Vec2(-tile_size.x / 4, 0)), new Vec2(tile_size.x / 2, line_stroke));
            }
        }
        if (tile.lines.bottom !== null) {
            draw_element(create_line('down'), vec2_add(pos, new Vec2(0, tile_size.y / 4)), new Vec2(line_stroke, tile_size.y / 2));
        }
        if (tile.cook_line) {
            draw_element(create_cook_line(), pos, new Vec2(cook_line_stroke, tile_size.y));
        }
    }
}
//# sourceMappingURL=draw_.js.map