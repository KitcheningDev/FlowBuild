import { config, default_init_config } from "../config.js";
import { create_origin_map } from "../origin/create_origin_map.js";
import { recipe_t } from "../recipe.js";
import { draw_lines } from "./draw_line.js";
import { vec2, vec2_t } from "../../utils/vec2.js";
import { draw_task_html } from "./draw_html.js";
import { draw_cook_sep } from "./draw_cook_sep.js";

export function draw_recipe(recipe: recipe_t): void {
    const graph = recipe.graph;

    const paths = graph.paths;
    for (const path of paths) {
        console.log(path.head.str, path.cook_id);
    }
    const origin_map = create_origin_map(graph);
    if (origin_map.size == 0) {
        return;
    }
    
    // reset html
    config.chart_container_html.innerHTML = "";
    default_init_config();

    // draw tasks
    for (const path of origin_map.keys()) {
        for (let i = 0; i < path.tasks.length; ++i) {
            draw_task_html(path.tasks[i], vec2.add(origin_map.get(path), path.bounds.task_rects[i].origin));
        }
    }

    // draw lines
    draw_lines(paths, graph.start, graph.end, origin_map);
    
    // draw cook sep
    draw_cook_sep(graph, origin_map);
}