export class Vec2 {
    x: number;
    y: number;

    constructor(...any: number[]) {
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

    Copy(): Vec2 {
        return new Vec2(this.x, this.y);
    }
}
export function Add(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x + v2.x, v1.y + v2.y);
}
export function Sub(v1: Vec2, v2: Vec2): Vec2 {
    return new Vec2(v1.x - v2.x, v1.y - v2.y);
}
export function Mul(v1: Vec2, scalar: number): Vec2 {
    return new Vec2(v1.x * scalar, v1.y * scalar);
}
export function Div(v1: Vec2, scalar: number): Vec2 {
    return new Vec2(v1.x / scalar, v1.y / scalar);
}
export function Equals(v1: Vec2, v2: Vec2): boolean {
    return v1.x == v2.x && v1.y == v2.y;
}

export class Arrow {
    up: boolean;
    right: boolean;
    down: boolean;
    left: boolean;

    constructor(up: boolean = false, right: boolean = false, down: boolean = false, left: boolean = false) {
        this.up = up;
        this.right = right;
        this.down = down;
        this.left = left;
    }

    IsEmpty(): boolean {
        return !(this.up || this.right || this.down || this.left);
    }
    Split(): Arrow[] {
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
export function ArrowUp(): Arrow {
    return new Arrow(true, false, false, false);
}
export function ArrowRight(): Arrow {
    return new Arrow(false, true, false, false);
}
export function ArrowDown(): Arrow {
    return new Arrow(false, false, true, false);
}
export function ArrowLeft(): Arrow {
    return new Arrow(false, false, false, true);
}

export class SyncLine {
    up: boolean;
    down: boolean;

    constructor(up: boolean = false, down: boolean = false) {
        this.up = up;
        this.down = down;
    }

    IsEmpty(): boolean {
        return !(this.up || this.down);
    }
    Split(): SyncLine[] {
        const out = [];
        if (this.up)
            out.push(SyncLineUp());
        if (this.down)
            out.push(SyncLineDown());
        return out;
    }
}
export function SyncLineUp(): SyncLine {
    return new SyncLine(true, false);
}
export function SyncLineDown(): SyncLine {
    return new SyncLine(false, true);
}

export class Tile {
    text: string;
    arrow: Arrow;
    sync_line: SyncLine;
    x_shift: number;

    constructor(text: string = "", arrow: Arrow = new Arrow(), sync_line: SyncLine = new SyncLine(), x_shift: number = 0) {
        this.text = text;
        this.arrow = arrow;
        this.sync_line = sync_line;
        this.x_shift = x_shift;
    }

    IsEmpty(): boolean {
        return this.text == "" && this.arrow.IsEmpty() && this.sync_line.IsEmpty();
    }
}

export class Grid {
    readonly size: Vec2;
    depth_heights: Array<number>;
    #boxes: Map<string, Vec2>;
    #tiles: Tile[];

    constructor(bounds: Vec2) {
        this.size = bounds;
        this.#boxes = new Map<string, Vec2>();
        this.#tiles = [];
        this.depth_heights = [];
        for (let i = 0; i < bounds.x * bounds.y; ++i)
            this.#tiles.push(new Tile());
    }

    InBounds(coords: Vec2): boolean {
        return 0 <= coords.x && coords.x < this.size.x && 0 <= coords.y && coords.y < this.size.y;
    }
    IsEmpty(coords: Vec2): boolean {
        return this.Get(coords).IsEmpty();
    }

    SetText(text: string, coords: Vec2): void {
        if (text == "")
            this.#boxes.delete(this.#tiles[this.size.x * coords.y + coords.x].text);
        else 
            this.#boxes.set(text, coords);
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
    OverlapSyncLine(sync_line: SyncLine, coords: Vec2): void {
        const tile_sync_line = this.#tiles[this.size.x * coords.y + coords.x].sync_line;
        if (!tile_sync_line.up)
            tile_sync_line.up = sync_line.up;
        if (!tile_sync_line.down)
            tile_sync_line.down = sync_line.down;
    }
    
    SetSubGrid(grid: Grid, origin: Vec2): void {
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
    Mirror(): void {
        for (let y = 0; y < this.size.y; ++y) {
            for (let x = 0; x < Math.floor(this.size.x / 2); ++x) {
                const temp = this.Get(new Vec2(x, y));
                this.Set(this.Get(new Vec2(this.size.x - x - 1, y)), new Vec2(x, y));
                this.Set(temp, new Vec2(this.size.x - x - 1, y));
            }
        }
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

    Log(): void {
        for (let y = 0; y < this.size.y; ++y) {
            const tile_arr = this.#tiles.slice(this.size.x * y, this.size.x * (y + 1));
            const text_arr = [];
            for (const tile of tile_arr)
                text_arr.push(tile.text);
            console.log(...text_arr);
        }
    }
}

export function Resized(grid: Grid, size: Vec2): Grid {
    const out = new Grid(size);
    for (let y = 0; y < Math.min(grid.size.y, size.y); ++y) {
        for (let x = 0; x < Math.min(grid.size.x, size.x); ++x)
            out.Set(grid.Get(new Vec2(x, y)), new Vec2(x, y));
    }
    return out;
}