import { vec2_t } from "../../utils/vec2.js";
import { create_origin_map_x } from "../../../etc/dump/create_origin_map_x_.js";
import { create_origin_map_y } from "./create_origin_map_y.js";
export function create_origin_map(recipe) {
    const origin_map_x = create_origin_map_x(recipe);
    const origin_map_y = create_origin_map_y(recipe);
    const origin_map = new Map();
    for (const path of recipe.graph.paths) {
        origin_map.set(path.id, new vec2_t(origin_map_x.get(path.id), origin_map_y.get(path.id)));
    }
    return origin_map;
}
//# sourceMappingURL=create_origin_map.js.map