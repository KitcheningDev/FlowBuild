import { Graph } from "../../graph/graph.js";
import { FlowGrid } from "../../grid/flow_grid.js";
import { Rule } from "../rule.js";
import { Node } from "../../graph/node.js";

export class EndRule implements Rule {
    nodes: Set<Node>;

    constructor(graph: Graph) {
        this.nodes = graph.last_step.parents;
    }

    restricts(): boolean {
        return true;
    }
    reduce_possible_x(node: Node, possible_x: Set<number>, grid: FlowGrid, graph: Graph): void {
        const y = graph.get_depth(node);
        for (const end_node of this.nodes) {
            if (grid.has_node(end_node)) {
                const coords = grid.get_node_coords(end_node);
                if (coords.y < y) {
                    possible_x.delete(coords.x);
                }
            }
        }
    }
}