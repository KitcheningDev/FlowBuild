import { set_element } from "../../../utils/set.js";
import { Vec2 } from "../../../utils/vec2.js";
function arithm_avg(nodes, grid, graph) {
    let count = 0;
    let x = 0;
    for (const node of nodes) {
        if (!graph.is_backwards(node)) {
            x += grid.get_node_coords(node).x;
            count++;
        }
    }
    return Math.floor(x / count);
}
export function should_average_parents(node, grid, graph) {
    if (grid.get_sync_line(node, 'top') !== null) {
        return false;
    }
    else if (node.parents.size == 1 && set_element(node.parents).is_start()) {
        return false;
    }
    else if (graph.is_backwards_head(node)) {
        return false;
    }
    return true;
}
export function should_average_childs(node, grid, graph) {
    if (grid.get_sync_line(node, 'bottom') !== null) {
        return false;
    }
    else if (node.childs.size == 1 && set_element(node.childs).is_last_step()) {
        return false;
    }
    else if (graph.is_backwards_tail(node)) {
        return false;
    }
    return true;
}
function recursive_center(node, grid, graph) {
    if (node.parents.size == 1 && set_element(node.parents).is_start()) {
        return;
    }
    for (const parent of node.parents) {
        recursive_center(parent, grid, graph);
    }
    if (should_average_parents(node, grid, graph)) {
        const x = arithm_avg(node.parents, grid, graph);
        const coords = grid.get_node_coords(node);
        if (x < coords.x) {
            if (grid.is_hor_path_empty(x, coords.x - 1, coords.y)) {
                grid.set_node(new Vec2(x, coords.y), node);
            }
        }
        else if (coords.x < x) {
            if (grid.is_hor_path_empty(coords.x + 1, x, coords.y)) {
                grid.set_node(new Vec2(x, coords.y), node);
            }
        }
    }
    grid.log();
}
export function center_nodes(grid, graph) {
    for (const head of graph.start.childs) {
        const x = arithm_avg(head.childs, grid, graph);
        const coords = grid.get_node_coords(head);
        if (x < coords.x) {
            if (grid.is_hor_path_empty(x, coords.x - 1, coords.y)) {
                grid.set_node(new Vec2(x, coords.y), head);
            }
        }
        else if (coords.x < x) {
            if (grid.is_hor_path_empty(coords.x + 1, x, coords.y)) {
                grid.set_node(new Vec2(x, coords.y), head);
            }
        }
    }
    for (const parent of graph.last_step.parents) {
        recursive_center(parent, grid, graph);
    }
}
// ------------
// let max_eval = -Infinity;
// let x_vals = null as number[];
// function eval_grid(grid: Grid): number {
//     for (const node of grid.get_nodes()) {
//         for (const parent of node.parents) {
//             if (grid.has_node(parent)) {
//             }
//         }
//     }
// }
// function center_per_permuation_indexed(index: number, order: Node[], grid: Grid, graph: Graph): boolean {
// }
// function center_per_permutation(grid: Grid, graph: Graph): void {
//     const order = [...grid.get_nodes()];
//     center_per_permuation_indexed() 
// }
//# sourceMappingURL=center_nodes.js.map