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
var _task_t_id, _task_t_cook_id;
import { hash_str } from "./hash_str.js";
export class task_t {
    constructor(str, cook_id) {
        _task_t_id.set(this, void 0);
        _task_t_cook_id.set(this, void 0);
        this._str = str;
        __classPrivateFieldSet(this, _task_t_cook_id, cook_id, "f");
        this.update_id();
    }
    copy() {
        return new task_t(this._str, __classPrivateFieldGet(this, _task_t_cook_id, "f"));
    }
    get id() {
        return __classPrivateFieldGet(this, _task_t_id, "f");
    }
    get cook_id() {
        return __classPrivateFieldGet(this, _task_t_cook_id, "f");
    }
    get str() {
        return this._str;
    }
    set cook_id(cook_id) {
        __classPrivateFieldSet(this, _task_t_cook_id, cook_id, "f");
        this.update_id();
    }
    set str(str) {
        this._str = str;
        this.update_id();
    }
    update_id() {
        __classPrivateFieldSet(this, _task_t_id, hash_str(this._str + __classPrivateFieldGet(this, _task_t_cook_id, "f").toString()), "f");
    }
}
_task_t_id = new WeakMap(), _task_t_cook_id = new WeakMap();
//# sourceMappingURL=task.js.map