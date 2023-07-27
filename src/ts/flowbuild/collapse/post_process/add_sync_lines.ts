import { sample, setIntersection } from "../../../utils/set.js";
import { Graph } from "../../graph/graph.js";
import { Node } from "../../graph/node.js";
import { FlowGrid } from "../../grid/flow_grid.js";

export function addSyncLines(grid: FlowGrid, graph: Graph): void {
    const synclineTopAdded = new Set<Node>();
    const synclineBottomAdded = new Set<Node>();
    grid.addSyncline(sample(graph.start.childs).topSyncline, 'top');
    grid.addSyncline(sample(graph.end.parents).bottomSyncline, 'bottom');
    for (const [node, _] of grid.nodeEntries) {
        if (!sample(node.parents)?.isStart() && node.hasTopSyncline) {
            const syncline = new Set([...node.topSyncline].filter((other: Node) => graph.isBackwards(other) == graph.isBackwards(node)));
            if (1 < syncline.size && setIntersection(node.topSyncline, synclineTopAdded).size == 0) {
                grid.addSyncline(node.topSyncline, 'top');
                synclineTopAdded.add(node);
            }
        }
        if (!sample(node.childs)?.isEnd() && node.hasBottomSyncline) {
            const syncline = new Set([...node.bottomSyncline].filter((other: Node) => graph.isBackwards(other) == graph.isBackwards(node)));
            if (1 < syncline.size && setIntersection(node.bottomSyncline, synclineBottomAdded).size == 0) {
                grid.addSyncline(node.bottomSyncline, 'bottom');
                synclineBottomAdded.add(node);
            }
        }
    }
}