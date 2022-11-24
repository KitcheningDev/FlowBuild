import { global_config } from "../config.js";
import { create_origin_map } from "../origin/create_origin_map.js";
import { recipe_t } from "../recipe.js";
import { draw_lines } from "./draw_line.js";
import { draw_cook_sep } from "./draw_cook_sep.js";
import { vec2 } from "../../utils/vec2.js";
import { draw_task_html } from "./draw_html.js";
import { pathset_size } from "../pathset.js";

export function draw_recipe(recipe: recipe_t): void {
    const graph = recipe.graph;
    const paths = graph.paths;
    const origin_map = create_origin_map(graph);
    const chart_size = pathset_size(paths, origin_map);
    
    // reduce size if necessary
    if (global_config.chart_size.x < chart_size.x || global_config.chart_size.y < chart_size.y) {
        if (global_config.try_reduce_size_callback(global_config, chart_size)) {
            recipe.update();
            return draw_recipe(recipe);
        }
    }

    // clear html
    global_config.chart_container_html.innerHTML = "";
    
    // draw tasks
    for (const path of paths) {
        if (path.head.str != "DUMMY") {
            for (let i = 0; i < path.tasks.length; ++i) {
                draw_task_html(path.tasks[i], vec2.add(origin_map.get(path.id), path.bounds.task_rects[i].origin));
            }
        }
    }
    // draw lines
    draw_lines(paths, graph.start, graph.end, origin_map);
    // draw cook sep
    draw_cook_sep(graph, origin_map);
}