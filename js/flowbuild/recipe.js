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
var _Recipe_connections;
import { Graph } from "./graph.js";
import { set_merge } from "../utils/set.js";
export class Recipe {
    constructor(title) {
        _Recipe_connections.set(this, void 0);
        this.title = title;
        this.prep_time = 0;
        this.duration = 0;
        this.difficulty = 'medium';
        __classPrivateFieldSet(this, _Recipe_connections, new Map(), "f");
    }
    add_connection(from, to) {
        var _a;
        if (!__classPrivateFieldGet(this, _Recipe_connections, "f").has(from)) {
            __classPrivateFieldGet(this, _Recipe_connections, "f").set(from, new Set());
        }
        (_a = __classPrivateFieldGet(this, _Recipe_connections, "f").get(from)) === null || _a === void 0 ? void 0 : _a.add(to);
    }
    remove_connection(from, to) {
        const childs = __classPrivateFieldGet(this, _Recipe_connections, "f").get(from);
        if (childs !== undefined) {
            childs.delete(to);
            if (childs.size == 0) {
                __classPrivateFieldGet(this, _Recipe_connections, "f").delete(from);
            }
        }
    }
    has_conn(from, to) {
        const childs = __classPrivateFieldGet(this, _Recipe_connections, "f").get(from);
        if (childs === undefined) {
            return false;
        }
        else {
            return childs.has(to);
        }
    }
    add_task_from_start(task) {
        const graph = this.create_graph();
        this.add_connection(graph.start.task, task);
        this.add_connection(task, graph.end.task);
    }
    add_task(parent, task) {
        const graph = this.create_graph();
        this.add_connection(parent, task);
        this.add_connection(task, graph.end.task);
    }
    add_task_between(parent, task, child) {
        this.add_connection(parent, task);
        this.add_connection(task, child);
    }
    remove_task(task) {
        if (__classPrivateFieldGet(this, _Recipe_connections, "f").has(task)) {
            const task_childs = __classPrivateFieldGet(this, _Recipe_connections, "f").get(task);
            for (const [parent, childs] of __classPrivateFieldGet(this, _Recipe_connections, "f")) {
                if (childs.has(task)) {
                    childs.delete(task);
                    __classPrivateFieldGet(this, _Recipe_connections, "f").set(parent, set_merge(childs, task_childs));
                }
            }
            __classPrivateFieldGet(this, _Recipe_connections, "f").delete(task);
        }
    }
    has_task(task) {
        for (const [parent, childs] of __classPrivateFieldGet(this, _Recipe_connections, "f")) {
            if (parent == task || childs.has(task)) {
                return true;
            }
        }
        return false;
    }
    get_task_by_id(id) {
        for (const [task, childs] of __classPrivateFieldGet(this, _Recipe_connections, "f")) {
            if (task.id == id) {
                return task;
            }
            for (const child of childs) {
                if (child.id == id) {
                    return child;
                }
            }
        }
        return null;
    }
    get_parents(task) {
        const parents = new Set();
        for (const [task, childs] of __classPrivateFieldGet(this, _Recipe_connections, "f")) {
            if (childs.has(task)) {
                parents.add(task);
            }
        }
        return parents;
    }
    get_childs(task) {
        return __classPrivateFieldGet(this, _Recipe_connections, "f").get(task);
    }
    create_graph() {
        return new Graph(__classPrivateFieldGet(this, _Recipe_connections, "f"));
    }
}
_Recipe_connections = new WeakMap();
//# sourceMappingURL=recipe.js.map