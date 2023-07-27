import { sample, setIntersection } from "../../../utils/set.js";
export function addSyncLines(grid, graph) {
    var _a, _b;
    const synclineTopAdded = new Set();
    const synclineBottomAdded = new Set();
    grid.addSyncline(sample(graph.start.childs).topSyncline, 'top');
    grid.addSyncline(sample(graph.end.parents).bottomSyncline, 'bottom');
    for (const [node, _] of grid.nodeEntries) {
        if (!((_a = sample(node.parents)) === null || _a === void 0 ? void 0 : _a.isStart()) && node.hasTopSyncline) {
            const syncline = new Set([...node.topSyncline].filter((other) => graph.isBackwards(other) == graph.isBackwards(node)));
            if (1 < syncline.size && setIntersection(node.topSyncline, synclineTopAdded).size == 0) {
                grid.addSyncline(node.topSyncline, 'top');
                synclineTopAdded.add(node);
            }
        }
        if (!((_b = sample(node.childs)) === null || _b === void 0 ? void 0 : _b.isEnd()) && node.hasBottomSyncline) {
            const syncline = new Set([...node.bottomSyncline].filter((other) => graph.isBackwards(other) == graph.isBackwards(node)));
            if (1 < syncline.size && setIntersection(node.bottomSyncline, synclineBottomAdded).size == 0) {
                grid.addSyncline(node.bottomSyncline, 'bottom');
                synclineBottomAdded.add(node);
            }
        }
    }
}
//# sourceMappingURL=add_sync_lines.js.map