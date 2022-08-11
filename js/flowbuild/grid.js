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
var _Grid_tiles, _Grid_boxes;
export class Vec2 {
    constructor(...any) {
        if (any.length == 0) {
            this.x = 0;
            this.y = 0;
        }
        else if (any.length == 1) {
            this.x = any[0].x;
            this.y = any[0].y;
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
    Equals(other) {
        return this.x == other.x && this.y == other.y;
    }
}
/*
export enum TileType {
    Empty, Box, Arrow, SyncLine, Connector
}
*/
export class Arrow {
    constructor() {
        this.up = false;
        this.right = false;
        this.down = false;
        this.left = false;
    }
    IsEmpty() {
        return !(this.up || this.right || this.down || this.left);
    }
}
export class SyncLine {
    constructor() {
        this.up = false;
        this.down = false;
    }
    IsEmpty() {
        return !(this.up || this.down);
    }
}
export class Tile {
    constructor() {
        this.text = "";
        this.arrow = new Arrow();
        this.sync_line = new SyncLine();
    }
    IsEmpty() {
        return this.text == "" && this.arrow.IsEmpty() && this.sync_line.IsEmpty();
    }
}
export class Grid {
    constructor(width, height) {
        _Grid_tiles.set(this, void 0);
        _Grid_boxes.set(this, void 0);
        this.size = new Vec2(width, height);
        __classPrivateFieldSet(this, _Grid_boxes, new Map(), "f");
        __classPrivateFieldSet(this, _Grid_tiles, [], "f");
        for (let i = 0; i < width * height; ++i)
            __classPrivateFieldGet(this, _Grid_tiles, "f").push(new Tile());
    }
    InBounds(coords) {
        return 0 <= coords.x && coords.x < this.size.x && 0 <= coords.y && coords.y < this.size.y;
    }
    IsEmpty(coords) {
        return this.Get(coords).IsEmpty();
    }
    SetText(text, coords) {
        if (text != "")
            __classPrivateFieldGet(this, _Grid_boxes, "f").set(text, coords);
        else
            __classPrivateFieldGet(this, _Grid_boxes, "f").delete(__classPrivateFieldGet(this, _Grid_tiles, "f")[this.size.x * coords.y + coords.x].text);
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
}
_Grid_tiles = new WeakMap(), _Grid_boxes = new WeakMap();
//# sourceMappingURL=grid.js.map