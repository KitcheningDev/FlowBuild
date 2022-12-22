import { vec2, vec2_t } from "../../utils/vec2.js";
import { config } from "../config.js";
import { line_t } from "../line.js";
import { task_t } from "../task.js";

export function draw_task_html(task: task_t, origin: vec2_t): void {
    if (task.str == "DUMMY") {
        return;
    }
    config.box_html.innerHTML = task.str;
    config.box_html.id = task.id.toString();
    config.box_html.style.left = origin.x.toString() + "px";
    config.box_html.style.top = origin.y.toString() + "px";
    config.chart_container_html.appendChild(config.box_html.cloneNode(true));
}
export function draw_crossing_html(origin: vec2_t): void {
    config.crossing_html.style.left = origin.x.toString() + "px";
    config.crossing_html.style.top = origin.y.toString() + "px";
    config.chart_container_html.appendChild(config.crossing_html.cloneNode(true));
}
function draw_line_segment_html(line: line_t, target: HTMLElement): void {
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
    config.chart_container_html.appendChild(target.cloneNode(false));}
export function draw_caret_html(line: line_t): void {
    const caret = document.createElement('div');
    const caret_size = 2;
    const pos = line.to.copy();
    caret.classList.add("fa-solid");
    if (line.dir.y > 0) {
        caret.classList.add("fa-caret-down");
        pos.y -= caret_size;
    }
    else if (line.dir.y < 0) {
        caret.classList.add("fa-caret-up");
        pos.y += caret_size;
    }
    else if (line.dir.x > 0) {
        caret.classList.add("fa-caret-right");
        pos.x -= caret_size;
    }
    else if (line.dir.x < 0) {
        caret.classList.add("fa-caret-left");
        pos.x += caret_size;
    }
    caret.classList.add("fa-2xs");
    caret.style.left = pos.x.toString() + "px";
    caret.style.top = pos.y.toString() + "px";
    config.chart_container_html.appendChild(caret);
}
export function draw_line_html(line: line_t): void {
    draw_line_segment_html(line, config.line_html);
}
export function draw_sync_line_html(line: line_t): void {
    draw_line_segment_html(line, config.sync_line_html);
}