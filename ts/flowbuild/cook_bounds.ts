import { last_elem } from "../utils/funcs.js";
import { vec2_t } from "../utils/vec2.js";
import { ID } from "./hash_str.js";
import { recipe_t } from "./recipe.js";

export function get_cook_bounds(recipe: recipe_t, origin_map: Map<ID, vec2_t>): { left: number, right:number }[] {
    const bounds = [] as { left: number, right: number }[];
    for (let cook_id = 0; cook_id < recipe.cook_count; ++cook_id) {
        bounds.push({ left: 99999, right: -99999 });
        for (const path of recipe.graph.paths) {
            if (cook_id == path.cook_id) {
                last_elem(bounds).left = Math.min(origin_map.get(path.id).x - path.bounds.size.x / 2, last_elem(bounds).left);
                last_elem(bounds).right = Math.max(origin_map.get(path.id).x + path.bounds.size.x / 2, last_elem(bounds).right);
            }
        }
    }
    return bounds;
}