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
import { Task } from "./task.js";
import { Graph } from "../graph/graph.js";
import { set_element, set_merge } from "../../utils/set.js";
import { get_cook } from "./cook.js";
class RecipeData {
    constructor() {
        this.title = 'Unnamed';
        this.difficulty = 'default';
        this.duration = 0;
        this.prep_time = 0;
        this.image_list = [];
        this.num_shares = 0;
        this.num_likes = 0;
        this.user = 'Henrik';
        this.visibiliy = 'public';
        this.tags = new Set();
    }
}
export class Recipe extends RecipeData {
    constructor() {
        super();
        _Recipe_connections.set(this, void 0);
        this.load_default();
    }
    load_default() {
        __classPrivateFieldSet(this, _Recipe_connections, new Map(), "f");
        const start = new Task('START', get_cook(''));
        const task1 = new Task('TASK 1', get_cook('1'));
        const last_step = new Task('LAST STEP', get_cook(''));
        const end = new Task('END', get_cook(''));
        __classPrivateFieldGet(this, _Recipe_connections, "f").set(start, new Set([task1]));
        __classPrivateFieldGet(this, _Recipe_connections, "f").set(task1, new Set([last_step]));
        __classPrivateFieldGet(this, _Recipe_connections, "f").set(last_step, new Set([end]));
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
    get_cook_by_id(id) {
        for (const [task, childs] of __classPrivateFieldGet(this, _Recipe_connections, "f")) {
            if (task.cook.id == id) {
                return task.cook;
            }
            for (const child of childs) {
                if (child.cook.id == id) {
                    return child.cook;
                }
            }
        }
        return null;
    }
    get_tasks() {
        const tasks = new Set();
        for (const [parent, childs] of __classPrivateFieldGet(this, _Recipe_connections, "f")) {
            tasks.add(parent);
            for (const child of childs) {
                tasks.add(child);
            }
        }
        return tasks;
    }
    get_parents(task) {
        const parents = new Set();
        for (const [parent, childs] of __classPrivateFieldGet(this, _Recipe_connections, "f")) {
            if (childs.has(task)) {
                parents.add(parent);
            }
        }
        return parents;
    }
    get_childs(task) {
        if (__classPrivateFieldGet(this, _Recipe_connections, "f").has(task)) {
            return __classPrivateFieldGet(this, _Recipe_connections, "f").get(task);
        }
        else {
            return new Set();
        }
    }
    get_start() {
        for (const task of this.get_tasks()) {
            if (this.get_parents(task).size == 0) {
                return task;
            }
        }
    }
    get_end() {
        for (const task of this.get_tasks()) {
            if (this.get_childs(task).size == 0) {
                return task;
            }
        }
    }
    get_last_step() {
        return set_element(this.get_parents(this.get_end()));
    }
    get_cooks() {
        const cooks = new Set();
        for (const [task, childs] of __classPrivateFieldGet(this, _Recipe_connections, "f")) {
            cooks.add(task.cook);
            for (const child of childs) {
                cooks.add(child.cook);
            }
        }
        cooks.delete(this.get_start().cook);
        return cooks;
    }
    get_num_cooks() {
        return this.get_cooks().size;
    }
    create_graph() {
        return new Graph(__classPrivateFieldGet(this, _Recipe_connections, "f"));
    }
}
_Recipe_connections = new WeakMap();
//# sourceMappingURL=recipe.js.map