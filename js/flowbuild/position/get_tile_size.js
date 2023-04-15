import { Vec2, vec2_add } from "../../utils/vec2.js";
import { config } from "../config.js";
import { get_node_size, get_sync_line_height } from "./html_size.js";
export function get_tile_size(tile, margin = true) {
    let size = new Vec2(0, 0);
    if (tile.node !== null && !tile.node.task.is_empty()) {
        size = get_node_size(tile.node);
        if (margin) {
            size = vec2_add(config.task_margin, size);
        }
    }
    else if (tile.sync_lines.top || tile.sync_lines.bottom) {
        size = new Vec2(0, get_sync_line_height());
        if (margin) {
            size = vec2_add(config.sync_line_margin, size);
        }
    }
    else if (tile.cook_line) {
        if (margin) {
            size = config.cook_line_margin.copy();
        }
    }
    else if (tile.lines.has_connector()) {
        size = new Vec2(12, 12);
        if (margin) {
            size = vec2_add(config.connector_margin, size);
        }
    }
    return size;
}
//# sourceMappingURL=get_tile_size.js.map