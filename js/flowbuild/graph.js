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
var _graph_t_paths, _graph_t_start, _graph_t_end, _graph_t_cook_count, _graph_t_depth_map, _graph_t_diff_min_map, _graph_t_diff_max_map, _graph_t_depth_levels;
import { path_t } from "./path.js";
import { task_t } from "./task.js";
import { last_elem } from "../utils/funcs.js";
export class graph_t {
    constructor(paths) {
        _graph_t_paths.set(this, void 0);
        _graph_t_start.set(this, void 0);
        _graph_t_end.set(this, void 0);
        //#cook_graphs: Map<ID, graph_t>;
        //#loop_graphs: Map<ID, graph_t>;
        _graph_t_cook_count.set(this, void 0);
        _graph_t_depth_map.set(this, void 0);
        _graph_t_diff_min_map.set(this, void 0);
        _graph_t_diff_max_map.set(this, void 0);
        _graph_t_depth_levels.set(this, void 0);
        __classPrivateFieldSet(this, _graph_t_paths, paths, "f");
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
    reset() {
        __classPrivateFieldSet(this, _graph_t_start, null, "f");
        __classPrivateFieldSet(this, _graph_t_end, null, "f");
        __classPrivateFieldSet(this, _graph_t_cook_count, null, "f");
        __classPrivateFieldSet(this, _graph_t_depth_map, new Map(), "f");
        __classPrivateFieldSet(this, _graph_t_diff_min_map, new Map(), "f");
        __classPrivateFieldSet(this, _graph_t_diff_max_map, new Map(), "f");
        __classPrivateFieldSet(this, _graph_t_depth_levels, null, "f");
    }
    calc_all() {
        for (const path of this.paths) {
            path.is_bw;
            path.is_loop_entry;
            path.is_loop_exit;
            path.in_loop;
        }
    }
    has(path) {
        return __classPrivateFieldGet(this, _graph_t_paths, "f").has(path);
    }
    by_task(task) {
        for (const path of __classPrivateFieldGet(this, _graph_t_paths, "f")) {
            if (path.tasks.includes(task)) {
                return path;
            }
        }
        return null;
    }
    get_depth(path) {
        if (!__classPrivateFieldGet(this, _graph_t_depth_map, "f").has(path)) {
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
            __classPrivateFieldGet(this, _graph_t_depth_map, "f").set(path, depth);
            return depth;
        }
        return __classPrivateFieldGet(this, _graph_t_depth_map, "f").get(path);
    }
    get_diff_min(path) {
        if (!__classPrivateFieldGet(this, _graph_t_diff_min_map, "f").has(path)) {
            let diff_min = Infinity;
            for (const child of path.childs) {
                if (__classPrivateFieldGet(this, _graph_t_paths, "f").has(child)) {
                    diff_min = Math.min(this.get_depth(child) - this.get_depth(path), diff_min);
                }
            }
            if (diff_min == Infinity) {
                diff_min = this.depth + 1 - this.get_depth(path);
            }
            __classPrivateFieldGet(this, _graph_t_diff_min_map, "f").set(path, diff_min);
            return diff_min;
        }
        return __classPrivateFieldGet(this, _graph_t_diff_min_map, "f").get(path);
    }
    get_diff_max(path) {
        if (!__classPrivateFieldGet(this, _graph_t_diff_max_map, "f").has(path)) {
            let diff_max = -Infinity;
            for (const child of path.childs) {
                if (__classPrivateFieldGet(this, _graph_t_paths, "f").has(child)) {
                    diff_max = Math.max(this.get_depth(child) - this.get_depth(path), diff_max);
                }
            }
            if (diff_max == -Infinity) {
                diff_max = this.depth + 1 - this.get_depth(path);
            }
            __classPrivateFieldGet(this, _graph_t_diff_max_map, "f").set(path, diff_max);
            return diff_max;
        }
        return __classPrivateFieldGet(this, _graph_t_diff_max_map, "f").get(path);
    }
    remove_cycles() {
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
    get paths() {
        return __classPrivateFieldGet(this, _graph_t_paths, "f");
    }
    get start() {
        if (__classPrivateFieldGet(this, _graph_t_start, "f") === null) {
            for (const path of this.paths) {
                if (this.get_depth(path) == 0) {
                    __classPrivateFieldSet(this, _graph_t_start, path, "f");
                    break;
                }
            }
        }
        return __classPrivateFieldGet(this, _graph_t_start, "f");
    }
    get end() {
        if (__classPrivateFieldGet(this, _graph_t_end, "f") === null) {
            let max_depth = -1;
            for (const path of this.paths) {
                if (this.get_depth(path) > max_depth) {
                    max_depth = this.get_depth(path);
                    __classPrivateFieldSet(this, _graph_t_end, path, "f");
                }
            }
        }
        return __classPrivateFieldGet(this, _graph_t_end, "f");
    }
    get depth() {
        return this.get_depth(this.end);
    }
    get depth_levels() {
        if (__classPrivateFieldGet(this, _graph_t_depth_levels, "f") === null) {
            __classPrivateFieldSet(this, _graph_t_depth_levels, [], "f");
            for (let depth = 0; depth <= this.depth; ++depth) {
                __classPrivateFieldGet(this, _graph_t_depth_levels, "f").push(new Set());
            }
            for (const path of this.paths) {
                __classPrivateFieldGet(this, _graph_t_depth_levels, "f")[this.get_depth(path)].add(path);
            }
        }
        return __classPrivateFieldGet(this, _graph_t_depth_levels, "f");
    }
    get cook_count() {
        if (__classPrivateFieldGet(this, _graph_t_cook_count, "f") === null) {
            const cook_ids = new Set();
            for (const path of __classPrivateFieldGet(this, _graph_t_paths, "f")) {
                cook_ids.add(path.cook_id);
            }
            __classPrivateFieldSet(this, _graph_t_cook_count, cook_ids.size - 1, "f");
        }
        return __classPrivateFieldGet(this, _graph_t_cook_count, "f");
    }
}
_graph_t_paths = new WeakMap(), _graph_t_start = new WeakMap(), _graph_t_end = new WeakMap(), _graph_t_cook_count = new WeakMap(), _graph_t_depth_map = new WeakMap(), _graph_t_diff_min_map = new WeakMap(), _graph_t_diff_max_map = new WeakMap(), _graph_t_depth_levels = new WeakMap();
export function create_paths(conns) {
    const node_map = create_node_map(conns);
    const path_map = new Map();
    let start = null;
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
function recursive_create_path(head, node_map, path_map) {
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
                path.childs.add(child_path);
                child_path.parents.add(path);
            }
            break;
        }
        curr_node = first;
        if (curr_node.parents.size > 1) {
            const child_path = recursive_create_path(curr_node.head, node_map, path_map);
            path.childs.add(child_path);
            child_path.parents.add(path);
            break;
        }
        path.tasks.push(curr_node.head);
    }
    return path;
}
function create_node_map(conns) {
    const node_map = new Map();
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
//# sourceMappingURL=graph.js.map