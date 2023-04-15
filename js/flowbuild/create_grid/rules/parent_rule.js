import { Vec2 } from "../../../utils/vec2.js";
import { share_sync_line } from "../sync_line.js";
export class ParentsRule {
    constructor(node) {
        this.node = node;
        this.parents = node.parents;
    }
    intersects_coords(from1, to1, from2, to2) {
        const left1 = Math.min(from1.x, to1.x);
        const right1 = Math.max(from1.x, to1.x);
        const left2 = Math.min(from2.x, to2.x);
        const right2 = Math.max(from2.x, to2.x);
        // ver-ver
        if (from1.x == from2.x && ((from1.y <= from2.y && from2.y <= to1.y) || (from2.y <= from1.y && from1.y <= to2.y))) {
            return true;
        }
        // hor-hor
        if (to1.y == to2.y && ((left1 <= to2.x && to2.x <= right1) || (left2 <= to1.x && to1.x <= right2))) {
            return true;
        }
        // hor-ver
        if ((left1 <= from2.x && from2.x <= right1) && (from2.y <= to1.y && to1.y <= to2.y)) {
            return true;
        }
        // ver-hor
        if ((left2 <= from1.x && from1.x <= right2) && (from1.y <= to2.y && to2.y <= to1.y)) {
            return true;
        }
        return false;
    }
    should_compare(from1, to1, from2, to2) {
        return !(to1 == to2 || share_sync_line(to1, to2, 'top'))
            && !(from1 == to2 || share_sync_line(from1, to2, 'top'))
            && !(from1 == from2 || share_sync_line(from1, from2, 'bottom'));
    }
    restricts(node) {
        return this.node == node;
    }
    reduce_possible_x(child, possible_x, grid, graph) {
        for (const other_child of grid.get_nodes()) {
            for (const other_parent of other_child.parents) {
                for (const parent of this.parents) {
                    if (grid.has_node(parent) && grid.has_node(other_parent) && this.should_compare(parent, child, other_parent, other_child)) {
                        for (const x of possible_x) {
                            if (this.intersects_coords(grid.get_node_coords(parent), new Vec2(x, graph.get_depth(child)), grid.get_node_coords(other_parent), grid.get_node_coords(other_child))) {
                                possible_x.delete(x);
                            }
                        }
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=parent_rule.js.map