import { vec2_t } from "../utils/vec2.js";
export const config = {};
export function default_init_config() {
    // chart size
    const chart_rect = document.getElementById("chart").getBoundingClientRect();
    config.chart_size = new vec2_t(chart_rect.width, chart_rect.height);
    // html elements
    config.chart_container_html = document.getElementById("chart-container");
    config.box_html = document.createElement("div");
    config.box_html.classList.add("box");
    config.box_html.style.fontSize = "12px";
    config.chart_container_html.appendChild(config.box_html);
    config.line_html = document.createElement("div");
    config.line_html.classList.add("line");
    config.sync_line_html = document.createElement("div");
    config.sync_line_html.classList.add("sync-line");
    config.crossing_html = document.createElement("div");
    config.crossing_html.classList.add("crossing");
    // margins
    config.box_margin = 5;
    config.depth_margin = 30;
    config.cook_margin = 20;
    config.sync_line_margin = 10;
    config.crossing_margin = 10;
    config.y_plateu = 10;
    config.sync_line_width = 2;
    config.min_height = 400;
    config.alternate_treshhold = 5;
    config.reduce_size_callback = (config, size) => {
        const old_font_size = Number(config.box_html.style.fontSize.substring(0, 2));
        if (old_font_size == 1 && config.box_margin == 1 && config.depth_margin == 1) {
            return false;
        }
        config.box_html.style.fontSize = (old_font_size > 1 ? old_font_size - 1 : 1).toString() + "px";
        config.box_margin = config.box_margin > 1 ? config.box_margin - 1 : 1;
        config.depth_margin = config.depth_margin > 1 ? config.depth_margin - 1 : 1;
        if (size.x > config.chart_size.x && size.y < config.chart_size.y) {
            config.alternate_treshhold++;
        }
        else if (size.x < config.chart_size.x && size.y > config.chart_size.y) {
            config.alternate_treshhold--;
        }
        return true;
    };
}
//# sourceMappingURL=config.js.map