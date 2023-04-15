import { get_hor_bounds } from "../bounds.js";
export class AdjacencyRule {
    constructor(nodes) {
        this.nodes = nodes;
    }
    restricts(node) {
        return this.nodes.has(node);
    }
    reduce_possible_x(node, possible_x, grid, graph) {
        let member_count = 0;
        for (const member of this.nodes) {
            if (grid.has_node(member)) {
                member_count++;
            }
        }
        if (member_count == 0) {
            return;
        }
        const member_bounds = get_hor_bounds((node) => { return this.nodes.has(node); }, grid);
        const max_bounds_off = (this.nodes.size - (member_bounds.right - member_bounds.left)) - 1;
        for (const x of possible_x) {
            if (x < member_bounds.left - max_bounds_off || member_bounds.right + max_bounds_off < x) {
                possible_x.delete(x);
            }
        }
    }
}
//# sourceMappingURL=adjacency_rule.js.map