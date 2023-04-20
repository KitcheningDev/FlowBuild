import { Vec2 } from "../../utils/vec2.js";
import { config } from "../config.js";
// container
const container = document.getElementById("flowchart-container");
// strokes
function get_stroke(cls, dir) {
    const el = document.createElement('div');
    el.classList.add(cls);
    container.appendChild(el);
    const stroke = el.getBoundingClientRect()[dir];
    container.removeChild(el);
    return stroke;
}
const line_stroke = get_stroke('line', 'width');
const sync_line_stroke = get_stroke('sync-line-middle', 'height');
const cook_line_stroke = get_stroke('cook-line', 'width');
// html size
export function get_node_size(node) {
    if (node.task.is_empty()) {
        return new Vec2(0, 0);
    }
    const box = document.createElement('div');
    box.classList.add('flow-task');
    config.apply(box);
    box.innerHTML = node.task.description;
    container.appendChild(box);
    const rect = box.getBoundingClientRect();
    container.removeChild(box);
    return new Vec2(rect.width, rect.height);
}
export function get_sync_line_height() {
    return sync_line_stroke + 2 * 1;
}
//# sourceMappingURL=html_size.js.map