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
var _recipe_t_conns, _recipe_t_has_changed, _recipe_t_graph;
import { connection_t } from "./connection.js";
import { create_paths, graph_t } from "./graph.js";
import { task_t } from "./task.js";
export class recipe_t {
    constructor(json) {
        _recipe_t_conns.set(this, void 0);
        _recipe_t_has_changed.set(this, void 0);
        _recipe_t_graph.set(this, void 0);
        // load json
        this.title = json["name"];
        this.difficulty = "none";
        this.duration = 0;
        const task_map = new Map();
        if (json['cooks'] != undefined) {
            let cook_id = 1;
            for (const cook_arr of json["cooks"]) {
                for (const str of cook_arr) {
                    if (!task_map.has(str)) {
                        task_map.set(str, new task_t(str, cook_id));
                    }
                }
                cook_id++;
            }
        }
        __classPrivateFieldSet(this, _recipe_t_conns, new Map(), "f");
        for (const path of json["paths"]) {
            let from;
            for (const to of path) {
                if (from !== undefined) {
                    if (!task_map.has(from)) {
                        task_map.set(from, new task_t(from, 0));
                    }
                    const from_task = task_map.get(from);
                    if (!task_map.has(to)) {
                        task_map.set(to, new task_t(to, 0));
                    }
                    const to_task = task_map.get(to);
                    const conn = new connection_t(from_task, to_task);
                    __classPrivateFieldGet(this, _recipe_t_conns, "f").set(conn.id, conn);
                }
                from = to;
            }
        }
        __classPrivateFieldSet(this, _recipe_t_has_changed, true, "f");
    }
    add_conn(conn) {
        if (!__classPrivateFieldGet(this, _recipe_t_conns, "f").has(conn.id)) {
            __classPrivateFieldGet(this, _recipe_t_conns, "f").set(conn.id, conn);
            __classPrivateFieldSet(this, _recipe_t_has_changed, true, "f");
        }
    }
    rm_conn(conn) {
        if (__classPrivateFieldGet(this, _recipe_t_conns, "f").has(conn.id)) {
            __classPrivateFieldGet(this, _recipe_t_conns, "f").delete(conn.id);
            __classPrivateFieldSet(this, _recipe_t_has_changed, true, "f");
        }
    }
    has_conn(conn) {
        return __classPrivateFieldGet(this, _recipe_t_conns, "f").has(conn.id);
    }
    get_task(id) {
        for (const conn of __classPrivateFieldGet(this, _recipe_t_conns, "f").values()) {
            if (conn.from.id == id) {
                return conn.from;
            }
            else if (conn.to.id == id) {
                return conn.to;
            }
        }
        return null;
    }
    has_description(str) {
        for (const conn of __classPrivateFieldGet(this, _recipe_t_conns, "f").values()) {
            if (conn.from.str == str) {
                return true;
            }
            else if (conn.to.str == str) {
                return true;
            }
        }
        return false;
    }
    copy() {
        const recipe = new recipe_t({ name: this.title, paths: [] });
        for (const conn of __classPrivateFieldGet(this, _recipe_t_conns, "f").values()) {
            recipe.add_conn(conn);
        }
        return recipe;
    }
    get conns() {
        return __classPrivateFieldGet(this, _recipe_t_conns, "f");
    }
    get cook_count() {
        return this.graph.cook_count;
    }
    get graph() {
        if (__classPrivateFieldGet(this, _recipe_t_has_changed, "f")) {
            this.update();
        }
        return __classPrivateFieldGet(this, _recipe_t_graph, "f");
    }
    update() {
        __classPrivateFieldSet(this, _recipe_t_graph, new graph_t(create_paths(__classPrivateFieldGet(this, _recipe_t_conns, "f"))), "f");
        __classPrivateFieldSet(this, _recipe_t_has_changed, false, "f");
    }
}
_recipe_t_conns = new WeakMap(), _recipe_t_has_changed = new WeakMap(), _recipe_t_graph = new WeakMap();
//# sourceMappingURL=recipe.js.map