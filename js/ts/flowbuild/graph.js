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
var _graph_t_path_map, _graph_t_start, _graph_t_end, _graph_t_paths, _graph_t_cook_graphs, _graph_t_loop_graphs, _graph_t_cook_count, _graph_t_depth_map, _graph_t_diff_min_map, _graph_t_diff_max_map, _graph_t_depth_levels;
import { has_path, path_t } from "./path.js";
import { task_t } from "./task.js";
export class graph_t {
    constructor(path_map) {
        _graph_t_path_map.set(this, void 0);
        _graph_t_start.set(this, void 0);
        _graph_t_end.set(this, void 0);
        _graph_t_paths.set(this, void 0);
        _graph_t_cook_graphs.set(this, void 0);
        _graph_t_loop_graphs.set(this, void 0);
        _graph_t_cook_count.set(this, void 0);
        _graph_t_depth_map.set(this, void 0);
        _graph_t_diff_min_map.set(this, void 0);
        _graph_t_diff_max_map.set(this, void 0);
        _graph_t_depth_levels.set(this, void 0);
        __classPrivateFieldSet(this, _graph_t_path_map, path_map, "f");
        __classPrivateFieldSet(this, _graph_t_start, null, "f");
        __classPrivateFieldSet(this, _graph_t_end, null, "f");
        __classPrivateFieldSet(this, _graph_t_paths, null, "f");
        __classPrivateFieldSet(this, _graph_t_cook_graphs, new Map(), "f");
        __classPrivateFieldSet(this, _graph_t_loop_graphs, null, "f");
        __classPrivateFieldSet(this, _graph_t_depth_map, new Map(), "f");
        __classPrivateFieldSet(this, _graph_t_diff_min_map, new Map(), "f");
        __classPrivateFieldSet(this, _graph_t_diff_max_map, new Map(), "f");
        __classPrivateFieldSet(this, _graph_t_depth_levels, null, "f");
    }
    has(id) {
        return __classPrivateFieldGet(this, _graph_t_depth_map, "f").has(id);
    }
    get_path(id) {
        return __classPrivateFieldGet(this, _graph_t_path_map, "f").get(id);
    }
    get_depth(path) {
        if (!__classPrivateFieldGet(this, _graph_t_depth_map, "f").has(path.id)) {
            let depth = 0;
            if (path.is_bw) {
                for (const child of path.childs) {
                    if (__classPrivateFieldGet(this, _graph_t_path_map, "f").has(child.id)) {
                        depth = Math.max(this.get_depth(child) + (child.is_bw ? 1 : 0), depth);
                    }
                }
            }
            else {
                for (const parent of path.parents) {
                    if (parent.is_bw || !__classPrivateFieldGet(this, _graph_t_path_map, "f").has(parent.id)) {
                        continue;
                    }
                    depth = Math.max(this.get_depth(parent) + 1, depth);
                }
            }
            __classPrivateFieldGet(this, _graph_t_depth_map, "f").set(path.id, depth);
            return depth;
        }
        return __classPrivateFieldGet(this, _graph_t_depth_map, "f").get(path.id);
    }
    get_diff_min(path) {
        if (!__classPrivateFieldGet(this, _graph_t_diff_min_map, "f").has(path.id)) {
            let diff_min = Infinity;
            for (const child of path.childs) {
                if (__classPrivateFieldGet(this, _graph_t_path_map, "f").has(child.id)) {
                    diff_min = Math.min(this.get_depth(child) - this.get_depth(path), diff_min);
                }
            }
            if (diff_min == Infinity) {
                diff_min = 0;
            }
            __classPrivateFieldGet(this, _graph_t_diff_min_map, "f").set(path.id, diff_min);
            return diff_min;
        }
        return __classPrivateFieldGet(this, _graph_t_diff_min_map, "f").get(path.id);
    }
    get_diff_max(path) {
        if (!__classPrivateFieldGet(this, _graph_t_diff_max_map, "f").has(path.id)) {
            let diff_max = -Infinity;
            for (const child of path.childs) {
                if (__classPrivateFieldGet(this, _graph_t_path_map, "f").has(child.id)) {
                    diff_max = Math.max(this.get_depth(child) - this.get_depth(path), diff_max);
                }
            }
            if (diff_max == -Infinity) {
                diff_max = 0;
            }
            __classPrivateFieldGet(this, _graph_t_diff_max_map, "f").set(path.id, diff_max);
            return diff_max;
        }
        return __classPrivateFieldGet(this, _graph_t_diff_max_map, "f").get(path.id);
    }
    get_cook_graph(cook_id) {
        if (!__classPrivateFieldGet(this, _graph_t_cook_graphs, "f").has(cook_id)) {
            const path_map = new Map();
            for (const path of this.paths) {
                if (path.cook_id == cook_id) {
                    path_map.set(path.id, path);
                }
            }
            __classPrivateFieldGet(this, _graph_t_cook_graphs, "f").set(cook_id, new graph_t(path_map));
        }
        return __classPrivateFieldGet(this, _graph_t_cook_graphs, "f").get(cook_id);
    }
    get cook_count() {
        if (__classPrivateFieldGet(this, _graph_t_cook_count, "f") === null) {
            const cook_set = new Set();
            for (const path of this.paths) {
                cook_set.add(path.cook_id);
            }
            __classPrivateFieldSet(this, _graph_t_cook_count, cook_set.size == 1 ? 1 : cook_set.size - 1, "f");
        }
        return __classPrivateFieldGet(this, _graph_t_cook_count, "f");
    }
    get loop_graphs() {
        if (__classPrivateFieldGet(this, _graph_t_loop_graphs, "f") === null) {
            __classPrivateFieldSet(this, _graph_t_loop_graphs, new Map(), "f");
            for (const path of this.paths) {
                if (path.is_loop_entry) {
                    const path_map = new Map();
                    for (const member of this.paths) {
                        if (has_path(member, path) && has_path(path, member)) {
                            path_map.set(member.id, member);
                        }
                    }
                    __classPrivateFieldGet(this, _graph_t_loop_graphs, "f").set(path.id, new graph_t(path_map));
                }
            }
        }
        return __classPrivateFieldGet(this, _graph_t_loop_graphs, "f");
    }
    get path_map() {
        return __classPrivateFieldGet(this, _graph_t_path_map, "f");
    }
    set path_map(path_map) {
        __classPrivateFieldSet(this, _graph_t_path_map, path_map, "f");
        __classPrivateFieldSet(this, _graph_t_paths, null, "f");
        __classPrivateFieldSet(this, _graph_t_start, null, "f");
        __classPrivateFieldSet(this, _graph_t_end, null, "f");
        __classPrivateFieldSet(this, _graph_t_depth_map, null, "f");
    }
    get paths() {
        if (__classPrivateFieldGet(this, _graph_t_paths, "f") === null) {
            __classPrivateFieldSet(this, _graph_t_paths, [], "f");
            for (const [id, path] of __classPrivateFieldGet(this, _graph_t_path_map, "f")) {
                __classPrivateFieldGet(this, _graph_t_paths, "f").push(path);
            }
        }
        return __classPrivateFieldGet(this, _graph_t_paths, "f");
    }
    get start() {
        if (__classPrivateFieldGet(this, _graph_t_start, "f") === null) {
            for (const path of this.paths) {
                let has_parents = false;
                for (const parent of path.parents) {
                    if (__classPrivateFieldGet(this, _graph_t_path_map, "f").has(parent.id)) {
                        has_parents = true;
                        break;
                    }
                }
                if (!has_parents) {
                    __classPrivateFieldSet(this, _graph_t_start, path, "f");
                    break;
                }
            }
        }
        return __classPrivateFieldGet(this, _graph_t_start, "f");
    }
    get end() {
        if (__classPrivateFieldGet(this, _graph_t_end, "f") === null) {
            for (const path of this.paths) {
                let has_childs = false;
                for (const child of path.childs) {
                    if (__classPrivateFieldGet(this, _graph_t_path_map, "f").has(child.id)) {
                        has_childs = true;
                        break;
                    }
                }
                if (!has_childs) {
                    __classPrivateFieldSet(this, _graph_t_end, path, "f");
                    break;
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
}
_graph_t_path_map = new WeakMap(), _graph_t_start = new WeakMap(), _graph_t_end = new WeakMap(), _graph_t_paths = new WeakMap(), _graph_t_cook_graphs = new WeakMap(), _graph_t_loop_graphs = new WeakMap(), _graph_t_cook_count = new WeakMap(), _graph_t_depth_map = new WeakMap(), _graph_t_diff_min_map = new WeakMap(), _graph_t_diff_max_map = new WeakMap(), _graph_t_depth_levels = new WeakMap();
export function create_path_map(conns) {
    const node_map = create_node_map(conns);
    const path_map = new Map();
    recursive_create_path(new task_t("START", -1), node_map, path_map);
    return path_map;
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