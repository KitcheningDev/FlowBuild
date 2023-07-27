import { sample } from "../../../utils/set.js";
import { Vec2, vec2Equals } from "../../../utils/vec2.js";
export function createCenterOrder(grid, graph) {
    const order = [];
    for (const node of graph.nodes) {
        if (node.childs.size > 0) {
            const child = sample(node.childs);
            const syncline = new Set([...child.topSyncline].filter((other) => graph.isBackwards(other) == graph.isBackwards(node)));
            const samebackwardsParents = new Set([...child.parents].filter((other) => graph.isBackwards(other) == graph.isBackwards(node)));
            if (samebackwardsParents.size == 1 && 1 < syncline.size) {
                order.push([node, child.topSyncline]);
            }
        }
        if (node.parents.size > 0) {
            const parent = sample(node.parents);
            const syncline = new Set([...parent.bottomSyncline].filter((other) => graph.isBackwards(other) == graph.isBackwards(node)));
            const samebackwardsChilds = new Set([...parent.childs].filter((other) => graph.isBackwards(other) == graph.isBackwards(node)));
            if (samebackwardsChilds.size == 1 && 1 < syncline.size) {
                order.push([node, parent.bottomSyncline]);
            }
        }
    }
    order.sort((first, second) => {
        const firstBounds = grid.bounds((node) => first[1].has(node));
        const secondBounds = grid.bounds((node) => second[1].has(node));
        if (firstBounds.includes(secondBounds)) {
            return 1;
        }
        else if (secondBounds.includes(firstBounds)) {
            return -1;
        }
        else {
            return 0;
        }
    });
    // console.log(order);
    return order;
}
export function center(grid, graph, iteration = 0) {
    let changed = false;
    if (grid.size.x == 1) {
        grid.insertColumn(0);
        grid.insertColumn(2);
        changed = true;
    }
    const order = createCenterOrder(grid, graph);
    for (const [node, relatives] of order) {
        const bounds = grid.bounds((node) => relatives.has(node));
        if (bounds.width % 2 == 1) {
            bounds.right += 1;
            let foundX = bounds.center.x;
            for (let x = bounds.left + 1; x <= bounds.right; ++x) {
                let found = true;
                for (const [other_node, other_relatives] of order) {
                    if (node == other_node) {
                        break;
                    }
                    const other_bounds = grid.bounds((node) => other_relatives.has(node));
                    if (other_bounds.inBounds(new Vec2(x - 1, other_bounds.center.y))) {
                        found = false;
                        break;
                    }
                }
                if (found) {
                    foundX = x;
                    break;
                }
            }
            grid.insertColumn(foundX);
            changed = true;
        }
        if (node.isStart() || node.isEnd() || node.task.cook == sample(relatives).task.cook) {
            if (!vec2Equals(grid.nodeCoords(node), new Vec2(bounds.center.x, grid.nodeCoords(node).y))) {
                changed = true;
                grid.setNode(node, new Vec2(bounds.center.x, grid.nodeCoords(node).y));
            }
        }
        // log_grid(grid, 'CENTER ' + node.task.description);
    }
    if (changed && iteration < 5) {
        grid.shrinkToFit();
        return center(grid, graph, iteration + 1);
    }
}
//# sourceMappingURL=center.js.map