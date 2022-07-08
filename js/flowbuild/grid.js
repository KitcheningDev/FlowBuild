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
            this.x = any[0];
            this.y = any[1];
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
        return this.up || this.right || this.down || this.left;
    }
}
export class Tile {
    constructor() {
        this.text = "";
        this.arrow = new Arrow();
    }
}
export class Grid {
    constructor(width, height) {
        _Grid_tiles.set(this, void 0);
        _Grid_boxes.set(this, void 0);
        this.size = new Vec2(width, height);
        __classPrivateFieldSet(this, _Grid_tiles, [], "f");
        for (let i = 0; i < width * height; ++i)
            __classPrivateFieldGet(this, _Grid_tiles, "f").push(new Tile());
    }
    SetText(text, coords) {
        __classPrivateFieldGet(this, _Grid_tiles, "f")[this.size.x * coords.y + coords.x].text = text;
    }
    SetArrow(arrow, coords) {
        __classPrivateFieldGet(this, _Grid_tiles, "f")[this.size.x * coords.y + coords.x].arrow = arrow;
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