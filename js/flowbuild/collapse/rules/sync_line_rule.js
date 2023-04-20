import { Vec2 } from "../../../utils/vec2.js";
import { set_element } from "../../../utils/set.js";
export class SyncLineRule {
    constructor(nodes, siblings) {
        this.nodes = nodes;
        this.siblings = siblings;
    }
    all_set(grid) {
        for (const node of this.nodes) {
            if (!grid.has_node(node)) {
                return false;
            }
        }
        return true;
    }
    restricts(node) {
        return true;
    }
    reduce_possible_x(node, possible_x, grid, graph) {
        if (this.all_set(grid)) {
            const bounds = grid.get_hor_bounds((node) => this.nodes.has(node));
            if ((bounds.length() % 2) == (this.siblings.size % 2)) {
                possible_x.length = 0;
            }
            else if (this.nodes.size <= bounds.length() && grid.get(new Vec2(Math.floor(bounds.center()), graph.get_depth(set_element(this.nodes)))).is_solid()) {
                possible_x.length = 0;
            }
            for (const sibling of this.siblings) {
                if (grid.has_node(sibling) && sibling.task.cook == set_element(this.nodes).task.cook) {
                    const coords = grid.get_node_coords(sibling);
                    const off = (this.siblings.size - 1) / 2;
                    if (coords.x < bounds.center() - off || bounds.center() + off < coords.x) {
                        possible_x.length = 0;
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=sync_line_rule.js.map