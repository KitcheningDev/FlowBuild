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
var _path_t_in_loop, _path_t_is_loop_entry, _path_t_is_loop_exit, _path_t_bw_parents, _path_t_bw_childs, _path_t_is_bw, _path_t_bounds;
import { path_bounds_t } from "./path_bounds.js";
export class path_t {
    constructor(head) {
        // #depth: number;
        // #depth_diff_min: number;
        // #depth_diff_max: number;
        // #cook_depth_diff_min: number;
        // #cook_depth_diff_max: number;
        _path_t_in_loop.set(this, void 0);
        _path_t_is_loop_entry.set(this, void 0);
        _path_t_is_loop_exit.set(this, void 0);
        _path_t_bw_parents.set(this, void 0);
        _path_t_bw_childs.set(this, void 0);
        _path_t_is_bw.set(this, void 0);
        _path_t_bounds.set(this, void 0);
        this.tasks = [head];
        this.parents = new Set();
        this.childs = new Set();
        // this.#depth = null;
        // this.#depth_diff_min = null;
        // this.#depth_diff_max = null;
        // this.#cook_depth_diff_min = null;
        // this.#cook_depth_diff_max = null;
        __classPrivateFieldSet(this, _path_t_in_loop, null, "f");
        __classPrivateFieldSet(this, _path_t_is_loop_entry, null, "f");
        __classPrivateFieldSet(this, _path_t_is_loop_exit, null, "f");
        __classPrivateFieldSet(this, _path_t_bw_parents, null, "f");
        __classPrivateFieldSet(this, _path_t_bw_childs, null, "f");
        __classPrivateFieldSet(this, _path_t_is_bw, null, "f");
        __classPrivateFieldSet(this, _path_t_bounds, null, "f");
    }
    get head() {
        return this.tasks[0];
    }
    get id() {
        return this.tasks[0].id;
    }
    get cook_id() {
        return this.tasks[0].cook_id;
    }
    // get cook_depth_diff_min(): number {
    //     if (this.#cook_depth_diff_min === null) {
    //         this.#cook_depth_diff_min = Infinity;
    //         for (const child of this.childs) {
    //             if (this.cook_id == child.cook_id) {
    //                 this.#cook_depth_diff_min = Math.min(child.depth - this.depth, this.#cook_depth_diff_min);
    //             }
    //         }
    //     }
    //     return this.#cook_depth_diff_min;
    // }
    // get cook_depth_diff_max(): number {
    //     if (this.#cook_depth_diff_max === null) {
    //         this.#cook_depth_diff_max = -Infinity;
    //         for (const child of this.childs) {
    //             if (this.cook_id == child.cook_id) {
    //                 this.#cook_depth_diff_max = Math.max(child.depth - this.depth, this.#cook_depth_diff_max);
    //             }
    //         }
    //     }
    //     return this.#cook_depth_diff_max;
    // }
    get in_loop() {
        if (__classPrivateFieldGet(this, _path_t_in_loop, "f") === null) {
            __classPrivateFieldSet(this, _path_t_in_loop, has_path(this, this), "f");
        }
        return __classPrivateFieldGet(this, _path_t_in_loop, "f");
    }
    get is_loop_entry() {
        if (__classPrivateFieldGet(this, _path_t_is_loop_entry, "f") === null) {
            __classPrivateFieldSet(this, _path_t_is_loop_entry, false, "f");
            for (const parent of this.parents) {
                if (!parent.in_loop || !has_path(this, parent)) {
                    __classPrivateFieldSet(this, _path_t_is_loop_entry, true, "f");
                    break;
                }
            }
        }
        return __classPrivateFieldGet(this, _path_t_is_loop_entry, "f");
    }
    get is_loop_exit() {
        if (__classPrivateFieldGet(this, _path_t_is_loop_exit, "f") === null) {
            __classPrivateFieldSet(this, _path_t_is_loop_exit, false, "f");
            for (const child of this.childs) {
                if (!child.in_loop || !has_path(child, this)) {
                    __classPrivateFieldSet(this, _path_t_is_loop_exit, true, "f");
                    break;
                }
            }
        }
        return __classPrivateFieldGet(this, _path_t_is_loop_exit, "f");
    }
    get bw_parents() {
        if (__classPrivateFieldGet(this, _path_t_bw_parents, "f") === null) {
            __classPrivateFieldSet(this, _path_t_bw_parents, new Set(), "f");
            for (const parent of this.parents) {
                if (parent.in_loop && has_path(this, parent)) {
                    __classPrivateFieldGet(this, _path_t_bw_parents, "f").add(parent);
                }
            }
        }
        return __classPrivateFieldGet(this, _path_t_bw_parents, "f");
    }
    get bw_childs() {
        if (__classPrivateFieldGet(this, _path_t_bw_childs, "f") === null) {
            __classPrivateFieldSet(this, _path_t_bw_childs, new Set(), "f");
            for (const child of this.childs) {
                if (child.in_loop && has_path(child, this)) {
                    __classPrivateFieldGet(this, _path_t_bw_childs, "f").add(child);
                }
            }
        }
        return __classPrivateFieldGet(this, _path_t_bw_childs, "f");
    }
    get is_bw() {
        if (__classPrivateFieldGet(this, _path_t_is_bw, "f") === null) {
            __classPrivateFieldSet(this, _path_t_is_bw, false, "f");
            for (const child of this.childs) {
                if ((child.is_bw && this.is_loop_entry) || child.bw_parents.has(this)) {
                    __classPrivateFieldSet(this, _path_t_is_bw, true, "f");
                    break;
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
_path_t_in_loop = new WeakMap(), _path_t_is_loop_entry = new WeakMap(), _path_t_is_loop_exit = new WeakMap(), _path_t_bw_parents = new WeakMap(), _path_t_bw_childs = new WeakMap(), _path_t_is_bw = new WeakMap(), _path_t_bounds = new WeakMap();
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