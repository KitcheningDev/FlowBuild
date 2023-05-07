import { config } from "../config.js";
export function draw_cook_sep(graph, origin_map) {
    if (graph.cook_count < 2) {
        return;
    }
    const cook_bounds = new Map();
    for (const path of graph.paths) {
        if (path.cook_id == 0) {
            continue;
        }
        if (!cook_bounds.has(path.cook_id)) {
            cook_bounds.set(path.cook_id, { left: Infinity, right: -Infinity });
        }
        const bounds = cook_bounds.get(path.cook_id);
        bounds.left = Math.min(origin_map.get(path).x - path.bounds.size.x / 2, bounds.left);
        bounds.right = Math.max(origin_map.get(path).x + path.bounds.size.x / 2, bounds.right);
    }
    let max_id = 0;
    let max_val = cook_bounds.get(1).right;
    for (const [id, bound] of cook_bounds) {
        if (max_val < bound.right) {
            max_id = id;
            max_val = bound.right;
        }
    }
    const top_syncline_y = origin_map.get(graph.start).y + graph.start.bounds.out.y + config.depth_margin + config.box_margin;
    const bottom_syncline_y = origin_map.get(graph.end).y + graph.end.bounds.in.y - config.depth_margin - config.box_margin;
    for (const [id, cook_bound] of cook_bounds) {
        if (id != max_id) {
            const cook_sep_html = document.createElement('div');
            cook_sep_html.classList.add('cook-sep');
            cook_sep_html.style.top = ((top_syncline_y + bottom_syncline_y) / 2).toString() + 'px';
            cook_sep_html.style.left = (cook_bound.right + config.box_margin).toString() + 'px';
            cook_sep_html.style.height = (bottom_syncline_y - top_syncline_y).toString() + 'px';
            config.chart_container_html.appendChild(cook_sep_html);
        }
        // if (graph.cook_count > 1) {
        //     const cook_tag_html = document.createElement('div');
        //     cook_tag_html.classList.add('cook-tag');
        //     cook_tag_html.innerHTML = "cook " + (id + 1).toString();
        //     cook_tag_html.style.top = (origin_map.get(graph.start).y + graph.start.bounds.size.y).toString() + 'px';
        //     cook_tag_html.style.left = ((cook_bound.left + cook_bound.right) / 2).toString() + 'px';
        //     config.chart_container_html.appendChild(cook_tag_html);
        // }
    }
}
//# sourceMappingURL=draw_cook_sep.js.map