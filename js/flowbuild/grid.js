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
var _Grid_boxes, _Grid_tiles;
export class Vec2 {
    constructor(...any) {
        if (any.length == 0) {
            this.x = 0;
            this.y = 0;
        }
        else if (any.length == 1) {
            this.x = any[0];
            this.y = any[0];
        }
        else {
            this.x = any[0];
            this.y = any[1];
        }
    }
    AddVec(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    SubVec(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    AddScal(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    DivScal(scalar) {
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }
    Copy() {
        return new Vec2(this.x, this.y);
    }
}
export function Add(v1, v2) {
    return new Vec2(v1.x + v2.x, v1.y + v2.y);
}
export function Sub(v1, v2) {
    return new Vec2(v1.x - v2.x, v1.y - v2.y);
}
export function Mul(v1, scalar) {
    return new Vec2(v1.x * scalar, v1.y * scalar);
}
export function Div(v1, scalar) {
    return new Vec2(v1.x / scalar, v1.y / scalar);
}
export function Equals(v1, v2) {
    return v1.x == v2.x && v1.y == v2.y;
}
export class Arrow {
    constructor(up = false, right = false, down = false, left = false) {
        this.up = up;
        this.right = right;
        this.down = down;
        this.left = left;
    }
    IsEmpty() {
        return !(this.up || this.right || this.down || this.left);
    }
    Split() {
        const out = [];
        if (this.up)
            out.push(ArrowUp());
        if (this.right)
            out.push(ArrowRight());
        if (this.down)
            out.push(ArrowDown());
        if (this.left)
            out.push(ArrowLeft());
        return out;
    }
}
export function ArrowUp() {
    return new Arrow(true, false, false, false);
}
export function ArrowRight() {
    return new Arrow(false, true, false, false);
}
export function ArrowDown() {
    return new Arrow(false, false, true, false);
}
export function ArrowLeft() {
    return new Arrow(false, false, false, true);
}
export class SyncLine {
    constructor(up = false, down = false) {
        this.up = up;
        this.down = down;
    }
    IsEmpty() {
        return !(this.up || this.down);
    }
    Split() {
        const out = [];
        if (this.up)
            out.push(SyncLineUp());
        if (this.down)
            out.push(SyncLineDown());
        return out;
    }
}
export function SyncLineUp() {
    return new SyncLine(true, false);
}
export function SyncLineDown() {
    return new SyncLine(false, true);
}
export class Tile {
    constructor(text = "", arrow = new Arrow(), sync_line = new SyncLine(), x_shift = 0) {
        this.text = text;
        this.arrow = arrow;
        this.sync_line = sync_line;
        this.x_shift = x_shift;
    }
    IsEmpty() {
        return this.text == "" && this.arrow.IsEmpty() && this.sync_line.IsEmpty();
    }
}
export class Grid {
    constructor(bounds) {
        _Grid_boxes.set(this, void 0);
        _Grid_tiles.set(this, void 0);
        this.size = bounds;
        __classPrivateFieldSet(this, _Grid_boxes, new Map(), "f");
        __classPrivateFieldSet(this, _Grid_tiles, [], "f");
        this.depth_heights = [];
        for (let i = 0; i < bounds.x * bounds.y; ++i)
            __classPrivateFieldGet(this, _Grid_tiles, "f").push(new Tile());
    }
    InBounds(coords) {
        return 0 <= coords.x && coords.x < this.size.x && 0 <= coords.y && coords.y < this.size.y;
    }
    IsEmpty(coords) {
        return this.Get(coords).IsEmpty();
    }
    SetText(text, coords) {
        if (text == "")
            __classPrivateFieldGet(this, _Grid_boxes, "f").delete(__classPrivateFieldGet(this, _Grid_tiles, "f")[this.size.x * coords.y + coords.x].text);
        else
            __classPrivateFieldGet(this, _Grid_boxes, "f").set(text, coords);
        __classPrivateFieldGet(this, _Grid_tiles, "f")[this.size.x * coords.y + coords.x].text = text;
    }
    SetArrow(arrow, coords) {
        __classPrivateFieldGet(this, _Grid_tiles, "f")[this.size.x * coords.y + coords.x].arrow = arrow;
    }
    SetSyncLine(sync_line, coords) {
        __classPrivateFieldGet(this, _Grid_tiles, "f")[this.size.x * coords.y + coords.x].sync_line = sync_line;
    }
    OverlapArrow(arrow, coords) {
        const tile_arrow = __classPrivateFieldGet(this, _Grid_tiles, "f")[this.size.x * coords.y + coords.x].arrow;
        if (!tile_arrow.up)
            tile_arrow.up = arrow.up;
        if (!tile_arrow.right)
            tile_arrow.right = arrow.right;
        if (!tile_arrow.down)
            tile_arrow.down = arrow.down;
        if (!tile_arrow.left)
            tile_arrow.left = arrow.left;
    }
    OverlapSyncLine(sync_line, coords) {
        const tile_sync_line = __classPrivateFieldGet(this, _Grid_tiles, "f")[this.size.x * coords.y + coords.x].sync_line;
        if (!tile_sync_line.up)
            tile_sync_line.up = sync_line.up;
        if (!tile_sync_line.down)
            tile_sync_line.down = sync_line.down;
    }
    SetSubGrid(grid, origin) {
        let x_shift = origin.x - Math.floor(origin.x);
        const int_origin = new Vec2(Math.floor(origin.x), origin.y);
        for (let y = 0; y < grid.size.y; ++y) {
            for (let x = 0; x < grid.size.x; ++x) {
                const coords = new Vec2(x, y).AddVec(int_origin);
                this.Set(grid.Get(new Vec2(x, y)), coords);
                this.Get(coords).x_shift = x_shift;
            }
        }
    }
    Mirror() {
        for (let y = 0; y < this.size.y; ++y) {
            for (let x = 0; x < Math.floor(this.size.x / 2); ++x) {
                const temp = this.Get(new Vec2(x, y));
                this.Set(this.Get(new Vec2(this.size.x - x - 1, y)), new Vec2(x, y));
                this.Set(temp, new Vec2(this.size.x - x - 1, y));
            }
        }
    }
    Set(tile, coords) {
        __classPrivateFieldGet(this, _Grid_tiles, "f")[this.size.x * coords.y + coords.x] = tile;
    }
    Get(coords) {
        return __classPrivateFieldGet(this, _Grid_tiles, "f")[this.size.x * coords.y + coords.x];
    }
    GetPos(text) {
        if (__classPrivateFieldGet(this, _Grid_boxes, "f").has(text))
            return __classPrivateFieldGet(this, _Grid_boxes, "f").get(text);
        else
            return null;
    }
    Log() {
        for (let y = 0; y < this.size.y; ++y) {
            const tile_arr = __classPrivateFieldGet(this, _Grid_tiles, "f").slice(this.size.x * y, this.size.x * (y + 1));
            const text_arr = [];
            for (const tile of tile_arr)
                text_arr.push(tile.text);
            console.log(...text_arr);
        }
    }
}
_Grid_boxes = new WeakMap(), _Grid_tiles = new WeakMap();
export function Resized(grid, size) {
    const out = new Grid(size);
    for (let y = 0; y < Math.min(grid.size.y, size.y); ++y) {
        for (let x = 0; x < Math.min(grid.size.x, size.x); ++x)
            out.Set(grid.Get(new Vec2(x, y)), new Vec2(x, y));
    }
    return out;
}
//# sourceMappingURL=Grid.js.map