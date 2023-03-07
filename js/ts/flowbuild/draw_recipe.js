import { center_origin_map } from "./center_origin_map.js";
import { global_config } from "./config.js";
import { get_cook_bounds } from "./cook_bounds.js";
import { get_chart_size } from "./get_chart_size.js";
import { create_origin_map } from "./origin/create_origin_map.js";
import { draw_lines } from "./draw_line.js";
export function draw_recipe(recipe) {
    const graph = recipe.graph;
    const paths = graph.paths;
    const origin_map = create_origin_map(recipe);
    // for (const [id, x] of origin_map_x) {
    //     if (id == -1) {
    //         continue;
    //     }
    //     origin_map_x.set(id, x + recipe.get_task(id).cook_id * global_config.cook_margin * 2);
    // }
    const chart_size = get_chart_size(paths, origin_map);
    if (global_config.chart_size.x < chart_size.x || global_config.chart_size.y < chart_size.y) {
        global_config.reduce_size_callback(global_config, chart_size);
        console.log("RESIZED", recipe.name, chart_size);
        return draw_recipe(recipe);
    }
    center_origin_map(paths, origin_map);
    origin_map.get(graph.start.id).x = global_config.chart_size.x / 2 + global_config.chart_hor_margin;
    origin_map.get(graph.end.id).x = global_config.chart_size.x / 2 + global_config.chart_hor_margin;
    global_config.chart_container_html.innerHTML = "";
    for (const path of paths) {
        const origin = origin_map.get(path.id);
        for (let i = 0; i < path.tasks.length; ++i) {
            global_config.box_html.innerHTML = path.tasks[i].str;
            global_config.box_html.style.left = (origin.x + path.bounds.task_rects[i].origin.x).toString() + "px";
            global_config.box_html.style.top = (origin.y + path.bounds.task_rects[i].origin.y).toString() + "px";
            global_config.chart_container_html.appendChild(global_config.box_html.cloneNode(true));
        }
    }
    draw_lines(paths, graph.start, graph.end, origin_map);
    //draw top and down sync_line
    const top_syncline_y = origin_map.get(graph.start.id).y + graph.start.bounds.out.y + global_config.depth_margin / 2;
    const bottom_syncline_y = origin_map.get(graph.end.id).y + graph.end.bounds.in.y - global_config.depth_margin / 2;
    let cook_bounds = get_cook_bounds(recipe, origin_map);
    let max_el = cook_bounds[0];
    for (let i = 1; i < cook_bounds.length; ++i) {
        if (cook_bounds[i].right > max_el.right) {
            max_el = cook_bounds[i];
        }
    }
    //cook_bounds = cook_bounds.filter(funcs.primitive_equals_func(max_el));
    for (const cook_bound of cook_bounds) {
        if (cook_bound == max_el) {
            continue;
        }
        const cook_sep_html = document.createElement('div');
        cook_sep_html.classList.add('cook-sep');
        cook_sep_html.style.top = top_syncline_y.toString() + 'px';
        cook_sep_html.style.left = (cook_bound.right + global_config.cook_margin).toString() + 'px';
        cook_sep_html.style.height = (bottom_syncline_y - top_syncline_y).toString() + 'px';
        //global_config.chart_container_html.appendChild(cook_sep_html);
    }
}
//# sourceMappingURL=draw_recipe.js.map