import { Vec2 } from "../create_grid/grid.js";
import { has_sync_line } from "./sync_line.js";
// config
const config_task_margin = 10;
const config_sync_line_margin = 3;
const container = document.getElementById("flowchart-container");
function get_task_size(task) {
    const box = document.createElement('div');
    box.classList.add('task');
    box.innerHTML = task.description;
    container.appendChild(box);
    const rect = box.getBoundingClientRect();
    container.removeChild(box);
    return new Vec2(rect.width, rect.height);
}
function get_sync_line_height() {
    const sync_line = document.createElement('div');
    sync_line.classList.add('sync-line');
    container.appendChild(sync_line);
    const rect = sync_line.getBoundingClientRect();
    container.removeChild(sync_line);
    return rect.height;
}
const sync_line_height = get_sync_line_height();
export function get_node_bounds(node) {
    if (node === null) {
        return new Vec2(0, 0);
    }
    let bounds = get_task_size(node.task);
    bounds.x += 2 * config_task_margin;
    bounds.y += 2 * config_task_margin;
    if (has_sync_line(node, 'top')) {
        bounds.y += sync_line_height + 2 * config_sync_line_margin;
    }
    if (has_sync_line(node, 'bottom')) {
        bounds.y += sync_line_height + 2 * config_sync_line_margin;
    }
    return bounds;
}
//# sourceMappingURL=node_bounds.js.map