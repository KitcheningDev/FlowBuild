import { create_arr, create_arr_with_func, cut_set, last_elem, eq_set } from "../../utils/funcs.js";
import { vec2, vec2_t } from "../../utils/vec2.js";
import { graph_t } from "../graph.js";
import { path_t } from "../path.js";
import { create_eq_groups, eq_group_t } from "./eq_group.js";
import { permutate } from "../../utils/permutate.js";
import { ID } from "../task.js";

type dep_group_t = eq_group_t[];
function create_dep_groups(eq_groups: Set<eq_group_t>): Set<dep_group_t> {
    const dep_groups = new Set<dep_group_t>();
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
                console.error("Impossible to align paths without intersections!" );
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
function create_adjacency_rules(eq_groups: Set<eq_group_t>): Map<eq_group_t, eq_group_t[]> {
    const dep_groups = create_dep_groups(eq_groups);
    const adjacency_rules = new Map<eq_group_t, eq_group_t[]>();
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
function create_collapse_order(graph: graph_t, eq_groups: Set<eq_group_t>): eq_group_t[] {
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

export class grid_t {
    #data: path_t[][];
    #size: vec2_t;
    #graph: graph_t;
    #eq_groups: Set<eq_group_t>;
    #collapse_order: eq_group_t[];
    #paths_pos: Map<path_t, vec2_t>;
    #eq_group_x: Map<eq_group_t, number>;
    #rules: Map<eq_group_t, eq_group_t[]>;
    #valid: boolean;

    constructor(graph: graph_t) {
        const depth_counts = create_arr(graph.depth + 1, 0);
        for (const path of graph.paths) {
            const min_y = graph.get_depth(path);
            const max_y = min_y + graph.get_diff_max(path);
            for (let y = min_y; y < max_y; ++y) {
                depth_counts[y]++;
            }
        }
        this.#size = new vec2_t(Math.max(...depth_counts), graph.depth + 1)
        this.clear();

        this.#graph = graph;
        this.#eq_groups = create_eq_groups(graph.paths, 'parents');
        this.#collapse_order = create_collapse_order(graph, this.#eq_groups);
        // console.log("DEPTH LEVELS", ...graph.depth_levels);
        // console.log("COLLAPSE ORDER", ...this.#collapse_order);
        this.#rules = create_adjacency_rules(this.#eq_groups);
        this.#valid = false;
    }

    get size(): vec2_t {
        return this.#size.copy();
    }
    get mid(): number {
        return Math.floor((this.#size.x - 1) / 2);
    }
    get valid(): boolean {
        return this.#valid;
    }
    in_bounds(pos: vec2_t): boolean {
        return 0 <= pos.x && pos.x < this.#size.x && 0 <= pos.y && pos.y <= this.#size.y;
    }

    clear(): void {
        this.#data = create_arr_with_func(this.#size.y, () => create_arr(this.#size.x, null));
        this.#paths_pos = new Map<path_t, vec2_t>();
        this.#eq_group_x = new Map<eq_group_t, number>();
    }

    at(pos: vec2_t): path_t {
        return this.in_bounds(pos) ? this.#data[pos.y][pos.x] : undefined;
    }
    top(pos: vec2_t): path_t {
        return this.#data[pos.y - 1][pos.x];
    }
    right(pos: vec2_t): path_t {
        return this.#data[pos.y][pos.x + 1];
    }
    bottom(pos: vec2_t): path_t {
        return this.#data[pos.y + 1][pos.x];
    }
    left(pos: vec2_t): path_t {
        return this.#data[pos.y][pos.x - 1];
    }

    set(x: number, path: path_t): void {
        const y = this.#graph.get_depth(path);
        this.#paths_pos.set(path, new vec2_t(x, y));
        this.#data[y][x] = path;
    }
    path_pos(path: path_t): vec2_t {
        return this.#paths_pos.get(path);
    }
    remove(pos: vec2_t): void {
        this.#data[pos.y][pos.x] = null;
    }
    pos_left(eq_group: eq_group_t): number {
        return this.#eq_group_x.get(eq_group);
    }
    pos_right(eq_group: eq_group_t): number {
        return this.#eq_group_x.get(eq_group) + eq_group.members.length - 1;
    }
    insert(x: number, eq_group: eq_group_t): void {
        this.#eq_group_x.set(eq_group, x);
        for (let i = 0; i < eq_group.members.length; ++i) {
            this.set(x + i, eq_group.members[i]);
        }
    }
    delete(eq_group: eq_group_t): void {
        const x = this.#eq_group_x.get(eq_group);
        for (let i = 0; i < eq_group.members.length; ++i) {
            this.remove(new vec2_t(x + i, this.#graph.get_depth(eq_group.members[i])));
        }
        this.#eq_group_x.delete(eq_group);
    }
    path_above(pos: vec2_t): path_t {
        const curr_pos = pos.copy();
        while (this.in_bounds(curr_pos)) {
            if (this.at(curr_pos) !== null) {
                return this.at(curr_pos);
            }
            curr_pos.y--;
        }
        return null;
    }
    parents_reachable(left: vec2_t, right: vec2_t, eq_group: eq_group_t): boolean {
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
                const above = this.path_above(new vec2_t(x, left.y - 1));
                if (x == pos.x && above !== parent) {
                    return false;
                }
                if (above === null) {
                    continue;
                }
                
                const above_depth_max = this.#graph.get_depth(above) + this.#graph.get_diff_max(above);
                if (!eq_group.shared.has(above) && pos.y <= above_depth_max) {
                    return false;
                }
            }
        }
        return true;
    }
    is_valid_x(x: number, eq_group: eq_group_t): boolean {
        if (eq_group.cook_id > 0) {
            for (const [path, pos] of this.#paths_pos) {
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
        eq_group.members.forEach(el => { max_y = Math.max(this.#graph.get_depth(el), max_y); });
        eq_group.members.forEach(el => { min_y = Math.min(this.#graph.get_depth(el), min_y); });
        
        // is free
        for (let i = 0; i < eq_group.members.length; ++i) {
            const depth = this.#graph.get_depth(eq_group.members[i]);
            for (let y = depth; y <= max_y; ++y) {
                if (this.at(new vec2_t(x + i, y)) != null) {
                    // console.log("not free at", new vec2_t(x + i, y));
                    return false;
                }
            }
        }

        // parents reachable
        if (!this.parents_reachable(new vec2_t(x, min_y), new vec2_t(x + eq_group.members.length - 1, min_y), eq_group)) {
            // console.log("not all parents reachable");
            return false;
        }

        // satisfies neighbor rules
        for (const neighbor of this.#rules.get(eq_group)) {
            if (this.#eq_group_x.has(neighbor)) {
                if (this.pos_right(neighbor) != x - 1
                 && this.pos_left(neighbor) != x + eq_group.members.length) {
                    // console.log("missing neighbors", ...neighbor.members);
                    return false;
                }
            }
        }
        return true;
    }
    possible_x(eq_group: eq_group_t): number[] {
        const out = [];
        for (let x = 0; x <= this.size.x - eq_group.members.length; ++x) {
            if (this.is_valid_x(x, eq_group)) {
                out.push(x);
            }
        }
        return out;
    }

    collapse(): void {
        const max_iterations = 10;
        for (const path of this.#graph.paths) {
            if (path.is_bw) {
                console.log("BACKWARDS", path.head.str);
            }
        }
        for (let i = 1; i <= max_iterations; ++i) {
            this.clear();
            this.set(this.mid, this.#graph.start);
            this.set(this.mid, this.#graph.end);
            this.#valid = this.permutated_collapse_index(0);
            if (!this.#valid) {
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
            this.#size.x++;
        }
    }
    private permutated_collapse_index(index: number): boolean {
        let success = false;
        if (index == this.#collapse_order.length) {
            return true;
        }
        permutate.permutate_list(this.#collapse_order[index].members, () => success = this.collapse_index(index), () => success);
        return success;
    }
    private collapse_index(index: number): boolean {
        if (index == this.#collapse_order.length) {
            return true;
        }
        const eq_group = this.#collapse_order[index];
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
    log_grid(): void {
        const rows = [];
        for (let y = 0; y < this.#size.y; ++y) {
            const row = [];
            for (let x = 0; x < this.#size.x; ++x) {
                const val = this.at(new vec2_t(x, y)); 
                row.push((val === null ? "-" : val.head.str));
            }
            rows.push(row);
        }
        console.table(rows);
    }
}