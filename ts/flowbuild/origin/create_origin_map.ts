import { vec2_t } from "../../utils/vec2.js";
import { global_config } from "../config.js";
import { graph_t } from "../graph.js";
import { ID } from "../hash_str.js";
import { center_origin_map } from "./center_origin_map.js";
import { create_origin_map_x } from "./create_origin_map_x.js";
import { create_origin_map_y } from "./create_origin_map_y.js";
import { scale_origin_map } from "./scale_origin_map.js";

export function create_origin_map(graph :graph_t): Map<ID, vec2_t> {
    const origin_map_x = create_origin_map_x(graph);
    const origin_map_y = create_origin_map_y(graph);

    // fill map
    const origin_map = new Map<ID, vec2_t>();
    for (const path of graph.paths) {
        origin_map.set(path.id, new vec2_t(origin_map_x.get(path.id), origin_map_y.get(path.id)));
    }

    // post process map
    scale_origin_map(graph.paths, origin_map);
    center_origin_map(graph.paths, origin_map);

    // center start and end
    origin_map.get(graph.start.id).x = global_config.chart_size.x / 2 + global_config.chart_hor_margin;
    origin_map.get(graph.end.id).x = global_config.chart_size.x / 2 + global_config.chart_hor_margin;
    return origin_map;
}