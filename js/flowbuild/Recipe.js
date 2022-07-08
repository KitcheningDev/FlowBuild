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
import { Graph } from "./Graph.js";
export class Recipe {
    constructor(name) {
        _Recipe_connections.set(this, void 0);
        this.name = name;
        __classPrivateFieldSet(this, _Recipe_connections, [["START", "END"]], "f");
        this.graph = new Graph(__classPrivateFieldGet(this, _Recipe_connections, "f"));
    }
    AddConnection(from, to) {
        __classPrivateFieldGet(this, _Recipe_connections, "f").push([from, to]);
    }
    UpdateGraph() {
        this.graph = new Graph(__classPrivateFieldGet(this, _Recipe_connections, "f"));
    }
}
_Recipe_connections = new WeakMap();
//# sourceMappingURL=Recipe.js.map