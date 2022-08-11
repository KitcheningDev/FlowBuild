export class Vec2 {
    x: number;
    y: number;

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

    AddVec(other: Vec2): Vec2 {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
    SubVec(other: Vec2): Vec2 {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }
    AddScal(scalar: number): Vec2 {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    DivScal(scalar: number): Vec2 {
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }

    Equals(other: Vec2): boolean {
        return this.x == other.x && this.y == other.y;
    }
}

/*
export enum TileType {
    Empty, Box, Arrow, SyncLine, Connector
}
*/

export class Arrow {
    up: boolean;
    right: boolean;
    down: boolean;
    left: boolean;

    constructor() {
        this.up = false;
        this.right = false;
        this.down = false;
        this.left = false;
    }

    IsEmpty(): boolean {
        return !(this.up || this.right || this.down || this.left);
    }
}
export class SyncLine {
    up: boolean;
    down: boolean;

    constructor() {
        this.up = false;
        this.down = false;
    }

    IsEmpty(): boolean {
        return !(this.up || this.down);
    }
}
export class Tile {
    text: string;
    arrow: Arrow;
    sync_line: SyncLine;

    constructor() {
        this.text = "";
        this.arrow = new Arrow();
        this.sync_line = new SyncLine();
    }

    IsEmpty(): boolean {
        return this.text == "" && this.arrow.IsEmpty() && this.sync_line.IsEmpty();
    }
}

export class Grid {
    readonly size: Vec2;
    #tiles: Array<Tile>;
    #boxes: Map<string, Vec2>;

    constructor(width: number, height: number) {
        this.size = new Vec2(width, height);
        this.#boxes = new Map<string, Vec2>();
        this.#tiles = [];
        for (let i = 0; i < width * height; ++i)
            this.#tiles.push(new Tile());
    }

    InBounds(coords: Vec2): boolean {
        return 0 <= coords.x && coords.x < this.size.x && 0 <= coords.y && coords.y < this.size.y;
    }
    IsEmpty(coords: Vec2): boolean {
        return this.Get(coords).IsEmpty();
    }

    SetText(text: string, coords: Vec2): void {
        if (text != "")
            this.#boxes.set(text, coords);
        else 
            this.#boxes.delete(this.#tiles[this.size.x * coords.y + coords.x].text);
        this.#tiles[this.size.x * coords.y + coords.x].text = text;
    }
    SetArrow(arrow: Arrow, coords: Vec2): void {
        this.#tiles[this.size.x * coords.y + coords.x].arrow = arrow;
    }
    SetSyncLine(sync_line: SyncLine, coords: Vec2): void {
        this.#tiles[this.size.x * coords.y + coords.x].sync_line = sync_line;
    }

    OverlapArrow(arrow: Arrow, coords: Vec2): void {
        const tile_arrow = this.#tiles[this.size.x * coords.y + coords.x].arrow;
        if (!tile_arrow.up)
            tile_arrow.up = arrow.up;
        if (!tile_arrow.right)
            tile_arrow.right = arrow.right;
        if (!tile_arrow.down)
            tile_arrow.down = arrow.down;
        if (!tile_arrow.left)
            tile_arrow.left = arrow.left;
    }

    Set(tile: Tile, coords: Vec2): void {
        this.#tiles[this.size.x * coords.y + coords.x] = tile;
    }
    Get(coords: Vec2): Tile {
        return this.#tiles[this.size.x * coords.y + coords.x];
    }
    GetPos(text: string): Vec2 {
        if (this.#boxes.has(text))
            return this.#boxes.get(text);
        else
            return null;
    }
}