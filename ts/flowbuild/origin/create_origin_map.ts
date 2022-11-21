import { vec2_t } from "../../utils/vec2.js";
import { graph_t } from "../graph.js";
import { ID } from "../hash_str.js";
import { create_origin_map_x } from "./create_origin_map_x.js";
import { create_origin_map_y } from "./create_origin_map_y.js";

export function create_origin_map(graph :graph_t): Map<ID, vec2_t> {
    const origin_map_x = create_origin_map_x(graph);
    const origin_map_y = create_origin_map_y(graph);

    const origin_map = new Map<ID, vec2_t>();
    for (const path of graph.paths) {
        origin_map.set(path.id, new vec2_t(origin_map_x.get(path.id), origin_map_y.get(path.id)));
    }
    return origin_map;
}