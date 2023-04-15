import { Vec2 } from "../../utils/vec2.js";

export interface ITile {
    is_empty: () => boolean;
    copy(): () => any;
}
export class IEntry<T extends ITile> {
    tile: T;
    coords: Vec2;

    constructor(tile: T, coords: Vec2) {
        this.tile = tile;
        this.coords = coords;
    }
}
export class Grid<T extends ITile> {
    #set_function: (val: T, coords: Vec2, grid: Grid<T>) => void;
    #default_constructor: () => T;

    #data: T[];
    #size: Vec2;

    constructor(set_function: (val: T, coords: Vec2, grid: Grid<T>) => void, default_constructor: () => T, size: Vec2 = new Vec2(0, 0)) {
        this.#set_function = set_function;
        this.#default_constructor = default_constructor;
        this.#data = [];
        this.#size = size;

        for (let i = 0; i < size.x * size.y; ++i) {
            this.#data.push(default_constructor());
        }
    }

    // access
    in_bounds(coords: Vec2): boolean {
        return 0 <= coords.x && coords.x < this.#size.x && 0 <= coords.y && coords.y < this.#size.y;
    }
    get(coords: Vec2): T {
        if (this.in_bounds(coords)) {
            return this.#data[this.#size.x * coords.y + coords.x].copy() as unknown as T;
        }
        console.error("invalid input", coords);
    }
    set(val: T, coords: Vec2): void {
        if (this.in_bounds(coords)) {
            this.#set_function(val, coords.copy(), this);
            this.#data[this.#size.x * coords.y + coords.x] = val.copy() as unknown as T;
        }
        else {
            console.error("invalid input", coords);
        }
    }
    get_entry(coords: Vec2): IEntry<T> {
        return new IEntry<T>(this.get(coords), coords);
    }
    set_entry(entry: IEntry<T>): void {
        this.set(entry.tile, entry.coords);
    }
    remove(coords: Vec2): void {
        this.set(this.#default_constructor(), coords);
    }
    get_entries(): Set<[T, Vec2]> {
        const entries = new Set<[T, Vec2]>;
        for (let y = 0; y < this.#size.y; ++y) {
            for (let x = 0; x < this.#size.x; ++x) {
                entries.add([this.get(new Vec2(x, y)), new Vec2(x, y)]);
            }
        }
        return entries;
    }

    // size
    is_empty(): boolean {
        return this.#size.x == 0 || this.#size.y == 0;
    }
    get_size(): Vec2 {
        return this.#size.copy();
    }
    set_size(size: Vec2): void {
        if (size.x < 0 || !Number.isInteger(size.x) || size.y < 0|| !Number.isInteger(size.y)) {
            console.error("invalid input", size);
            return;
        }

        const grid = new Grid(this.#set_function, this.#default_constructor, size);
        for (let y = 0; y < size.y; ++y) {
            for (let x = 0; x < size.x; ++x) {
                if (this.in_bounds(new Vec2(x, y))) {
                    grid.set(this.get(new Vec2(x, y)), new Vec2(x, y));
                }
                else {
                    grid.set(this.#default_constructor(), new Vec2(x, y));
                }
            }
        }

        this.#data = grid.#data;
        this.#size = size;
    }

    // traversal
    every(cond: (tile: IEntry<T>) => boolean): boolean {
        for (let y = 0; y < this.#size.y; ++y) {
            for (let x = 0; x < this.#size.x; ++x) {
                const tile = new IEntry<T>(this.get(new Vec2(x, y)), new Vec2(x, y));
                if (!cond(tile)) {
                    return false;
                }
            }
        }
        return true;
    }
    hor_path_every(x1: number, x2: number, y: number, cond: (tile: IEntry<T>) => boolean): boolean {
        if (x2 < x1) {
            return this.hor_path_every(x2, x1, y, cond);
        }
        return this.every((tile: IEntry<T>) => {
            if (x1 <= tile.coords.x && tile.coords.x <= x2 && y == tile.coords.y) {
                return cond(tile);
            }
            return true;
        });
    }
    ver_path_every(y1: number, y2: number, x: number, cond: (tile: IEntry<T>) => boolean): boolean {
        if (y2 < y1) {
            return this.ver_path_every(y2, y1, x, cond);
        }
        return this.every((tile: IEntry<T>) => {
            if (y1 <= tile.coords.y && tile.coords.y <= y2 && x == tile.coords.x) {
                return cond(tile);
            }
            return true;
        });
    }
    row_every(where: number, cond: (entry: IEntry<T>) => boolean): boolean {
        return this.hor_path_every(0, this.#size.x - 1, where, cond);
    }
    column_every(where: number, cond: (entry: IEntry<T>) => boolean): boolean {
        return this.ver_path_every(0, this.#size.y - 1, where, cond);
    }
    is_hor_path_empty(x1: number, x2: number, y: number): boolean {
        return this.hor_path_every(x1, x2, y, (entry: IEntry<T>) => entry.tile.is_empty());
    }
    is_ver_path_empty(y1: number, y2: number, x: number): boolean {
        return this.ver_path_every(y1, y2, x, (entry: IEntry<T>) => entry.tile.is_empty());
    }
    is_row_empty(where: number): boolean {
        return this.is_hor_path_empty(0, this.#size.x - 1, where);
    }
    is_column_empty(where: number): boolean {
        return this.is_ver_path_empty(0, this.#size.y - 1, where);
    }

    // modify
    shrink_to_fit(): void {
        if (this.is_empty()) {
            return;
        }

        let min_x = this.#size.x;
        while (min_x > 0 && this.is_column_empty(min_x - 1)) {
            min_x--;
        }
        let min_y = this.#size.y;
        while (min_y > 0 && this.is_row_empty(min_y - 1)) {
            min_y--;
        }
        this.set_size(new Vec2(min_x, min_y));
    }

    // shift
    shift_up(where: number): void {
        for (let x = 0; x < this.#size.x; ++x) {
            for (let y = where; y < this.#size.y - 1; ++y) {
                this.set(this.get(new Vec2(x, y + 1)), new Vec2(x, y));
            }
        }
        for (let x = 0; x < this.#size.x; ++x) {
            this.remove(new Vec2(x, this.#size.y - 1));
        }
    }
    shift_down(where: number): void {
        for (let x = 0; x < this.#size.x; ++x) {
            for (let y = this.#size.y - 1; y > where; --y) {
                this.set(this.get(new Vec2(x, y - 1)), new Vec2(x, y));
            }
        }
        for (let x = 0; x < this.#size.x; ++x) {
            this.remove(new Vec2(x, where));
        }
    }
    shift_left(where: number): void {
        for (let y = 0; y < this.#size.y; ++y) {
            for (let x = where; x < this.#size.x - 1; ++x) {
                this.set(this.get(new Vec2(x + 1, y)), new Vec2(x, y));
            }
        }
        for (let y = 0; y < this.#size.y; ++y) {
            this.remove(new Vec2(this.#size.x - 1, y));
        }
    }
    shift_right(where: number): void {
        for (let y = 0; y < this.#size.y; ++y) {
            for (let x = this.#size.x - 1; x > where; --x) {
                this.set(this.get(new Vec2(x - 1, y)), new Vec2(x, y));
            }
        }
        for (let y = 0; y < this.#size.y; ++y) {
            this.remove(new Vec2(where, y));
        }
    }

    // insert / remove
    insert_row(where: number): void {
        this.set_size(this.#size.down());
        this.shift_down(where);
    }
    insert_column(where: number): void {
        this.set_size(this.#size.right());
        this.shift_right(where);
    }
    remove_row(where: number): void {
        this.shift_up(where);
        this.set_size(this.#size.up());
    }
    remove_column(where: number): void {
        this.shift_right(where);
        this.set_size(this.#size.left());
    }
}