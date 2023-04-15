import { Vec2 } from "./grid.js";
import { set_equal } from "../../utils/set.js";
function get_grid_count(nodes, grid) {
    let count = 0;
    for (const node of nodes) {
        if (grid.has(node)) {
            count++;
        }
    }
    return count;
}
function get_bounds(nodes, grid) {
    let max_x = -Infinity;
    let min_x = Infinity;
    for (const node of nodes) {
        if (grid.has(node)) {
            const x = grid.get_coords(node).x;
            max_x = Math.max(x, max_x);
            min_x = Math.min(x, min_x);
        }
    }
    return { left: min_x, right: max_x };
}
export class AdjacencyRule {
    constructor(nodes) {
        this.nodes = nodes;
    }
    restricts(node) {
        return this.nodes.has(node);
    }
    reduce_possible_x(node, possible_x, grid, graph) {
        const grid_count = get_grid_count(this.nodes, grid);
        if (grid_count == 0) {
            return;
        }
        const bounds = get_bounds(this.nodes, grid);
        const unset_nodes = this.nodes.size - grid_count;
        for (const x of possible_x) {
            if (bounds.left - unset_nodes <= x && x <= bounds.right + unset_nodes) {
                if (grid.get(new Vec2(x, graph.get_depth(node))) !== null) {
                    possible_x.delete(x);
                }
            }
            else {
                possible_x.delete(x);
            }
        }
    }
}
export class ParentsRule {
    constructor(node) {
        this.node = node;
        this.parents = node.parents;
    }
    restricts(node) {
        return this.node == node;
    }
    reduce_possible_x(node, possible_x, grid, graph) {
        for (const parent of this.parents) {
            const coords = grid.get_coords(parent);
            for (let y = coords.y + 1; y <= graph.get_depth(parent); ++y) {
                if (grid.get(new Vec2(coords.x, y)) !== null) {
                    possible_x.clear();
                    return;
                }
            }
        }
        const bounds = get_bounds(this.parents, grid);
        for (const x of possible_x) {
            if (x < bounds.left || bounds.right < x) {
                possible_x.delete(x);
            }
        }
    }
}
function get_same_relatives_sets(graph, relative) {
    const same_relatives_sets = new Set();
    const same_relatives_map = new Map();
    for (const node of graph.nodes) {
        let found_set = false;
        for (const [map_node, set] of same_relatives_map) {
            if (set_equal(node[relative], map_node[relative])) {
                same_relatives_map.set(node, set);
                set.add(node);
                found_set = true;
                break;
            }
        }
        if (!found_set) {
            const set = new Set([node]);
            same_relatives_map.set(node, set);
            same_relatives_sets.add(set);
        }
    }
    return same_relatives_sets;
}
export function create_rules(graph) {
    const rules = new Set();
    for (const set of [
        ...get_same_relatives_sets(graph, 'parents'),
        ...get_same_relatives_sets(graph, 'childs')
    ]) {
        if (set.size > 1) {
            rules.add(new AdjacencyRule(set));
        }
    }
    for (const node of graph.nodes) {
        if (node.parents.size > 0) {
            rules.add(new ParentsRule(node));
        }
    }
    return rules;
}
//# sourceMappingURL=rule.js.map