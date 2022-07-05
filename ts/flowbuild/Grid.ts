export class Vec2 {
    x: number;
    y: number;

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
        return this.up || this.right || this.down || this.left;
    }
}
export class Tile {
    text: string;
    arrow: Arrow;

    constructor() {
        this.text = "";
        this.arrow = new Arrow();
    }
}

export class Grid {
    readonly size: Vec2;
    #tiles: Array<Tile>;
    #boxes: Map<string, Vec2>;

    constructor(width: number, height: number) {
        this.size = new Vec2(width, height);

        this.#tiles = [];
        for (let i = 0; i < width * height; ++i)
            this.#tiles.push(new Tile());
    }

    SetText(text: string, coords: Vec2): void {
        this.#tiles[this.size.x * coords.y + coords.x].text = text;
    }
    SetArrow(arrow: Arrow, coords: Vec2): void {
        this.#tiles[this.size.x * coords.y + coords.x].arrow = arrow;
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