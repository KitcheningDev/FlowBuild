import { Vec2 } from "../../utils/vec2.js";

export interface ITile {
    isEmpty: () => boolean;
    clone: () => any;
}
export class IEntry<T extends ITile> {
    constructor(tile: T, coords: Vec2) {
        this.tile = tile;
        this.coords = coords;
    }
    // member
    tile: T;
    coords: Vec2;
}
export class Grid<T extends ITile> {
    constructor(set_function: (val: T, coords: Vec2, grid: Grid<T>) => void, default_constructor: () => T, size: Vec2 = new Vec2(0, 0)) {
        this.#set_function = set_function;
        this.#default_constructor = default_constructor;
        this.#size = size;
        this.clear();
    }
    // access
    inBounds(coords: Vec2): boolean {
        return 0 <= coords.x && coords.x < this.#size.x && 0 <= coords.y && coords.y < this.#size.y;
    }
    get(coords: Vec2): T {
        if (this.inBounds(coords)) {
            return this.#data[this.#size.x * coords.y + coords.x].clone() as unknown as T;
        }
        console.error("INVALID INPUT", coords);
    }
    set(val: T, coords: Vec2): void {
        if (this.inBounds(coords)) {
            this.#set_function(val, coords.clone(), this);
            this.#data[this.#size.x * coords.y + coords.x] = val.clone() as unknown as T;
        }
        else {
            console.error("INVALID INPUT", coords);
        }
    }
    getEntry(coords: Vec2): IEntry<T> {
        return new IEntry<T>(this.get(coords).clone(), coords.clone());
    }
    setEntry(entry: IEntry<T>): void {
        this.set(entry.tile, entry.coords);
    }
    remove(coords: Vec2): void {
        this.set(this.#default_constructor(), coords);
    }
    clear(): void {
        this.#data = [];
        for (let i = 0; i < this.size.x * this.size.y; ++i) {
            this.#data.push(this.#default_constructor());
        }
    }
    // iterate
    get entries(): Set<[T, Vec2]> {
        const entries = new Set<[T, Vec2]>;
        for (let y = 0; y < this.#size.y; ++y) {
            for (let x = 0; x < this.#size.x; ++x) {
                entries.add([this.get(new Vec2(x, y)), new Vec2(x, y)]);
            }
        }
        return entries;
    }
    get tiles(): IterableIterator<T> {
        return this.#data.values();
    }
    // size
    isEmpty(): boolean {
        return this.#size.x == 0 || this.#size.y == 0;
    }
    get size(): Vec2 {
        return this.#size.clone();
    }
    setSize(size: Vec2): void {
        if (size.x < 0 || !Number.isInteger(size.x) || size.y < 0|| !Number.isInteger(size.y)) {
            console.error("INVALID INPUT", size);
            return;
        }

        const grid = new Grid(this.#set_function, this.#default_constructor, size);
        for (let y = 0; y < size.y; ++y) {
            for (let x = 0; x < size.x; ++x) {
                if (this.inBounds(new Vec2(x, y))) {
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
    shrinkToFit(): void {
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
    horEvery(x1: number, x2: number, y: number, cond: (tile: IEntry<T>) => boolean): boolean {
        if (x2 < x1) {
            return this.horEvery(x2, x1, y, cond);
        }
        return this.every((tile: IEntry<T>) => {
            if (x1 <= tile.coords.x && tile.coords.x <= x2 && y == tile.coords.y) {
                return cond(tile);
            }
            return true;
        });
    }
    verEvery(y1: number, y2: number, x: number, cond: (tile: IEntry<T>) => boolean): boolean {
        if (y2 < y1) {
            return this.verEvery(y2, y1, x, cond);
        }
        return this.every((tile: IEntry<T>) => {
            if (y1 <= tile.coords.y && tile.coords.y <= y2 && x == tile.coords.x) {
                return cond(tile);
            }
            return true;
        });
    }
    rowEvery(where: number, cond: (entry: IEntry<T>) => boolean): boolean {
        return this.horEvery(0, this.#size.x - 1, where, cond);
    }
    columnEvery(where: number, cond: (entry: IEntry<T>) => boolean): boolean {
        return this.verEvery(0, this.#size.y - 1, where, cond);
    }
    isHorEmpty(x1: number, x2: number, y: number): boolean {
        return this.horEvery(x1, x2, y, (entry: IEntry<T>) => entry.tile.isEmpty());
    }
    isVerEmpty(y1: number, y2: number, x: number): boolean {
        return this.verEvery(y1, y2, x, (entry: IEntry<T>) => entry.tile.isEmpty());
    }
    isRowEmpty(where: number): boolean {
        return this.isHorEmpty(0, this.#size.x - 1, where);
    }
    isColumnEmpty(where: number): boolean {
        return this.isVerEmpty(0, this.#size.y - 1, where);
    }
    // shift
    shiftUp(where: number): void {
        for (let x = 0; x < this.#size.x; ++x) {
            for (let y = where; y < this.#size.y - 1; ++y) {
                this.set(this.get(new Vec2(x, y + 1)), new Vec2(x, y));
            }
        }
        for (let x = 0; x < this.#size.x; ++x) {
            this.remove(new Vec2(x, this.#size.y - 1));
        }
    }
    shiftDown(where: number): void {
        for (let x = 0; x < this.#size.x; ++x) {
            for (let y = this.#size.y - 1; y > where; --y) {
                this.set(this.get(new Vec2(x, y - 1)), new Vec2(x, y));
            }
        }
        for (let x = 0; x < this.#size.x; ++x) {
            this.remove(new Vec2(x, where));
        }
    }
    shiftLeft(where: number): void {
        for (let y = 0; y < this.#size.y; ++y) {
            for (let x = where; x < this.#size.x - 1; ++x) {
                this.set(this.get(new Vec2(x + 1, y)), new Vec2(x, y));
            }
        }
        for (let y = 0; y < this.#size.y; ++y) {
            this.remove(new Vec2(this.#size.x - 1, y));
        }
    }
    shiftRight(where: number): void {
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
    insertRow(where: number): void {
        this.setSize(this.#size.down());
        this.shiftDown(where);
    }
    insertColumn(where: number): void {
        this.setSize(this.#size.right());
        this.shiftRight(where);
    }
    removeRow(where: number): void {
        this.shiftUp(where);
        this.setSize(this.#size.up());
    }
    removeColumn(where: number): void {
        this.shiftLeft(where);
        this.setSize(this.#size.left());
    }
    // member
    #set_function: (val: T, coords: Vec2, grid: Grid<T>) => void;
    #default_constructor: () => T;
    #data: T[];
    #size: Vec2;
}