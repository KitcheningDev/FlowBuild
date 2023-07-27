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
var _Grid_set_function, _Grid_default_constructor, _Grid_data, _Grid_size;
import { Vec2 } from "../../utils/vec2.js";
export class IEntry {
    constructor(tile, coords) {
        this.tile = tile;
        this.coords = coords;
    }
}
export class Grid {
    constructor(set_function, default_constructor, size = new Vec2(0, 0)) {
        // member
        _Grid_set_function.set(this, void 0);
        _Grid_default_constructor.set(this, void 0);
        _Grid_data.set(this, void 0);
        _Grid_size.set(this, void 0);
        __classPrivateFieldSet(this, _Grid_set_function, set_function, "f");
        __classPrivateFieldSet(this, _Grid_default_constructor, default_constructor, "f");
        __classPrivateFieldSet(this, _Grid_size, size, "f");
        this.clear();
    }
    // access
    inBounds(coords) {
        return 0 <= coords.x && coords.x < __classPrivateFieldGet(this, _Grid_size, "f").x && 0 <= coords.y && coords.y < __classPrivateFieldGet(this, _Grid_size, "f").y;
    }
    get(coords) {
        if (this.inBounds(coords)) {
            return __classPrivateFieldGet(this, _Grid_data, "f")[__classPrivateFieldGet(this, _Grid_size, "f").x * coords.y + coords.x].clone();
        }
        console.error("INVALID INPUT", coords);
    }
    set(val, coords) {
        if (this.inBounds(coords)) {
            __classPrivateFieldGet(this, _Grid_set_function, "f").call(this, val, coords.clone(), this);
            __classPrivateFieldGet(this, _Grid_data, "f")[__classPrivateFieldGet(this, _Grid_size, "f").x * coords.y + coords.x] = val.clone();
        }
        else {
            console.error("INVALID INPUT", coords);
        }
    }
    getEntry(coords) {
        return new IEntry(this.get(coords).clone(), coords.clone());
    }
    setEntry(entry) {
        this.set(entry.tile, entry.coords);
    }
    remove(coords) {
        this.set(__classPrivateFieldGet(this, _Grid_default_constructor, "f").call(this), coords);
    }
    clear() {
        __classPrivateFieldSet(this, _Grid_data, [], "f");
        for (let i = 0; i < this.size.x * this.size.y; ++i) {
            __classPrivateFieldGet(this, _Grid_data, "f").push(__classPrivateFieldGet(this, _Grid_default_constructor, "f").call(this));
        }
    }
    // iterate
    get entries() {
        const entries = new Set;
        for (let y = 0; y < __classPrivateFieldGet(this, _Grid_size, "f").y; ++y) {
            for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
                entries.add([this.get(new Vec2(x, y)), new Vec2(x, y)]);
            }
        }
        return entries;
    }
    get tiles() {
        return __classPrivateFieldGet(this, _Grid_data, "f").values();
    }
    // size
    isEmpty() {
        return __classPrivateFieldGet(this, _Grid_size, "f").x == 0 || __classPrivateFieldGet(this, _Grid_size, "f").y == 0;
    }
    get size() {
        return __classPrivateFieldGet(this, _Grid_size, "f").clone();
    }
    setSize(size) {
        if (size.x < 0 || !Number.isInteger(size.x) || size.y < 0 || !Number.isInteger(size.y)) {
            console.error("INVALID INPUT", size);
            return;
        }
        const grid = new Grid(__classPrivateFieldGet(this, _Grid_set_function, "f"), __classPrivateFieldGet(this, _Grid_default_constructor, "f"), size);
        for (let y = 0; y < size.y; ++y) {
            for (let x = 0; x < size.x; ++x) {
                if (this.inBounds(new Vec2(x, y))) {
                    grid.set(this.get(new Vec2(x, y)), new Vec2(x, y));
                }
                else {
                    grid.set(__classPrivateFieldGet(this, _Grid_default_constructor, "f").call(this), new Vec2(x, y));
                }
            }
        }
        __classPrivateFieldSet(this, _Grid_data, __classPrivateFieldGet(grid, _Grid_data, "f"), "f");
        __classPrivateFieldSet(this, _Grid_size, size, "f");
    }
    shrinkToFit() {
        if (this.isEmpty()) {
            return;
        }
        while (0 < this.size.y && this.isRowEmpty(0)) {
            this.removeRow(0);
        }
        while (0 < this.size.y && this.isRowEmpty(this.size.y - 1)) {
            this.removeRow(this.size.y - 1);
        }
        while (0 < this.size.x && this.isColumnEmpty(0)) {
            this.removeColumn(0);
        }
        while (0 < this.size.x && this.isColumnEmpty(this.size.x - 1)) {
            this.removeColumn(this.size.x - 1);
        }
    }
    // traversal
    every(cond) {
        for (let y = 0; y < __classPrivateFieldGet(this, _Grid_size, "f").y; ++y) {
            for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
                const tile = new IEntry(this.get(new Vec2(x, y)), new Vec2(x, y));
                if (!cond(tile)) {
                    return false;
                }
            }
        }
        return true;
    }
    horEvery(x1, x2, y, cond) {
        if (x2 < x1) {
            return this.horEvery(x2, x1, y, cond);
        }
        return this.every((tile) => {
            if (x1 <= tile.coords.x && tile.coords.x <= x2 && y == tile.coords.y) {
                return cond(tile);
            }
            return true;
        });
    }
    verEvery(y1, y2, x, cond) {
        if (y2 < y1) {
            return this.verEvery(y2, y1, x, cond);
        }
        return this.every((tile) => {
            if (y1 <= tile.coords.y && tile.coords.y <= y2 && x == tile.coords.x) {
                return cond(tile);
            }
            return true;
        });
    }
    rowEvery(where, cond) {
        return this.horEvery(0, __classPrivateFieldGet(this, _Grid_size, "f").x - 1, where, cond);
    }
    columnEvery(where, cond) {
        return this.verEvery(0, __classPrivateFieldGet(this, _Grid_size, "f").y - 1, where, cond);
    }
    isHorEmpty(x1, x2, y) {
        return this.horEvery(x1, x2, y, (entry) => entry.tile.isEmpty());
    }
    isVerEmpty(y1, y2, x) {
        return this.verEvery(y1, y2, x, (entry) => entry.tile.isEmpty());
    }
    isRowEmpty(where) {
        return this.isHorEmpty(0, __classPrivateFieldGet(this, _Grid_size, "f").x - 1, where);
    }
    isColumnEmpty(where) {
        return this.isVerEmpty(0, __classPrivateFieldGet(this, _Grid_size, "f").y - 1, where);
    }
    // shift
    shiftUp(where) {
        for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
            for (let y = where; y < __classPrivateFieldGet(this, _Grid_size, "f").y - 1; ++y) {
                this.set(this.get(new Vec2(x, y + 1)), new Vec2(x, y));
            }
        }
        for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
            this.remove(new Vec2(x, __classPrivateFieldGet(this, _Grid_size, "f").y - 1));
        }
    }
    shiftDown(where) {
        for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
            for (let y = __classPrivateFieldGet(this, _Grid_size, "f").y - 1; y > where; --y) {
                this.set(this.get(new Vec2(x, y - 1)), new Vec2(x, y));
            }
        }
        for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
            this.remove(new Vec2(x, where));
        }
    }
    shiftLeft(where) {
        for (let y = 0; y < __classPrivateFieldGet(this, _Grid_size, "f").y; ++y) {
            for (let x = where; x < __classPrivateFieldGet(this, _Grid_size, "f").x - 1; ++x) {
                this.set(this.get(new Vec2(x + 1, y)), new Vec2(x, y));
            }
        }
        for (let y = 0; y < __classPrivateFieldGet(this, _Grid_size, "f").y; ++y) {
            this.remove(new Vec2(__classPrivateFieldGet(this, _Grid_size, "f").x - 1, y));
        }
    }
    shiftRight(where) {
        for (let y = 0; y < __classPrivateFieldGet(this, _Grid_size, "f").y; ++y) {
            for (let x = __classPrivateFieldGet(this, _Grid_size, "f").x - 1; x > where; --x) {
                this.set(this.get(new Vec2(x - 1, y)), new Vec2(x, y));
            }
        }
        for (let y = 0; y < __classPrivateFieldGet(this, _Grid_size, "f").y; ++y) {
            this.remove(new Vec2(where, y));
        }
    }
    // insert / remove
    insertRow(where) {
        this.setSize(__classPrivateFieldGet(this, _Grid_size, "f").down());
        this.shiftDown(where);
    }
    insertColumn(where) {
        this.setSize(__classPrivateFieldGet(this, _Grid_size, "f").right());
        this.shiftRight(where);
    }
    removeRow(where) {
        this.shiftUp(where);
        this.setSize(__classPrivateFieldGet(this, _Grid_size, "f").up());
    }
    removeColumn(where) {
        this.shiftLeft(where);
        this.setSize(__classPrivateFieldGet(this, _Grid_size, "f").left());
    }
}
_Grid_set_function = new WeakMap(), _Grid_default_constructor = new WeakMap(), _Grid_data = new WeakMap(), _Grid_size = new WeakMap();
//# sourceMappingURL=grid.js.map