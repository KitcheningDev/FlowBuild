import { vec2_t } from "../utils/vec2.js";
import { task_t } from "./task.js";

class config_t {
    chart_size: vec2_t;

    chart_container_html: HTMLElement;
    box_html: HTMLElement;
    line_html: HTMLElement;
    sync_line_html: HTMLElement;
    crossing_html: HTMLElement;

    box_margin: number;
    depth_margin: number;
    chart_ver_margin: number;
    chart_hor_margin: number;
    cook_margin: number;
    path_fold_threshold: number;
    try_reduce_size_callback: (config: config_t, size: vec2_t) => boolean;

    get_box_size(task: task_t) {
        this.box_html.innerHTML = task.str;
        const bound_rect = this.box_html.getBoundingClientRect();
        return new vec2_t(bound_rect.width + this.box_margin * 2, bound_rect.height + this.box_margin * 2);
    }
}
function create_default(): config_t {
    const out = new config_t();
    out.chart_container_html = document.getElementById("chart-container");

    out.chart_ver_margin = 20;
    out.chart_hor_margin = 60;
    out.chart_size = new vec2_t();
    out.chart_size.x = document.getElementById("chart").getBoundingClientRect().width - 2 * out.chart_hor_margin;
    out.chart_size.y = document.getElementById("chart").getBoundingClientRect().height - 2 * out.chart_ver_margin;
    
    out.box_html = document.createElement("div");
    out.box_html.classList.add("box");
    out.box_html.style.fontSize = "12px";
    out.chart_container_html.appendChild(out.box_html);
   
    out.crossing_html = document.createElement("div");
    out.crossing_html.classList.add("crossing")

    out.line_html = document.createElement("div");
    out.line_html.classList.add("line");
    //out.line_html.classList.add("dash-travel");

    out.sync_line_html = document.createElement("div");
    out.sync_line_html.classList.add("sync-line");

    // in px
    out.box_margin = 5;
    out.depth_margin = 10;
    out.cook_margin = 20;

    out.path_fold_threshold = 4;
    out.try_reduce_size_callback = (config: config_t, size: vec2_t) => {
        const old_font_size = Number(config.box_html.style.fontSize.substring(0, 2));
        if (old_font_size == 1 && config.box_margin == 1 && config.depth_margin == 1) {
            return false;
        }
        config.box_html.style.fontSize = (old_font_size > 1 ? old_font_size - 1 : 1).toString() + "px";
        config.box_margin = config.box_margin > 1 ? config.box_margin - 1 : 1;
        config.depth_margin = config.depth_margin > 1 ? config.depth_margin - 1 : 1;
        if (size.x > config.chart_size.x && size.y < config.chart_size.y) {
            config.path_fold_threshold++;
        }
        else if (size.x < config.chart_size.x && size.y > config.chart_size.y) {
            config.path_fold_threshold--;
        }
        return true;
    };
    return out;
}

export let global_config: config_t;
export function init_global_config(): void {
    global_config = create_default();
}