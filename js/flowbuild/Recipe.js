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
var _Recipe_conns, _Recipe_curr_change, _Recipe_change_log, _Recipe_graph, _Recipe_changed_conns;
import { Graph } from "./Graph.js";
import { Includes, ObjEqualsFunc, LastElem } from "../Utils/Funcs.js";
export class Recipe {
    constructor(name, paths) {
        _Recipe_conns.set(this, void 0);
        _Recipe_curr_change.set(this, void 0);
        _Recipe_change_log.set(this, void 0);
        _Recipe_graph.set(this, void 0);
        _Recipe_changed_conns.set(this, void 0);
        this.name = name;
        __classPrivateFieldSet(this, _Recipe_conns, [], "f");
        for (const path of paths) {
            let last;
            for (const curr of path) {
                if (last != undefined)
                    __classPrivateFieldGet(this, _Recipe_conns, "f").push({ from: last, to: curr });
                last = curr;
            }
        }
        __classPrivateFieldSet(this, _Recipe_curr_change, null, "f");
        __classPrivateFieldSet(this, _Recipe_change_log, [], "f");
        __classPrivateFieldSet(this, _Recipe_graph, null, "f");
        __classPrivateFieldSet(this, _Recipe_changed_conns, true, "f");
    }
    StartChange() {
        __classPrivateFieldSet(this, _Recipe_curr_change, { added: [], removed: [] }, "f");
    }
    CommitChange() {
        __classPrivateFieldSet(this, _Recipe_conns, __classPrivateFieldGet(this, _Recipe_conns, "f").filter((conn) => { return !Includes(__classPrivateFieldGet(this, _Recipe_curr_change, "f").removed, ObjEqualsFunc(conn)); }), "f");
        for (const add of __classPrivateFieldGet(this, _Recipe_curr_change, "f").added)
            __classPrivateFieldGet(this, _Recipe_conns, "f").push(add);
        if (__classPrivateFieldGet(this, _Recipe_curr_change, "f").added.length > 0 || __classPrivateFieldGet(this, _Recipe_curr_change, "f").removed.length > 0)
            __classPrivateFieldGet(this, _Recipe_change_log, "f").push(__classPrivateFieldGet(this, _Recipe_curr_change, "f"));
        __classPrivateFieldSet(this, _Recipe_curr_change, null, "f");
        __classPrivateFieldSet(this, _Recipe_changed_conns, true, "f");
        console.log(...__classPrivateFieldGet(this, _Recipe_conns, "f"));
    }
    UndoChange() {
        if (__classPrivateFieldGet(this, _Recipe_change_log, "f").length == 0)
            return;
        const last_change = LastElem(__classPrivateFieldGet(this, _Recipe_change_log, "f"));
        __classPrivateFieldSet(this, _Recipe_conns, __classPrivateFieldGet(this, _Recipe_conns, "f").filter((conn) => { return !Includes(last_change.added, ObjEqualsFunc(conn)); }), "f");
        for (const conn of last_change.removed)
            __classPrivateFieldGet(this, _Recipe_conns, "f").push(conn);
        __classPrivateFieldGet(this, _Recipe_change_log, "f").pop();
        __classPrivateFieldSet(this, _Recipe_changed_conns, true, "f");
    }
    AddConn(from, to) {
        console.assert(__classPrivateFieldGet(this, _Recipe_curr_change, "f") != null, "You need to start a change before you add connections to the recipe!");
        __classPrivateFieldGet(this, _Recipe_curr_change, "f").added.push({ from: from, to: to });
    }
    RemoveConn(from, to) {
        console.assert(__classPrivateFieldGet(this, _Recipe_curr_change, "f") != null, "You need to start a change before you remove connections from the recipe!");
        __classPrivateFieldGet(this, _Recipe_curr_change, "f").removed.push({ from: from, to: to });
    }
    HasText(text) {
        return Includes(__classPrivateFieldGet(this, _Recipe_conns, "f"), (val) => { return val.from == text || val.to == text; });
    }
    HasParent(text) {
        return Includes(__classPrivateFieldGet(this, _Recipe_conns, "f"), (val) => { return val.to == text; });
    }
    HasChild(text) {
        return Includes(__classPrivateFieldGet(this, _Recipe_conns, "f"), (val) => { return val.from == text; });
    }
    HasConn(from, to) {
        return Includes(__classPrivateFieldGet(this, _Recipe_conns, "f"), ObjEqualsFunc({ from: from, to: to }));
    }
    get graph() {
        if (__classPrivateFieldGet(this, _Recipe_changed_conns, "f")) {
            __classPrivateFieldSet(this, _Recipe_graph, new Graph(__classPrivateFieldGet(this, _Recipe_conns, "f")), "f");
            console.assert(__classPrivateFieldGet(this, _Recipe_graph, "f").is_valid, `Recipe \"${this.name}\" created invalid graph!`, ...__classPrivateFieldGet(this, _Recipe_conns, "f"));
            __classPrivateFieldSet(this, _Recipe_changed_conns, false, "f");
        }
        return __classPrivateFieldGet(this, _Recipe_graph, "f");
    }
}
_Recipe_conns = new WeakMap(), _Recipe_curr_change = new WeakMap(), _Recipe_change_log = new WeakMap(), _Recipe_graph = new WeakMap(), _Recipe_changed_conns = new WeakMap();
//# sourceMappingURL=Recipe.js.map