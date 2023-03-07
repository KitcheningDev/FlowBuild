import { has_path, path_t } from "./path.js";
import { connection_t } from "./connection.js";
import { ID, task_t } from "./task.js";
import { last_elem } from "../utils/funcs.js";

export class graph_t {
    #paths: Set<path_t>;
    
    #start: path_t;
    #end: path_t;
    
    //#cook_graphs: Map<ID, graph_t>;
    //#loop_graphs: Map<ID, graph_t>;
    #cook_count: number;
    
    #depth_map: Map<path_t, number>;
    #diff_min_map: Map<path_t, number>;
    #diff_max_map: Map<path_t, number>;
    #depth_levels: Set<path_t>[];

    constructor(paths: Set<path_t>) {
        this.#paths = paths;
        // for (const path of this.paths) {
        //     console.log(path, path.is_bw, path.is_loop_entry, path.is_loop_exit, path.in_loop);
        // }
        this.remove_cycles();
        this.reset();
        // for (const path of this.paths) {
        //     path.reset();
        // }
        // this.calc_all();
        // console.log(this.start);
        // for (const path of this.paths) {
        //     console.log(path, path.is_bw, path.is_loop_entry, path.is_loop_exit, path.in_loop);
        // }
    }

    reset(): void {
        this.#start = null;
        this.#end = null;
        
        this.#cook_count = null;

        this.#depth_map = new Map<path_t, number>();
        this.#diff_min_map = new Map<path_t, number>();
        this.#diff_max_map = new Map<path_t, number>();
        this.#depth_levels = null;
    }
    calc_all(): void {
        for (const path of this.paths) {
            path.is_bw;
            path.is_loop_entry;
            path.is_loop_exit;
            path.in_loop;
        }
    }
    has(path: path_t): boolean {
        return this.#paths.has(path);
    }
    by_task(task: task_t): path_t {
        for (const path of this.#paths) {
            if (path.tasks.includes(task)) {
                return path;
            }
        }
        return null;
    }
    get_depth(path: path_t): number {
        if (!this.#depth_map.has(path)) {
            let depth = 0;
            // if (path.is_bw) {
            //     for (const parent of path.parents) {
            //         if (parent.is_loop_entry) {
            //             depth = Math.max(this.get_depth(parent), depth);
            //         }
            //         else {
            //             depth = Math.max(this.get_depth(parent) + 1, depth);
            //         }
            //     }
            // }
            for (const parent of path.parents) {
                depth = Math.max(this.get_depth(parent) + 1, depth);
            }
            this.#depth_map.set(path, depth);
            return depth;
        }
        return this.#depth_map.get(path);
    }
    get_diff_min(path: path_t): number {
        if (!this.#diff_min_map.has(path)) {
            let diff_min = Infinity;
            for (const child of path.childs) {
                if (this.#paths.has(child)) {
                    diff_min = Math.min(this.get_depth(child) - this.get_depth(path), diff_min);
                }
            }
            if (diff_min == Infinity) {
                diff_min = this.depth + 1 - this.get_depth(path);
            }
            this.#diff_min_map.set(path, diff_min);
            return diff_min;
        }
        return this.#diff_min_map.get(path);
    }
    get_diff_max(path: path_t): number {
        if (!this.#diff_max_map.has(path)) {
            let diff_max = -Infinity;
            for (const child of path.childs) {
                if (this.#paths.has(child)) {
                    diff_max = Math.max(this.get_depth(child) - this.get_depth(path), diff_max);
                }
            }
            if (diff_max == -Infinity) {
                diff_max = this.depth + 1 - this.get_depth(path);
            }
            this.#diff_max_map.set(path, diff_max);
            return diff_max;
        }
        return this.#diff_max_map.get(path);
    }
    private remove_cycles(): void {
        this.calc_all();
        for (const path of this.paths) {
            if (path.is_loop_entry) {
                if (path.tasks.length > 1) {
                    const new_path = path.split(path.tasks[1]);
                    this.paths.add(new_path);
                }
                for (const parent of path.parents) {
                    if (parent.is_bw) {
                        path.childs.add(parent);
                        path.parents.delete(parent);
                    }
                }
            }
            else if (path.is_loop_exit) {
                if (path.tasks.length > 1) {
                    const new_path = path.split(last_elem(path.tasks));
                    this.paths.add(new_path);
                }
                for (const child of path.childs) {
                    if (child.is_bw) {
                        path.parents.add(child);
                        path.childs.delete(child);
                    }
                }
            }
        }
        for (const path of this.paths) {
            if (path.is_bw) {
                path.reverse();
            }
        }
    }

    get paths(): Set<path_t> {
        return this.#paths
    }
    get start(): path_t {
        if (this.#start === null) {
            for (const path of this.paths) {
                if (this.get_depth(path) == 0) {
                    this.#start = path;
                    break;
                }
            }
        }
        return this.#start;
    }
    get end(): path_t {
        if (this.#end === null) {
            let max_depth = -1;
            for (const path of this.paths) {
                if (this.get_depth(path) > max_depth) {
                    max_depth = this.get_depth(path);
                    this.#end = path;
                }
            }
        }
        return this.#end;
    }
    get depth(): number {
        return this.get_depth(this.end);
    }
    get depth_levels(): Set<path_t>[] {
        if (this.#depth_levels === null) {
            this.#depth_levels = [];
            for (let depth = 0; depth <= this.depth; ++depth) {
                this.#depth_levels.push(new Set());
            }
            for (const path of this.paths) {
                this.#depth_levels[this.get_depth(path)].add(path);
            }
        }
        return this.#depth_levels;
    }

    get cook_count(): number {
        if (this.#cook_count === null) {
            const cook_ids = new Set<ID>();
            for (const path of this.#paths) {
                cook_ids.add(path.cook_id);
            }
            this.#cook_count = cook_ids.size - 1;
        }
        return this.#cook_count;
    }
}

export function create_paths(conns: Map<ID, connection_t>): Set<path_t> {
    const node_map = create_node_map(conns);
    const path_map = new Map<ID, path_t>();

    let start: task_t = null;
    for (const node of node_map.values()) {
        if (node.parents.size == 0) {
            start = node.head;
            break;
        }
    }
    recursive_create_path(start, node_map, path_map);

    for (const path of path_map.values()) {
        if (path.childs.has(path)) {
            const dummy = new path_t(new task_t("DUMMY", path.cook_id));
            path.childs.delete(path);
            path.childs.add(dummy);
            path.parents.delete(path);
            path.parents.add(dummy);
            dummy.childs.add(path);
            dummy.parents.add(path);
            path_map.set(dummy.id, dummy);
        }
    }
    return new Set(path_map.values());
}

function recursive_create_path(head: task_t, node_map: Map<ID, path_t>, path_map: Map<ID, path_t>): path_t {
    if (path_map.has(head.id))
        return path_map.get(head.id);
    
    const path = new path_t(head);
    path_map.set(path.id, path);

    let curr_node = node_map.get(head.id);
    while (true) {
        if (curr_node.childs.size == 0) {
            break;
        }
        const [first] = curr_node.childs;
        if (curr_node.childs.size == 1 && first.childs.size == 0) {
            if (curr_node.id == head.id) {
                path.tasks.push(first.head);
            }
            else {
                const end = new path_t(curr_node.head);
                end.tasks.push(first.head);
                path.childs.add(end);
                path_map.set(end.id, end);
            }
            return path;
        }
        if (curr_node.childs.size > 1 || curr_node.cook_id != first.cook_id || head.str == "START") {
            for (const child of curr_node.childs) {
                const child_path = recursive_create_path(child.head, node_map, path_map);
                path.childs.add(child_path)
                child_path.parents.add(path);
            }
            break;
        }
        curr_node = first;
        if (curr_node.parents.size > 1) {
            const child_path = recursive_create_path(curr_node.head, node_map, path_map);
            path.childs.add(child_path)
            child_path.parents.add(path);
            break;
        }
        path.tasks.push(curr_node.head);
    }
    return path;
}

function create_node_map(conns: Map<ID, connection_t>): Map<ID, path_t> {
    const node_map = new Map<ID, path_t>();
    for (const conn of conns.values()) {
        if (!node_map.has(conn.from.id)) {
            node_map.set(conn.from.id, new path_t(conn.from));
        }
        if (!node_map.has(conn.to.id)) {
            node_map.set(conn.to.id, new path_t(conn.to));
        }
        const from_node = node_map.get(conn.from.id);
        const to_node = node_map.get(conn.to.id);
        from_node.childs.add(to_node);
        to_node.parents.add(from_node);
    }
    return node_map;
}