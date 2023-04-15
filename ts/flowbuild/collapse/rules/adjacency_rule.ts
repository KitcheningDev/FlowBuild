import { Graph } from "../../graph/graph.js";
import { FlowGrid } from "../../grid/flow_grid.js";
import { Rule } from "../rule.js";
import { Node } from "../../graph/node.js";

export class AdjacencyRule implements Rule {
    nodes: Set<Node>;

    constructor(nodes: Set<Node>) {
        this.nodes = nodes;
    }

    restricts(node: Node): boolean {
        return this.nodes.has(node);
    }
    reduce_possible_x(node: Node, possible_x: Set<number>, grid: FlowGrid, graph: Graph): void {
        const member_bounds = grid.get_hor_bounds((node: Node) => { return this.nodes.has(node) });
        if (member_bounds === null) {
            return;
        }
        const max_bounds_off = (this.nodes.size - (member_bounds.right - member_bounds.left)) - 1;
        for (const x of possible_x) {
            if (x < member_bounds.left - max_bounds_off || member_bounds.right + max_bounds_off < x) {
                possible_x.delete(x);
            }
        }
    }
}