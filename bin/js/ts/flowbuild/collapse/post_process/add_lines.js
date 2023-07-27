import { sample } from "../../../utils/set.js";
import { Vec2 } from "../../../utils/vec2.js";
// straight
export function addHorLine(from, xSteps, grid) {
    const [fromDir, toDir] = (0 < xSteps ? ['left', 'right'] : ['right', 'left']);
    for (let x = 0; x < Math.abs(xSteps); ++x) {
        grid.setLine(toDir, 'out', from.right(x * Math.sign(xSteps)));
        grid.setLine(fromDir, 'in', from.right((x + 1) * Math.sign(xSteps)));
    }
}
export function addVerLine(from, ySteps, grid) {
    const [fromDir, toDir] = (0 < ySteps ? ['bottom', 'top'] : ['top', 'bottom']);
    for (let y = 0; y < Math.abs(ySteps); ++y) {
        grid.setLine(fromDir, 'out', from.down(y * Math.sign(ySteps)));
        grid.setLine(toDir, 'in', from.down((y + 1) * Math.sign(ySteps)));
    }
}
// line
function addNormalLine(from, to, grid) {
    if (to.y - from.y == 1) {
        if (from.x == to.x) {
            addVerLine(from, 1, grid);
        }
        else {
            grid.insertRow(to.y);
            return addNormalLine(from, to.down(), grid);
        }
    }
    else {
        if (!grid.horEvery(from.x, to.x, to.y - 1, (entry) => !entry.tile.isSolid())) {
            grid.insertRow(to.y);
            addNormalLine(from, to.down(), grid);
            return;
        }
        addVerLine(from, (to.y - 1) - from.y, grid);
        addHorLine(new Vec2(from.x, to.y - 1), to.x - from.x, grid);
        addVerLine(to.up(), 1, grid);
    }
}
function addBackwardsLine(from, to, grid) {
    if (from.y - to.y == 1) {
        if (from.x == to.x) {
            addVerLine(from, -1, grid);
        }
        else {
            grid.insertRow(from.y);
            return addBackwardsLine(from.down(), to, grid);
        }
    }
    else {
        if (!grid.horEvery(from.x, to.x, to.y + 1, (entry) => !entry.tile.isSolid())) {
            grid.insertRow(from.y);
            return addBackwardsLine(from.down(), to, grid);
        }
        addVerLine(from, (to.y + 1) - from.y, grid);
        addHorLine(new Vec2(from.x, to.y + 1), to.x - from.x, grid);
        addVerLine(to.down(), -1, grid);
    }
}
function addLoopTopLine(from, to, grid) {
    if (!grid.horEvery(from.x, to.x, from.y - 1, (entry) => !entry.tile.isSolid())) {
        grid.insertRow(from.y);
        return addLoopTopLine(from.down(), to.down(), grid);
    }
    addVerLine(from, -1, grid);
    addHorLine(from.up(), to.x - from.x, grid);
    addVerLine(new Vec2(to.x, from.y - 1), to.y - (from.y - 1), grid);
}
function addLoopBottomLine(from, to, grid) {
    // if (!grid.horEvery(from.x, to.x, from.y, (entry: Entry) => !entry.tile.isSolid())) {
    //     grid.insertRow(from.y + 1);
    // }
    // addVerLine(from, 1, grid);
    // addHorLine(from.down(), to.x - from.x, grid);
    // addVerLine(new Vec2(to.x, from.y + 1), to.y - (from.y + 1), grid);
    addHorLine(from, to.x - from.x, grid);
    addVerLine(new Vec2(to.x, from.y), to.y - from.y, grid);
}
// add all
export function addLines(grid, graph) {
    for (const [node, _] of grid.nodeEntries) {
        const coords = grid.nodeCoords(node);
        // console.log(node.task.description)
        if (graph.isBackwards(node) == graph.isBackwards(sample(node.parents)) && node.hasTopSyncline) {
            const syncY = grid.nodeIn(node).y;
            addVerLine(new Vec2(coords.x, syncY), coords.y - syncY, grid);
        }
        if (graph.isBackwards(node) == graph.isBackwards(sample(node.parents)) && node.hasBottomSyncline) {
            const syncY = grid.nodeOut(node).y;
            addVerLine(coords, syncY - coords.y, grid);
        }
        for (const child of node.childs) {
            if (graph.isBackwards(node)) {
                if (graph.isBackwards(child)) {
                    addBackwardsLine(grid.nodeIn(node), grid.nodeOut(child), grid);
                }
                else {
                    addLoopTopLine(grid.nodeCoords(node), grid.nodeCoords(child), grid);
                }
            }
            else {
                if (graph.isBackwards(child)) {
                    addLoopBottomLine(grid.nodeCoords(node), grid.nodeCoords(child), grid);
                }
                else {
                    addNormalLine(grid.nodeOut(node), grid.nodeIn(child), grid);
                }
            }
        }
        // log_grid(grid);
    }
}
//# sourceMappingURL=add_lines.js.map