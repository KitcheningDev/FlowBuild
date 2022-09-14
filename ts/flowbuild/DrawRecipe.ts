import { ArrangePaths } from "./ArrangePaths.js";
import { Recipe } from "./Recipe.js";
import { CreatePathBoundsMap, config, ResetConfig } from "./PathBounds.js";
import { Add, Div, Sub, Abs, Vec2, Equals } from "../Utils/Vec2.js";

function DrawArrow(from: Vec2, to: Vec2): void {
    if (Equals(from, to))
        return;

    const arrow_center = Div(Add(from, to), 2);
    const arrow_size = Abs(Sub(from, to));

    config.arrow_html.style.left = arrow_center.x.toString() + "px";
    config.arrow_html.style.top = arrow_center.y.toString() + "px";
    config.arrow_html.style.width = Math.max(arrow_size.x, 2).toString() + "px";
    config.arrow_html.style.height = Math.max(arrow_size.y, 2).toString() + "px";
    config.flowchart_html.appendChild(config.arrow_html.cloneNode(true));
}
export function DrawRecipe(recipe: Recipe): void {
    ResetConfig();
    const path_bounds_map = CreatePathBoundsMap(recipe);
    const origin_map = ArrangePaths(recipe, path_bounds_map);

    config.flowchart_html.innerHTML = "";
    for (const [path, origin] of origin_map.entries()) {
        const path_bounds = path_bounds_map.get(path);

        for (let i = 0; i < path.nodes.length; ++i) {
            // draw node
            config.box_html.innerHTML = path.nodes[i];
            config.box_html.style.left = (origin.x + path_bounds.node_rects[i].origin.x).toString() + "px";
            config.box_html.style.top = (origin.y + path_bounds.node_rects[i].origin.y).toString() + "px";
            config.flowchart_html.appendChild(config.box_html.cloneNode(true));

            // draw inner connection
            if (i != path.nodes.length - 1)
                DrawArrow(Add(origin, path_bounds.node_rects[i].origin), Add(origin, path_bounds.node_rects[i + 1].origin));

            // draw outer connection
            for (const child of path.childs) {
                const parent_out = Add(origin, path_bounds.out);
                const child_in = Add(origin_map.get(child), path_bounds_map.get(child).in);

                const y_plateau = child_in.y - path_bounds_map.get(child).in.y - config.depth_margin;
                //DrawArrow(parent_out, new Vec2(parent_out.x, y_plateau));
                //DrawArrow(new Vec2(parent_out.x, y_plateau), new Vec2(child_in.x, y_plateau));
                //DrawArrow(new Vec2(child_in.x, y_plateau), child_in);

                const y_avg = (parent_out.y + child_in.y) / 2;
                DrawArrow(parent_out, new Vec2(parent_out.x, y_avg));
                DrawArrow(new Vec2(parent_out.x, y_avg), new Vec2(child_in.x, y_avg));
                DrawArrow(new Vec2(child_in.x, y_avg), child_in);
            }
        }
    }
}