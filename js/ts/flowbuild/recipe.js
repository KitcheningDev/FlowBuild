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
var _recipe_t_conns, _recipe_t_task_set, _recipe_t_has_changed, _recipe_t_graph, _recipe_t_cook_count;
import { connection_t } from "./connection.js";
import { create_path_map, graph_t } from "./graph.js";
import { task_t } from "./task.js";
export class recipe_t {
    constructor(json) {
        _recipe_t_conns.set(this, void 0);
        _recipe_t_task_set.set(this, void 0);
        _recipe_t_has_changed.set(this, void 0);
        _recipe_t_graph.set(this, void 0);
        _recipe_t_cook_count.set(this, void 0);
        this.name = json["name"];
        const task_map = new Map();
        if (json['cooks'] != undefined) {
            let cook_id = 0;
            for (const cook_arr of json["cooks"]) {
                for (const str of cook_arr) {
                    task_map.set(str, new task_t(str, cook_id));
                }
                cook_id++;
            }
        }
        __classPrivateFieldSet(this, _recipe_t_conns, new Map(), "f");
        for (const path of json["paths"]) {
            let from;
            for (const to of path) {
                if (from !== undefined) {
                    const from_task = task_map.has(from) ? task_map.get(from) : new task_t(from, -1);
                    const to_task = task_map.has(to) ? task_map.get(to) : new task_t(to, -1);
                    const conn = new connection_t(from_task, to_task);
                    __classPrivateFieldGet(this, _recipe_t_conns, "f").set(conn.id, conn);
                }
                from = to;
            }
        }
        __classPrivateFieldSet(this, _recipe_t_task_set, new Map(), "f");
        for (const conn of __classPrivateFieldGet(this, _recipe_t_conns, "f").values()) {
            __classPrivateFieldGet(this, _recipe_t_task_set, "f").set(conn.from.id, conn.from);
            __classPrivateFieldGet(this, _recipe_t_task_set, "f").set(conn.to.id, conn.to);
        }
        __classPrivateFieldSet(this, _recipe_t_has_changed, true, "f");
    }
    add_conn(conn) {
        __classPrivateFieldGet(this, _recipe_t_conns, "f").set(conn.id, conn);
        __classPrivateFieldGet(this, _recipe_t_task_set, "f").set(conn.from.id, conn.from);
        __classPrivateFieldGet(this, _recipe_t_task_set, "f").set(conn.to.id, conn.to);
        __classPrivateFieldSet(this, _recipe_t_has_changed, true, "f");
    }
    rm_conn(conn) {
        __classPrivateFieldGet(this, _recipe_t_conns, "f").delete(conn.id);
        let found_from = false;
        let found_to = false;
        for (const curr_conn of __classPrivateFieldGet(this, _recipe_t_conns, "f").values()) {
            if (curr_conn.from.id == conn.from.id) {
                found_from = true;
            }
            if (curr_conn.to.id == conn.to.id) {
                found_to = true;
            }
        }
        if (!found_from) {
            __classPrivateFieldGet(this, _recipe_t_task_set, "f").delete(conn.from.id);
        }
        if (!found_to) {
            __classPrivateFieldGet(this, _recipe_t_task_set, "f").delete(conn.to.id);
        }
        __classPrivateFieldSet(this, _recipe_t_has_changed, true, "f");
    }
    get_task(id) {
        return __classPrivateFieldGet(this, _recipe_t_task_set, "f").get(id).copy();
    }
    get graph() {
        if (__classPrivateFieldGet(this, _recipe_t_has_changed, "f")) {
            this.update();
        }
        return __classPrivateFieldGet(this, _recipe_t_graph, "f");
    }
    get cook_count() {
        if (__classPrivateFieldGet(this, _recipe_t_has_changed, "f")) {
            this.update();
        }
        return __classPrivateFieldGet(this, _recipe_t_cook_count, "f");
    }
    update() {
        __classPrivateFieldSet(this, _recipe_t_graph, new graph_t(create_path_map(__classPrivateFieldGet(this, _recipe_t_conns, "f"))), "f");
        const cook_set = new Set();
        for (const path of __classPrivateFieldGet(this, _recipe_t_graph, "f").paths) {
            if (path.head.str == "DUMMY") {
                __classPrivateFieldGet(this, _recipe_t_task_set, "f").set(path.head.id, path.head);
            }
        }
        __classPrivateFieldGet(this, _recipe_t_task_set, "f").forEach((val) => { cook_set.add(val.cook_id); });
        __classPrivateFieldSet(this, _recipe_t_cook_count, cook_set.size > 1 ? cook_set.size - 1 : 1, "f");
        __classPrivateFieldSet(this, _recipe_t_has_changed, false, "f");
    }
}
_recipe_t_conns = new WeakMap(), _recipe_t_task_set = new WeakMap(), _recipe_t_has_changed = new WeakMap(), _recipe_t_graph = new WeakMap(), _recipe_t_cook_count = new WeakMap();
//# sourceMappingURL=recipe.js.map