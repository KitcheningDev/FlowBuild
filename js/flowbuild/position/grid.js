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
var _Grid_data, _Grid_size, _Grid_nodes;
export class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
export class Grid {
    constructor(size) {
        _Grid_data.set(this, void 0);
        _Grid_size.set(this, void 0);
        _Grid_nodes.set(this, void 0);
        __classPrivateFieldSet(this, _Grid_data, [], "f");
        __classPrivateFieldSet(this, _Grid_size, size, "f");
        __classPrivateFieldSet(this, _Grid_nodes, new Map(), "f");
        for (let y = 0; y < size.y; ++y) {
            const list = [];
            for (let x = 0; x < size.x; ++x) {
                list.push(null);
            }
            __classPrivateFieldGet(this, _Grid_data, "f").push(list);
        }
    }
    get_size() {
        return __classPrivateFieldGet(this, _Grid_size, "f");
    }
    get(coords) {
        return __classPrivateFieldGet(this, _Grid_data, "f")[coords.y][coords.x];
    }
    set(coords, node) {
        if (node !== null) {
            __classPrivateFieldGet(this, _Grid_nodes, "f").set(node, coords);
        }
        __classPrivateFieldGet(this, _Grid_data, "f")[coords.y][coords.x] = node;
    }
    remove(node) {
        this.set(__classPrivateFieldGet(this, _Grid_nodes, "f").get(node), null);
        __classPrivateFieldGet(this, _Grid_nodes, "f").delete(node);
    }
    has(node) {
        return __classPrivateFieldGet(this, _Grid_nodes, "f").has(node);
    }
    get_coords(node) {
        return __classPrivateFieldGet(this, _Grid_nodes, "f").get(node);
    }
    // debug
    log() {
        let description_data = [];
        for (let y = 0; y < __classPrivateFieldGet(this, _Grid_size, "f").y; ++y) {
            const row = [];
            for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
                const node = this.get(new Vec2(x, y));
                if (node === null) {
                    row.push(' ');
                }
                else {
                    row.push(node.task.description);
                }
            }
            description_data.push(row);
        }
        console.table(description_data);
    }
}
_Grid_data = new WeakMap(), _Grid_size = new WeakMap(), _Grid_nodes = new WeakMap();
//# sourceMappingURL=grid.js.map