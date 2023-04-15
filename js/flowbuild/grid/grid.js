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
        _Grid_set_function.set(this, void 0);
        _Grid_default_constructor.set(this, void 0);
        _Grid_data.set(this, void 0);
        _Grid_size.set(this, void 0);
        __classPrivateFieldSet(this, _Grid_set_function, set_function, "f");
        __classPrivateFieldSet(this, _Grid_default_constructor, default_constructor, "f");
        __classPrivateFieldSet(this, _Grid_data, [], "f");
        __classPrivateFieldSet(this, _Grid_size, size, "f");
        for (let i = 0; i < size.x * size.y; ++i) {
            __classPrivateFieldGet(this, _Grid_data, "f").push(default_constructor());
        }
    }
    // access
    in_bounds(coords) {
        return 0 <= coords.x && coords.x < __classPrivateFieldGet(this, _Grid_size, "f").x && 0 <= coords.y && coords.y < __classPrivateFieldGet(this, _Grid_size, "f").y;
    }
    get(coords) {
        if (this.in_bounds(coords)) {
            return __classPrivateFieldGet(this, _Grid_data, "f")[__classPrivateFieldGet(this, _Grid_size, "f").x * coords.y + coords.x].copy();
        }
        console.error("invalid input", coords);
    }
    set(val, coords) {
        if (this.in_bounds(coords)) {
            __classPrivateFieldGet(this, _Grid_set_function, "f").call(this, val, coords.copy(), this);
            __classPrivateFieldGet(this, _Grid_data, "f")[__classPrivateFieldGet(this, _Grid_size, "f").x * coords.y + coords.x] = val.copy();
        }
        else {
            console.error("invalid input", coords);
        }
    }
    get_entry(coords) {
        return new IEntry(this.get(coords), coords);
    }
    set_entry(entry) {
        this.set(entry.tile, entry.coords);
    }
    remove(coords) {
        this.set(__classPrivateFieldGet(this, _Grid_default_constructor, "f").call(this), coords);
    }
    get_entries() {
        const entries = new Set;
        for (let y = 0; y < __classPrivateFieldGet(this, _Grid_size, "f").y; ++y) {
            for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
                entries.add([this.get(new Vec2(x, y)), new Vec2(x, y)]);
            }
        }
        return entries;
    }
    // size
    is_empty() {
        return __classPrivateFieldGet(this, _Grid_size, "f").x == 0 || __classPrivateFieldGet(this, _Grid_size, "f").y == 0;
    }
    get_size() {
        return __classPrivateFieldGet(this, _Grid_size, "f").copy();
    }
    set_size(size) {
        if (size.x < 0 || !Number.isInteger(size.x) || size.y < 0 || !Number.isInteger(size.y)) {
            console.error("invalid input", size);
            return;
        }
        const grid = new Grid(__classPrivateFieldGet(this, _Grid_set_function, "f"), __classPrivateFieldGet(this, _Grid_default_constructor, "f"), size);
        for (let y = 0; y < size.y; ++y) {
            for (let x = 0; x < size.x; ++x) {
                if (this.in_bounds(new Vec2(x, y))) {
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
    hor_path_every(x1, x2, y, cond) {
        if (x2 < x1) {
            return this.hor_path_every(x2, x1, y, cond);
        }
        return this.every((tile) => {
            if (x1 <= tile.coords.x && tile.coords.x <= x2 && y == tile.coords.y) {
                return cond(tile);
            }
            return true;
        });
    }
    ver_path_every(y1, y2, x, cond) {
        if (y2 < y1) {
            return this.ver_path_every(y2, y1, x, cond);
        }
        return this.every((tile) => {
            if (y1 <= tile.coords.y && tile.coords.y <= y2 && x == tile.coords.x) {
                return cond(tile);
            }
            return true;
        });
    }
    row_every(where, cond) {
        return this.hor_path_every(0, __classPrivateFieldGet(this, _Grid_size, "f").x - 1, where, cond);
    }
    column_every(where, cond) {
        return this.ver_path_every(0, __classPrivateFieldGet(this, _Grid_size, "f").y - 1, where, cond);
    }
    is_hor_path_empty(x1, x2, y) {
        return this.hor_path_every(x1, x2, y, (entry) => entry.tile.is_empty());
    }
    is_ver_path_empty(y1, y2, x) {
        return this.ver_path_every(y1, y2, x, (entry) => entry.tile.is_empty());
    }
    is_row_empty(where) {
        return this.is_hor_path_empty(0, __classPrivateFieldGet(this, _Grid_size, "f").x - 1, where);
    }
    is_column_empty(where) {
        return this.is_ver_path_empty(0, __classPrivateFieldGet(this, _Grid_size, "f").y - 1, where);
    }
    // modify
    shrink_to_fit() {
        if (this.is_empty()) {
            return;
        }
        let min_x = __classPrivateFieldGet(this, _Grid_size, "f").x;
        while (min_x > 0 && this.is_column_empty(min_x - 1)) {
            min_x--;
        }
        let min_y = __classPrivateFieldGet(this, _Grid_size, "f").y;
        while (min_y > 0 && this.is_row_empty(min_y - 1)) {
            min_y--;
        }
        this.set_size(new Vec2(min_x, min_y));
    }
    // shift
    shift_up(where) {
        for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
            for (let y = where; y < __classPrivateFieldGet(this, _Grid_size, "f").y - 1; ++y) {
                this.set(this.get(new Vec2(x, y + 1)), new Vec2(x, y));
            }
        }
        for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
            this.remove(new Vec2(x, __classPrivateFieldGet(this, _Grid_size, "f").y - 1));
        }
    }
    shift_down(where) {
        for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
            for (let y = __classPrivateFieldGet(this, _Grid_size, "f").y - 1; y > where; --y) {
                this.set(this.get(new Vec2(x, y - 1)), new Vec2(x, y));
            }
        }
        for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
            this.remove(new Vec2(x, where));
        }
    }
    shift_left(where) {
        for (let y = 0; y < __classPrivateFieldGet(this, _Grid_size, "f").y; ++y) {
            for (let x = where; x < __classPrivateFieldGet(this, _Grid_size, "f").x - 1; ++x) {
                this.set(this.get(new Vec2(x + 1, y)), new Vec2(x, y));
            }
        }
        for (let y = 0; y < __classPrivateFieldGet(this, _Grid_size, "f").y; ++y) {
            this.remove(new Vec2(__classPrivateFieldGet(this, _Grid_size, "f").x - 1, y));
        }
    }
    shift_right(where) {
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
    insert_row(where) {
        this.set_size(__classPrivateFieldGet(this, _Grid_size, "f").down());
        this.shift_down(where);
    }
    insert_column(where) {
        this.set_size(__classPrivateFieldGet(this, _Grid_size, "f").right());
        this.shift_right(where);
    }
    remove_row(where) {
        this.shift_up(where);
        this.set_size(__classPrivateFieldGet(this, _Grid_size, "f").up());
    }
    remove_column(where) {
        this.shift_right(where);
        this.set_size(__classPrivateFieldGet(this, _Grid_size, "f").left());
    }
}
_Grid_set_function = new WeakMap(), _Grid_default_constructor = new WeakMap(), _Grid_data = new WeakMap(), _Grid_size = new WeakMap();
//# sourceMappingURL=grid.js.map