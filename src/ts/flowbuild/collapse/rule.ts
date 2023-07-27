import { Graph } from "../graph/graph.js";
import { FlowGrid } from "../grid/flow_grid.js";
import { Node } from "../graph/node.js";

export interface Rule {
    affects: (node: Node) => boolean;
    possibleX: (node: Node, possible_x: number[], grid: FlowGrid, graph: Graph) => number[];
}