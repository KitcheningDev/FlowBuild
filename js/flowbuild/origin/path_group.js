var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Grid_data, _Grid_size, _Grid_graph, _Grid_eq_groups, _Grid_collapse_order, _Grid_paths_pos, _Grid_eq_group_x, _Grid_rules, _Grid_valid;
import { create_arr, create_arr_with_func, cut_set, last_elem } from "../../utils/funcs.js";
import { Vec2 } from "../../utils/vec2.js";
import { create_eq_groups } from "./eq_group.js";
import { permutate } from "../../utils/permutate.js";
function create_dep_groups(eq_groups) {
    const dep_groups = new Set();
    for (const eq_group of eq_groups) {
        let found = false;
        for (const dep_group of dep_groups) {
            for (const end of [dep_group[0], last_elem(dep_group)]) {
                const cut = cut_set(eq_group.shared, end.shared);
                if (cut.size > 0) {
                    // exclude common end path dependancies
                    if (cut.size == 1) {
                        const [el] = cut;
                        if (el.parents.size == 0) {
                            continue;
                        }
                    }
                    if (end == dep_group[0]) {
                        dep_group.unshift(eq_group);
                    }
                    else if (end == last_elem(dep_group)) {
                        dep_group.push(end);
                    }
                    found = true;
                    break;
                }
            }
            if (!found && dep_group.includes(eq_group)) {
                console.error("Impossible to align paths without intersections!");
                found = true;
                break;
            }
        }
        if (!found) {
            dep_groups.add([eq_group]);
        }
    }
    // debug
    for (const dep_group of dep_groups) {
        console.log("DEP GROUP:");
        for (const eq_group of dep_group) {
            console.log("\tEQ GROUP:");
            console.log("\t\tMEMBERS:");
            for (const path of eq_group.members) {
                console.log("\t\t\t", path.head.str);
            }
            console.log("\t\tCHILDS:");
            for (const path of eq_group.shared) {
                console.log("\t\t\t", path.head.str);
            }
        }
    }
    return dep_groups;
}
function create_adjacency_rules(eq_groups) {
    const dep_groups = create_dep_groups(eq_groups);
    const adjacency_rules = new Map();
    for (const eq_group of eq_groups) {
        adjacency_rules.set(eq_group, []);
    }
    for (const dep_group of dep_groups) {
        let last = null;
        for (const eq_group of dep_group) {
            if (last !== null) {
                adjacency_rules.get(last).push(eq_group);
                adjacency_rules.get(eq_group).push(last);
            }
            last = eq_group;
        }
    }
    return adjacency_rules;
}
function create_collapse_order(graph, eq_groups) {
    const order = [];
    for (let depth = 1; depth < graph.depth; ++depth) {
        for (const eq_group of eq_groups) {
            if (!order.includes(eq_group)) {
                for (const member of eq_group.members) {
                    if (depth == graph.get_depth(member)) {
                        order.push(eq_group);
                        break;
                    }
                }
            }
        }
    }
    return order;
}
export class Grid {
    constructor(graph) {
        _Grid_data.set(this, void 0);
        _Grid_size.set(this, void 0);
        _Grid_graph.set(this, void 0);
        _Grid_eq_groups.set(this, void 0);
        _Grid_collapse_order.set(this, void 0);
        _Grid_paths_pos.set(this, void 0);
        _Grid_eq_group_x.set(this, void 0);
        _Grid_rules.set(this, void 0);
        _Grid_valid.set(this, void 0);
        const depth_counts = create_arr(graph.depth + 1, 0);
        for (const path of graph.paths) {
            const min_y = graph.get_depth(path);
            const max_y = min_y + graph.get_diff_max(path);
            for (let y = min_y; y < max_y; ++y) {
                depth_counts[y]++;
            }
        }
        __classPrivateFieldSet(this, _Grid_size, new Vec2(Math.max(...depth_counts), graph.depth + 1), "f");
        this.clear();
        __classPrivateFieldSet(this, _Grid_graph, graph, "f");
        __classPrivateFieldSet(this, _Grid_eq_groups, create_eq_groups(graph.paths, 'parents'), "f");
        __classPrivateFieldSet(this, _Grid_collapse_order, create_collapse_order(graph, __classPrivateFieldGet(this, _Grid_eq_groups, "f")), "f");
        // console.log("DEPTH LEVELS", ...graph.depth_levels);
        // console.log("COLLAPSE ORDER", ...this.#collapse_order);
        __classPrivateFieldSet(this, _Grid_rules, create_adjacency_rules(__classPrivateFieldGet(this, _Grid_eq_groups, "f")), "f");
        __classPrivateFieldSet(this, _Grid_valid, false, "f");
    }
    get size() {
        return __classPrivateFieldGet(this, _Grid_size, "f").copy();
    }
    get mid() {
        return Math.floor((__classPrivateFieldGet(this, _Grid_size, "f").x - 1) / 2);
    }
    get valid() {
        return __classPrivateFieldGet(this, _Grid_valid, "f");
    }
    in_bounds(pos) {
        return 0 <= pos.x && pos.x < __classPrivateFieldGet(this, _Grid_size, "f").x && 0 <= pos.y && pos.y <= __classPrivateFieldGet(this, _Grid_size, "f").y;
    }
    clear() {
        __classPrivateFieldSet(this, _Grid_data, create_arr_with_func(__classPrivateFieldGet(this, _Grid_size, "f").y, () => create_arr(__classPrivateFieldGet(this, _Grid_size, "f").x, null)), "f");
        __classPrivateFieldSet(this, _Grid_paths_pos, new Map(), "f");
        __classPrivateFieldSet(this, _Grid_eq_group_x, new Map(), "f");
    }
    at(pos) {
        return this.in_bounds(pos) ? __classPrivateFieldGet(this, _Grid_data, "f")[pos.y][pos.x] : undefined;
    }
    top(pos) {
        return __classPrivateFieldGet(this, _Grid_data, "f")[pos.y - 1][pos.x];
    }
    right(pos) {
        return __classPrivateFieldGet(this, _Grid_data, "f")[pos.y][pos.x + 1];
    }
    bottom(pos) {
        return __classPrivateFieldGet(this, _Grid_data, "f")[pos.y + 1][pos.x];
    }
    left(pos) {
        return __classPrivateFieldGet(this, _Grid_data, "f")[pos.y][pos.x - 1];
    }
    set(x, path) {
        const y = __classPrivateFieldGet(this, _Grid_graph, "f").get_depth(path);
        __classPrivateFieldGet(this, _Grid_paths_pos, "f").set(path, new Vec2(x, y));
        __classPrivateFieldGet(this, _Grid_data, "f")[y][x] = path;
    }
    path_pos(path) {
        return __classPrivateFieldGet(this, _Grid_paths_pos, "f").get(path);
    }
    remove(pos) {
        __classPrivateFieldGet(this, _Grid_data, "f")[pos.y][pos.x] = null;
    }
    pos_left(eq_group) {
        return __classPrivateFieldGet(this, _Grid_eq_group_x, "f").get(eq_group);
    }
    pos_right(eq_group) {
        return __classPrivateFieldGet(this, _Grid_eq_group_x, "f").get(eq_group) + eq_group.members.length - 1;
    }
    insert(x, eq_group) {
        __classPrivateFieldGet(this, _Grid_eq_group_x, "f").set(eq_group, x);
        for (let i = 0; i < eq_group.members.length; ++i) {
            this.set(x + i, eq_group.members[i]);
        }
    }
    delete(eq_group) {
        const x = __classPrivateFieldGet(this, _Grid_eq_group_x, "f").get(eq_group);
        for (let i = 0; i < eq_group.members.length; ++i) {
            this.remove(new Vec2(x + i, __classPrivateFieldGet(this, _Grid_graph, "f").get_depth(eq_group.members[i])));
        }
        __classPrivateFieldGet(this, _Grid_eq_group_x, "f").delete(eq_group);
    }
    path_above(pos) {
        const curr_pos = pos.copy();
        while (this.in_bounds(curr_pos)) {
            if (this.at(curr_pos) !== null) {
                return this.at(curr_pos);
            }
            curr_pos.y--;
        }
        return null;
    }
    parents_reachable(left, right, eq_group) {
        if (eq_group.members.length == 1 && eq_group.members[0].is_bw) {
            for (const parent of eq_group.shared) {
                if (Math.abs(this.path_pos(parent).x - left.x) != 1) {
                    return false;
                }
            }
        }
        for (const parent of eq_group.shared) {
            const pos = this.path_pos(parent);
            const from_x = Math.min(left.x, pos.x);
            const to_x = Math.max(right.x, pos.x);
            for (let x = from_x; x <= to_x; ++x) {
                const above = this.path_above(new Vec2(x, left.y - 1));
                if (x == pos.x && above !== parent) {
                    return false;
                }
                if (above === null) {
                    continue;
                }
                const above_depth_max = __classPrivateFieldGet(this, _Grid_graph, "f").get_depth(above) + __classPrivateFieldGet(this, _Grid_graph, "f").get_diff_max(above);
                if (!eq_group.shared.has(above) && pos.y <= above_depth_max) {
                    return false;
                }
            }
        }
        return true;
    }
    is_valid_x(x, eq_group) {
        if (eq_group.cook_id > 0) {
            for (const [path, pos] of __classPrivateFieldGet(this, _Grid_paths_pos, "f")) {
                if (path.cook_id == 0) {
                    continue;
                }
                if (path.cook_id < eq_group.cook_id && x <= pos.x) {
                    return false;
                }
                else if (eq_group.cook_id < path.cook_id && pos.x <= x) {
                    return false;
                }
            }
        }
        let max_y = 0, min_y = Infinity;
        eq_group.members.forEach(el => { max_y = Math.max(__classPrivateFieldGet(this, _Grid_graph, "f").get_depth(el), max_y); });
        eq_group.members.forEach(el => { min_y = Math.min(__classPrivateFieldGet(this, _Grid_graph, "f").get_depth(el), min_y); });
        // is free
        for (let i = 0; i < eq_group.members.length; ++i) {
            const depth = __classPrivateFieldGet(this, _Grid_graph, "f").get_depth(eq_group.members[i]);
            for (let y = depth; y <= max_y; ++y) {
                if (this.at(new Vec2(x + i, y)) != null) {
                    // console.log("not free at", new Vec2(x + i, y));
                    return false;
                }
            }
        }
        // parents reachable
        if (!this.parents_reachable(new Vec2(x, min_y), new Vec2(x + eq_group.members.length - 1, min_y), eq_group)) {
            // console.log("not all parents reachable");
            return false;
        }
        // satisfies neighbor rules
        for (const neighbor of __classPrivateFieldGet(this, _Grid_rules, "f").get(eq_group)) {
            if (__classPrivateFieldGet(this, _Grid_eq_group_x, "f").has(neighbor)) {
                if (this.pos_right(neighbor) != x - 1
                    && this.pos_left(neighbor) != x + eq_group.members.length) {
                    // console.log("missing neighbors", ...neighbor.members);
                    return false;
                }
            }
        }
        return true;
    }
    possible_x(eq_group) {
        const out = [];
        for (let x = 0; x <= this.size.x - eq_group.members.length; ++x) {
            if (this.is_valid_x(x, eq_group)) {
                out.push(x);
            }
        }
        return out;
    }
    collapse() {
        const max_iterations = 10;
        for (const path of __classPrivateFieldGet(this, _Grid_graph, "f").paths) {
            if (path.is_bw) {
                console.log("BACKWARDS", path.head.str);
            }
        }
        for (let i = 1; i <= max_iterations; ++i) {
            this.clear();
            this.set(this.mid, __classPrivateFieldGet(this, _Grid_graph, "f").start);
            this.set(this.mid, __classPrivateFieldGet(this, _Grid_graph, "f").end);
            __classPrivateFieldSet(this, _Grid_valid, this.permutated_collapse_index(0), "f");
            if (!__classPrivateFieldGet(this, _Grid_valid, "f")) {
                console.warn("failed to collapse graph. iteration: ", i);
                if (i == max_iterations) {
                    console.error("failed to collapse graph!");
                }
            }
            else {
                console.log("grid collapse successfull");
                this.log_grid();
                return;
            }
            __classPrivateFieldGet(this, _Grid_size, "f").x++;
        }
    }
    permutated_collapse_index(index) {
        let success = false;
        if (index == __classPrivateFieldGet(this, _Grid_collapse_order, "f").length) {
            return true;
        }
        permutate.permutate_list(__classPrivateFieldGet(this, _Grid_collapse_order, "f")[index].members, () => success = this.collapse_index(index), () => success);
        return success;
    }
    collapse_index(index) {
        if (index == __classPrivateFieldGet(this, _Grid_collapse_order, "f").length) {
            return true;
        }
        const eq_group = __classPrivateFieldGet(this, _Grid_collapse_order, "f")[index];
        const possible_x = this.possible_x(eq_group);
        // console.log(...possible_x);
        // this.log_grid();
        for (const x of possible_x) {
            if (this.is_valid_x(x, eq_group)) {
                this.insert(x, eq_group);
                if (this.permutated_collapse_index(index + 1)) {
                    return true;
                }
                this.delete(eq_group);
            }
        }
        // console.log("failed to insert", index);
        return false;
    }
    log_grid() {
        const rows = [];
        for (let y = 0; y < __classPrivateFieldGet(this, _Grid_size, "f").y; ++y) {
            const row = [];
            for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
                const val = this.at(new Vec2(x, y));
                row.push((val === null ? "-" : val.head.str));
            }
            rows.push(row);
        }
        console.table(rows);
    }
}
_Grid_data = new WeakMap(), _Grid_size = new WeakMap(), _Grid_graph = new WeakMap(), _Grid_eq_groups = new WeakMap(), _Grid_collapse_order = new WeakMap(), _Grid_paths_pos = new WeakMap(), _Grid_eq_group_x = new WeakMap(), _Grid_rules = new WeakMap(), _Grid_valid = new WeakMap();
//# sourceMappingURL=path_group.js.map