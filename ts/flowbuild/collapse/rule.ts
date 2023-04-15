import { Graph } from "../graph/graph.js";
import { FlowGrid } from "../grid/flow_grid.js";
import { Node } from "../graph/node.js";

export interface Rule {
    restricts: (node: Node) => boolean;
    reduce_possible_x: (node: Node, possible_x: number[], grid: FlowGrid, graph: Graph) => void;
}