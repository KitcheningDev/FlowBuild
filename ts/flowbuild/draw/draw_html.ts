import { vec2, vec2_t } from "../../utils/vec2.js";
import { global_config } from "../config.js";
import { line_segment_t } from "../line_segment.js";
import { task_t } from "../task.js";

export function draw_task_html(task: task_t, origin: vec2_t): void {
    global_config.box_html.innerHTML = task.str;
    global_config.box_html.id = task.id.toString();
    global_config.box_html.style.left = origin.x.toString() + "px";
    global_config.box_html.style.top = origin.y.toString() + "px";
    global_config.chart_container_html.appendChild(global_config.box_html.cloneNode(true));
}
export function draw_crossing_html(origin: vec2_t): void {
    global_config.crossing_html.style.left = origin.x.toString() + "px";
    global_config.crossing_html.style.top = origin.y.toString() + "px";
    global_config.chart_container_html.appendChild(global_config.crossing_html.cloneNode(true));
}
function draw_line_segment_html(line: line_segment_t, target: HTMLElement): void {
    if (vec2.equals(line.from, line.to)) {
        return;
    }
    
    const size = line.dir.abs();
    target.style.left = line.center.x.toString() + "px";
    target.style.top = line.center.y.toString() + "px";
    if (size.x == 0) {
        target.style.width = "0px";
        target.style.height = size.y.toString() + "px";
    }
    else if (size.y == 0) {
        target.style.width = size.x.toString() + "px";
        target.style.height = "0px";
    }
    global_config.chart_container_html.appendChild(target.cloneNode(false));
}
export function draw_line_html(line: line_segment_t): void {
    draw_line_segment_html(line, global_config.line_html);
}
export function draw_sync_line_html(line: line_segment_t): void {
    draw_line_segment_html(line, global_config.sync_line_html);
}