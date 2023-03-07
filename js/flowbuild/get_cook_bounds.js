import { last_elem } from "../utils/funcs.js";
export function get_cook_bounds(recipe, origin_map) {
    const bounds = [];
    for (let cook_id = 0; cook_id < recipe.cook_count; ++cook_id) {
        bounds.push({ left: Infinity, right: -Infinity });
        for (const path of recipe.graph.paths) {
            if (cook_id == path.cook_id) {
                last_elem(bounds).left = Math.min(origin_map.get(path.id).x - path.bounds.size.x / 2, last_elem(bounds).left);
                last_elem(bounds).right = Math.max(origin_map.get(path.id).x + path.bounds.size.x / 2, last_elem(bounds).right);
            }
        }
    }
    return bounds;
}
//# sourceMappingURL=get_cook_bounds.js.map