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
var _Recipe_connections, _Recipe_boxes;
import { Graph } from "./Graph.js";
export class Recipe {
    constructor(name, connections) {
        _Recipe_connections.set(this, void 0);
        _Recipe_boxes.set(this, void 0);
        this.name = name;
        __classPrivateFieldSet(this, _Recipe_boxes, new Set(), "f");
        this.SetConnections(connections);
    }
    AddConnection(from, to) {
        __classPrivateFieldSet(this, _Recipe_connections, __classPrivateFieldGet(this, _Recipe_connections, "f").filter((pair) => { return !(pair[0] == from && pair[1] == "END"); }), "f");
        if (!__classPrivateFieldGet(this, _Recipe_boxes, "f").has(to)) {
            __classPrivateFieldGet(this, _Recipe_boxes, "f").add(to);
            __classPrivateFieldGet(this, _Recipe_connections, "f").push([to, "END"]);
        }
        __classPrivateFieldGet(this, _Recipe_connections, "f").push([from, to]);
    }
    SetConnections(connections) {
        __classPrivateFieldSet(this, _Recipe_connections, connections, "f");
        __classPrivateFieldGet(this, _Recipe_boxes, "f").clear();
        for (const connection of connections) {
            for (const text of connection) {
                if (!__classPrivateFieldGet(this, _Recipe_boxes, "f").has(text))
                    __classPrivateFieldGet(this, _Recipe_boxes, "f").add(text);
            }
        }
    }
    CreateGraph() {
        const graph = new Graph(__classPrivateFieldGet(this, _Recipe_connections, "f"));
        if (!graph.is_valid) {
            alert(`recipe \"${this.name}\" has an invalid graph`);
            console.table(__classPrivateFieldGet(this, _Recipe_connections, "f"));
        }
        return graph;
    }
}
_Recipe_connections = new WeakMap(), _Recipe_boxes = new WeakMap();
//# sourceMappingURL=Recipe.js.map