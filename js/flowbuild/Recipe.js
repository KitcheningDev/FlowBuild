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
var _Recipe_conns, _Recipe_change_log, _Recipe_graph, _Recipe_changed;
import { Graph } from "./Graph.js";
import { Includes, LastElem, ObjEqualsFunc } from "../Utils/Funcs.js";
export class Recipe {
    constructor(name, paths) {
        _Recipe_conns.set(this, void 0);
        _Recipe_change_log.set(this, void 0);
        _Recipe_graph.set(this, void 0);
        _Recipe_changed.set(this, void 0);
        this.name = name;
        __classPrivateFieldSet(this, _Recipe_conns, [], "f");
        __classPrivateFieldSet(this, _Recipe_change_log, [], "f");
        __classPrivateFieldSet(this, _Recipe_graph, null, "f");
        __classPrivateFieldSet(this, _Recipe_changed, true, "f");
        this.SetConnections(paths);
    }
    AddConn(from, to) {
        const conn = { from: from, to: to };
        if (Includes(__classPrivateFieldGet(this, _Recipe_conns, "f"), ObjEqualsFunc(conn)))
            return;
        __classPrivateFieldSet(this, _Recipe_changed, true, "f");
        const conn_change = { added: [], removed: [] };
        __classPrivateFieldSet(this, _Recipe_conns, __classPrivateFieldGet(this, _Recipe_conns, "f").filter((conn2) => {
            if ((conn2.from == "START" && conn2.to == to) || (conn2.from == from && conn2.to == "END")) {
                conn_change.removed.push(conn2);
                return false;
            }
            return true;
        }), "f");
        if (from != "START" && !Includes(__classPrivateFieldGet(this, _Recipe_conns, "f"), (val) => { return val.to == from; })) {
            __classPrivateFieldGet(this, _Recipe_conns, "f").push({ from: "START", to: from });
            conn_change.added.push({ from: "START", to: from });
        }
        if (to != "END" && !Includes(__classPrivateFieldGet(this, _Recipe_conns, "f"), (val) => { return val.from == to; })) {
            __classPrivateFieldGet(this, _Recipe_conns, "f").push({ from: to, to: "END" });
            conn_change.added.push({ from: to, to: "END" });
        }
        __classPrivateFieldGet(this, _Recipe_conns, "f").push(conn);
        conn_change.added.push(conn);
        __classPrivateFieldGet(this, _Recipe_change_log, "f").push(conn_change);
    }
    UndoConn() {
        if (__classPrivateFieldGet(this, _Recipe_change_log, "f").length == 0)
            return;
        __classPrivateFieldSet(this, _Recipe_changed, true, "f");
        const connection_change = LastElem(__classPrivateFieldGet(this, _Recipe_change_log, "f"));
        __classPrivateFieldSet(this, _Recipe_conns, __classPrivateFieldGet(this, _Recipe_conns, "f").filter((conn) => { return !Includes(connection_change.added, ObjEqualsFunc(conn)); }), "f");
        for (const conn of connection_change.removed)
            __classPrivateFieldGet(this, _Recipe_conns, "f").push(conn);
        __classPrivateFieldGet(this, _Recipe_change_log, "f").pop();
    }
    SetConnections(paths) {
        __classPrivateFieldSet(this, _Recipe_changed, true, "f");
        __classPrivateFieldSet(this, _Recipe_conns, [], "f");
        __classPrivateFieldSet(this, _Recipe_change_log, [], "f");
        for (const path of paths) {
            let from;
            for (const text of path) {
                const conn = { from: from, to: text };
                if (from && !Includes(__classPrivateFieldGet(this, _Recipe_conns, "f"), ObjEqualsFunc(conn)))
                    __classPrivateFieldGet(this, _Recipe_conns, "f").push(conn);
                from = text;
            }
        }
    }
    Includes(text) {
        return Includes(__classPrivateFieldGet(this, _Recipe_conns, "f"), (val) => { return val.from == text || val.to == text; });
    }
    get graph() {
        if (__classPrivateFieldGet(this, _Recipe_changed, "f")) {
            __classPrivateFieldSet(this, _Recipe_graph, new Graph(__classPrivateFieldGet(this, _Recipe_conns, "f")), "f");
            if (!__classPrivateFieldGet(this, _Recipe_graph, "f").is_valid) {
                console.log(`Recipe \"${this.name}\" created invalid graph!`);
                console.log(...__classPrivateFieldGet(this, _Recipe_conns, "f"));
            }
            __classPrivateFieldSet(this, _Recipe_changed, false, "f");
            console.log(...__classPrivateFieldGet(this, _Recipe_conns, "f"));
        }
        return __classPrivateFieldGet(this, _Recipe_graph, "f");
    }
}
_Recipe_conns = new WeakMap(), _Recipe_change_log = new WeakMap(), _Recipe_graph = new WeakMap(), _Recipe_changed = new WeakMap();
//# sourceMappingURL=Recipe.js.map