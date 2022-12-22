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
var _path_t_id, _path_t_bounds, _path_t_in_loop, _path_t_is_loop_entry, _path_t_is_loop_exit, _path_t_is_bw;
import { path_bounds_t } from "./path_bounds.js";
export class path_t {
    constructor(head) {
        _path_t_id.set(this, void 0);
        _path_t_bounds.set(this, void 0);
        _path_t_in_loop.set(this, void 0);
        _path_t_is_loop_entry.set(this, void 0);
        _path_t_is_loop_exit.set(this, void 0);
        _path_t_is_bw.set(this, void 0);
        this.tasks = [head];
        __classPrivateFieldSet(this, _path_t_id, head.id, "f");
        this.parents = new Set();
        this.childs = new Set();
        this.reset();
    }
    reset() {
        __classPrivateFieldSet(this, _path_t_in_loop, null, "f");
        __classPrivateFieldSet(this, _path_t_is_loop_entry, null, "f");
        __classPrivateFieldSet(this, _path_t_is_loop_exit, null, "f");
        __classPrivateFieldSet(this, _path_t_is_bw, null, "f");
        __classPrivateFieldSet(this, _path_t_bounds, null, "f");
    }
    split(new_head) {
        if (this.head == new_head) {
            return this;
        }
        const new_path = new path_t(new_head);
        // tasks
        const index = this.tasks.indexOf(new_head);
        new_path.tasks = this.tasks.slice(index);
        this.tasks.splice(index);
        // relatives
        new_path.childs = this.childs;
        new_path.parents = new Set([this]);
        this.childs = new Set([new_path]);
        // adjust childs
        for (const child of new_path.childs) {
            child.parents.delete(this);
            child.parents.add(new_path);
        }
        return new_path;
    }
    reverse() {
        this.tasks.reverse();
        const temp = this.parents;
        this.parents = this.childs;
        this.childs = temp;
        // if (this.parents.size == 1) {
        //     const [parent] = this.parents;
        //     if (parent.is_loop_entry) {
        //         this.parents = parent.parents;
        //     }
        // }
        // if (this.childs.size == 1) {
        //     const [child] = this.childs;
        //     if (child.is_loop_exit) {
        //         this.childs = child.childs;
        //     }
        // }
    }
    get head() {
        return this.tasks[0];
    }
    get id() {
        return __classPrivateFieldGet(this, _path_t_id, "f");
    }
    get cook_id() {
        return this.tasks[0].cook_id;
    }
    get in_loop() {
        if (__classPrivateFieldGet(this, _path_t_in_loop, "f") === null) {
            __classPrivateFieldSet(this, _path_t_in_loop, has_path(this, this), "f");
        }
        return __classPrivateFieldGet(this, _path_t_in_loop, "f");
    }
    get is_loop_entry() {
        if (__classPrivateFieldGet(this, _path_t_is_loop_entry, "f") === null) {
            __classPrivateFieldSet(this, _path_t_is_loop_entry, false, "f");
            if (this.in_loop) {
                for (const parent of this.parents) {
                    if (!has_path(this, parent)) {
                        __classPrivateFieldSet(this, _path_t_is_loop_entry, true, "f");
                        break;
                    }
                }
            }
        }
        return __classPrivateFieldGet(this, _path_t_is_loop_entry, "f");
    }
    get is_loop_exit() {
        if (__classPrivateFieldGet(this, _path_t_is_loop_exit, "f") === null) {
            __classPrivateFieldSet(this, _path_t_is_loop_exit, false, "f");
            if (this.in_loop) {
                for (const child of this.childs) {
                    if (!has_path(child, this)) {
                        __classPrivateFieldSet(this, _path_t_is_loop_exit, true, "f");
                        break;
                    }
                }
            }
        }
        return __classPrivateFieldGet(this, _path_t_is_loop_exit, "f");
    }
    get is_bw() {
        if (__classPrivateFieldGet(this, _path_t_is_bw, "f") === null) {
            __classPrivateFieldSet(this, _path_t_is_bw, false, "f");
            for (const child of this.childs) {
                if (child.is_loop_entry && has_path(child, this)) {
                    __classPrivateFieldSet(this, _path_t_is_bw, true, "f");
                    return true;
                }
            }
            if (!this.is_loop_exit) {
                for (const child of this.childs) {
                    if (child.is_bw) {
                        __classPrivateFieldSet(this, _path_t_is_bw, true, "f");
                        return true;
                    }
                }
            }
        }
        return __classPrivateFieldGet(this, _path_t_is_bw, "f");
    }
    get bounds() {
        if (__classPrivateFieldGet(this, _path_t_bounds, "f") === null) {
            __classPrivateFieldSet(this, _path_t_bounds, new path_bounds_t(this.tasks), "f");
        }
        return __classPrivateFieldGet(this, _path_t_bounds, "f");
    }
}
_path_t_id = new WeakMap(), _path_t_bounds = new WeakMap(), _path_t_in_loop = new WeakMap(), _path_t_is_loop_entry = new WeakMap(), _path_t_is_loop_exit = new WeakMap(), _path_t_is_bw = new WeakMap();
export function has_path(from, to, visited = new Set()) {
    if (visited.has(from))
        return false;
    visited.add(from);
    for (const child of from.childs) {
        if (child == to || has_path(child, to, visited))
            return true;
    }
    return false;
}
//# sourceMappingURL=path.js.map