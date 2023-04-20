import { Vec2, vec2_sub } from "../../../utils/vec2.js";
import { set_equal } from "../../../utils/set.js";
import { filter_in_place } from "../../../utils/array.js";
export class ConnRule {
    constructor(parent, child, bw) {
        this.parent = parent;
        this.child = child;
        this.bw = bw;
    }
    intersects_coords(from1, to1, from2, to2, reverse1, reverse2) {
        from1 = from1.copy();
        to1 = to1.copy();
        from2 = from2.copy();
        to2 = to2.copy();
        // console.log(from1, to1, from2, to2);
        const diff1 = vec2_sub(to1, from1);
        if (reverse1) {
            if (diff1.x != 0) {
                from1.x += Math.sign(diff1.x);
            }
            else {
                from1.y += Math.sign(diff1.y);
            }
        }
        else {
            if (diff1.y != 0) {
                from1.y += Math.sign(diff1.y);
            }
            else {
                from1.x += Math.sign(diff1.x);
            }
        }
        const diff2 = vec2_sub(to2, from2);
        if (reverse2) {
            if (diff2.x != 0) {
                from2.x += Math.sign(diff2.x);
            }
            else {
                from2.y += Math.sign(diff2.x);
            }
        }
        else {
            if (diff2.y != 0) {
                from2.y += Math.sign(diff2.y);
            }
            else {
                from2.x += Math.sign(diff2.x);
            }
        }
        if (reverse1) {
            const temp = from1;
            from1 = to1;
            to1 = temp;
        }
        if (reverse2) {
            const temp = from2;
            from2 = to2;
            to2 = temp;
        }
        const [left1, right1] = [Math.min(from1.x, to1.x), Math.max(from1.x, to1.x)];
        const [top1, bottom1] = [Math.min(from1.y, to1.y), Math.max(from1.y, to1.y)];
        const [left2, right2] = [Math.min(from2.x, to2.x), Math.max(from2.x, to2.x)];
        const [top2, bottom2] = [Math.min(from2.y, to2.y), Math.max(from2.y, to2.y)];
        // ver-ver
        if (from1.x == from2.x && ((top1 <= from2.y && from2.y <= bottom1) || (top2 <= from1.y && from1.y <= bottom2))) {
            return true;
        }
        // hor-hor
        if (to1.y == to2.y && ((left1 <= to2.x && to2.x <= right1) || (left2 <= to1.x && to1.x <= right2))) {
            return true;
        }
        // hor-ver
        if ((left1 <= from2.x && from2.x <= right1) && (top2 <= to1.y && to1.y <= bottom2)) {
            return true;
        }
        // ver-hor
        if ((left2 <= from1.x && from1.x <= right2) && (top1 <= to2.y && to2.y <= bottom1)) {
            return true;
        }
        return false;
    }
    should_compare(from1, to1, from2, to2) {
        return !set_equal(from1.childs, from2.childs) && !set_equal(to1.parents, to2.parents);
    }
    restricts(node) {
        return this.parent == node || this.child == node;
    }
    reduce_possible_x(node, possible_x, grid, graph) {
        // console.log("reduce", this.parent.task.description, this.child.task.description);
        if (!grid.has_node(this.parent) && !grid.has_node(this.child)) {
            return;
        }
        filter_in_place(possible_x, (x) => {
            const parent_coords = grid.has_node(this.parent) ? grid.get_node_coords(this.parent) : new Vec2(x, graph.get_depth(this.parent));
            const child_coords = grid.has_node(this.child) ? grid.get_node_coords(this.child) : new Vec2(x, graph.get_depth(this.child));
            return this.bw && parent_coords.x == child_coords.x;
        });
        for (const [child, child2_coords] of grid.get_node_entries()) {
            for (const parent of child.parents) {
                if (grid.has_node(parent)) {
                    const parent2_coords = grid.get_node_coords(parent);
                    // console.log("compare", parent.task.description, child.task.description);
                    if (this.should_compare(this.parent, this.child, parent, child)) {
                        filter_in_place(possible_x, (x) => {
                            const parent_coords = grid.has_node(this.parent) ? grid.get_node_coords(this.parent) : new Vec2(x, graph.get_depth(this.parent));
                            const child_coords = grid.has_node(this.child) ? grid.get_node_coords(this.child) : new Vec2(x, graph.get_depth(this.child));
                            return this.intersects_coords(parent_coords, child_coords, parent2_coords, child2_coords, graph.is_backwards(this.child), graph.is_backwards(child));
                        });
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=conn_rule.js.map