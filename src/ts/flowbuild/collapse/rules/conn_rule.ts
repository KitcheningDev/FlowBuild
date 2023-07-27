import { Vec2, vec2Sub } from "../../../utils/vec2.js";
import { Graph } from "../../graph/graph.js";
import { FlowGrid } from "../../grid/flow_grid.js";
import { Rule } from "../rule.js";
import { Node } from "../../graph/node.js";
import { setEqual } from "../../../utils/set.js";
import { filterInPlace } from "../../../utils/array.js";
import { depth } from "../../graph/depth_map.js";

export class ConnRule implements Rule {
    constructor(parent: Node, child: Node, bw: boolean) {
        this.parent = parent;
        this.child = child;
        this.bw = bw;
    }
    intersects(from1: Vec2, to1: Vec2, from2: Vec2, to2: Vec2, reverse1: boolean, reverse2: boolean): boolean {
        from1 = from1.clone();
        to1 = to1.clone();
        from2 = from2.clone();
        to2 = to2.clone();
        // console.log(from1, to1, from2, to2);
        const diff1 = vec2Sub(to1, from1);
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
        const diff2 = vec2Sub(to2, from2);
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
    shouldCompare(from1: Node, to1: Node, from2: Node, to2: Node): boolean {
        return !setEqual(from1.childs, from2.childs) && !setEqual(to1.parents, to2.parents);
    }
    affects(node: Node): boolean {
        return this.parent == node || this.child == node;
    }
    possibleX(node: Node, possible_x: number[], grid: FlowGrid, graph: Graph): number[] {
        if (!grid.hasNode(this.parent) && !grid.hasNode(this.child)) {
            return possible_x;
        }
        // filter_in_place(possible_x, (x: number) => {
        //     const parent_coords = grid.has_node(this.parent) ? grid.get_node_coords(this.parent) : new Vec2(x, graph.get_depth(this.parent));
        //     const child_coords = grid.has_node(this.child) ? grid.get_node_coords(this.child) : new Vec2(x, graph.get_depth(this.child));
        //     return this.bw && parent_coords.x == child_coords.x;
        // });
        for (const [child, child2_coords] of grid.nodeEntries) {
            for (const parent of child.parents) {
                if (grid.hasNode(parent)) {
                    const parent2_coords = grid.nodeCoords(parent);
                    if (this.shouldCompare(this.parent, this.child, parent, child)) {
                        filterInPlace(possible_x, (x: number) => {
                            const parent_coords = grid.hasNode(this.parent) ? grid.nodeCoords(this.parent) : new Vec2(x, depth(this.parent));
                            const child_coords = grid.hasNode(this.child) ? grid.nodeCoords(this.child) : new Vec2(x, depth(this.child));
                            return this.intersects(parent_coords, child_coords, parent2_coords, child2_coords, graph.isBackwards(this.child), graph.isBackwards(child));
                        });
                    }
                }
            }
        }
        return possible_x;
    }
    // members
    parent: Node;
    child: Node;
    bw: boolean;
}