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
var _task_t_id;
let task_counter = 0;
export class task_t {
    constructor(str, cook_id, duration = 0) {
        _task_t_id.set(this, void 0);
        this.str = str;
        this.cook_id = cook_id;
        this.duration = duration;
        __classPrivateFieldSet(this, _task_t_id, ++task_counter, "f");
    }
    copy() {
        return new task_t(this.str, this.cook_id, this.duration);
    }
    get id() {
        return __classPrivateFieldGet(this, _task_t_id, "f");
    }
}
_task_t_id = new WeakMap();
//# sourceMappingURL=task.js.map