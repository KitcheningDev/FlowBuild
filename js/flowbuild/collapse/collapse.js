import { Vec2 } from "../../utils/vec2.js";
import { FlowGrid } from "../grid/flow_grid.js";
import { depth } from "../graph/depth_map.js";
// possible x
export function possibleX(node, grid, graph, rules) {
    let possible_x = [];
    const y = depth(node);
    for (let x = 0; x < grid.size.x; ++x) {
        if (grid.get(new Vec2(x, y)).isEmpty()) {
            possible_x.push(x);
        }
    }
    for (const rule of rules) {
        if (rule.affects(node) && possible_x.length > 0) {
            possible_x = rule.possibleX(node, possible_x, grid, graph);
        }
    }
    return possible_x;
}
// collapse order
function collapseOrder(node, order = []) {
    if (order.includes(node)) {
        return order;
    }
    for (const parent of node.parents) {
        collapseOrder(parent, order);
    }
    order.push(node);
    return order;
}
// collapse
function collapseNode(index, order, grid, rules, graph) {
    if (index == order.length) {
        return true;
    }
    const node = order[index];
    for (const x of possibleX(node, grid, graph, rules)) {
        grid.setNode(node, new Vec2(x, depth(node)));
        if (collapseNode(index + 1, order, grid, rules, graph)) {
            return true;
        }
        grid.removeNode(node);
    }
    return false;
}
let iteration = 0;
export function collapse(graph, rules) {
    iteration = 0;
    const grid = new FlowGrid(graph);
    while (!collapseNode(0, collapseOrder(graph.end), grid, rules, graph)) {
        console.warn("COLLAPSE FAILED", grid.size.x);
        grid.setSize(grid.size.right());
        if (iteration++ == 15) {
            break;
        }
    }
    return grid;
}
//# sourceMappingURL=collapse.js.map