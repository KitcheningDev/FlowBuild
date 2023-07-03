import { Vec2, vec2_sub } from "../../../utils/vec2.js";
import { Graph } from "../../graph/graph.js";
import { FlowGrid } from "../../grid/flow_grid.js";
import { Rule } from "../rule.js";
import { Node } from "../../graph/node.js";
import { set_element, set_equal } from "../../../utils/set.js";

export class PathRule implements Rule {
    from: Node;
    to: Node;

    constructor(from: Node, to: Node) {
        this.from = from;
        this.to = to;
    }

    restricts(node: Node): boolean {
        return this.from == node || this.to == node;
    }
    reduce_possible_x(node: Node, possible_x: number[], grid: FlowGrid, graph: Graph): void {
        if (grid.has_node(this.from) || grid.has_node(this.to)) {
            const setted = grid.has_node(this.from) ? this.from : this.to;
            if (possible_x.includes(grid.get_node_coords(setted).x)) {
                possible_x.length = 0;
                possible_x.push(grid.get_node_coords(setted).x);
            }
            else {
                possible_x.length = 0;
            }
        }
    }
}