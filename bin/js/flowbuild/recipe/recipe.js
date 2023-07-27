var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Recipe_connections;
import { Cook1, Task } from "./task.js";
import { Graph } from "../graph/graph.js";
import { RecipeData } from "./recipe_data.js";
export class Recipe extends RecipeData {
    constructor() {
        super();
        // member
        _Recipe_connections.set(this, void 0);
        this.loadDefault();
    }
    // access
    get conns() {
        return __classPrivateFieldGet(this, _Recipe_connections, "f").entries();
    }
    get tasks() {
        const tasks = new Set();
        for (const [parent, childs] of this.conns) {
            tasks.add(parent);
            for (const child of childs) {
                tasks.add(child);
            }
        }
        return tasks;
    }
    get cooks() {
        const cooks = new Set();
        for (const task of this.tasks) {
            if (task.cook) {
                cooks.add(task.cook);
            }
        }
        return cooks;
    }
    hasTask(task) {
        return this.tasks.has(task);
    }
    byID(id) {
        for (const task of this.tasks) {
            if (task.id == id) {
                return task;
            }
        }
        return null;
    }
    // relatives
    parents(task) {
        const parents = new Set();
        for (const [parent, childs] of this.conns) {
            if (childs.has(task)) {
                parents.add(parent);
            }
        }
        return parents;
    }
    childs(task) {
        for (const [parent, childs] of this.conns) {
            if (parent == task) {
                return new Set([...childs]);
            }
        }
        return new Set();
    }
    // global
    get start() {
        for (const task of this.tasks) {
            if (this.parents(task).size == 0) {
                return task;
            }
        }
        return null;
    }
    get end() {
        for (const task of this.tasks) {
            if (this.childs(task).size == 0) {
                return task;
            }
        }
        return null;
    }
    // modify
    clear() {
        __classPrivateFieldSet(this, _Recipe_connections, new Map(), "f");
    }
    deleteTask(task) {
        const parents = this.parents(task);
        const childs = this.childs(task);
        for (const parent of parents) {
            this.removeConn(parent, task);
        }
        for (const child of childs) {
            this.removeConn(task, child);
        }
        for (const parent of parents) {
            for (const child of childs) {
                if (parent == this.start && child == this.end) {
                    continue;
                }
                if (parent == this.start && 0 < this.parents(child).size) {
                    continue;
                }
                if (child == this.end && 0 < this.childs(parent).size) {
                    continue;
                }
                this.addConn(parent, child);
            }
        }
    }
    addConn(from, to, ...rest) {
        // create entry
        if (!__classPrivateFieldGet(this, _Recipe_connections, "f").has(from)) {
            __classPrivateFieldGet(this, _Recipe_connections, "f").set(from, new Set());
        }
        // add connection
        __classPrivateFieldGet(this, _Recipe_connections, "f").get(from).add(to);
        // recursion
        if (rest.length > 0) {
            return this.addConn(to, rest[0], ...rest.slice(1));
        }
    }
    removeConn(from, to, ...rest) {
        // remove connection
        __classPrivateFieldGet(this, _Recipe_connections, "f").get(from).delete(to);
        // delete entry
        if (__classPrivateFieldGet(this, _Recipe_connections, "f").get(from).size == 0) {
            __classPrivateFieldGet(this, _Recipe_connections, "f").delete(from);
        }
        // recursion
        if (rest.length > 0) {
            return this.removeConn(to, rest[0], ...rest.slice(1));
        }
    }
    loadDefault() {
        this.clear();
        const t1 = new Task('task1', Cook1);
        const t2 = new Task('task2', Cook1);
        const t3 = new Task('task3', Cook1);
        const t4 = new Task('task4', Cook1);
        const t5 = new Task('task5', Cook1);
        this.addConn(new Task('START'), t1, t2, new Task('END'));
        this.addConn(this.start, t3, t4, this.end);
        this.addConn(this.start, t3, t5, this.end);
    }
    // graph
    createGraph() {
        return new Graph(__classPrivateFieldGet(this, _Recipe_connections, "f"));
    }
}
_Recipe_connections = new WeakMap();
//# sourceMappingURL=recipe.js.map