import { center_origin_map } from "./center_origin_map.js";
import { global_config } from "./config.js";
import { get_chart_size } from "./get_chart_size.js";
import { create_origin_map } from "./origin/create_origin_map.js";
import { recipe_t } from "./recipe.js";
import { draw_lines } from "./draw_line.js";
import { scale_origin_map } from "./scale_origin_map.js";
import { draw_cook_sep } from "./draw_cook_sep.js";
import { vec2 } from "../utils/vec2.js";

export function draw_recipe(recipe: recipe_t): void {
    const graph = recipe.graph;
    const paths = graph.paths;

    const origin_map = create_origin_map(recipe.graph);
    const chart_size = get_chart_size(paths, origin_map);
    
    if (0 && (global_config.chart_size.x < chart_size.x || global_config.chart_size.y < chart_size.y)) {
        global_config.reduce_size_callback(global_config, chart_size);
        return draw_recipe(recipe);
    }
    scale_origin_map(paths, origin_map);
    center_origin_map(paths, origin_map);

    // center start and end
    origin_map.get(graph.start.id).x = global_config.chart_size.x / 2 + global_config.chart_hor_margin;
    origin_map.get(graph.end.id).x = global_config.chart_size.x / 2 + global_config.chart_hor_margin;

    // draw tasks
    global_config.chart_container_html.innerHTML = "";
    for (const path of paths) {
        if (path.head.str == "DUMMY") {
            continue;
        }
        for (let i = 0; i < path.tasks.length; ++i) {
            const origin = vec2.add(origin_map.get(path.id), path.bounds.task_rects[i].origin);
            global_config.box_html.innerHTML = path.tasks[i].str;
            global_config.box_html.id = path.tasks[i].id.toString();
            global_config.box_html.style.left = origin.x.toString() + "px";
            global_config.box_html.style.top = origin.y.toString() + "px";
            global_config.chart_container_html.appendChild(global_config.box_html.cloneNode(true));
        }
    }

    draw_lines(paths, graph.start, graph.end, origin_map);
    draw_cook_sep(graph, origin_map);
}