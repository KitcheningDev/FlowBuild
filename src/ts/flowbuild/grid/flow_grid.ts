import { sample } from "../../utils/set.js";
import { Vec2 } from "../../utils/vec2.js";
import { Graph } from "../graph/graph.js";
import { Node } from "../graph/node.js";
import { Bounds, HorBounds, VerBounds } from "./bounds.js";
import { Grid, IEntry } from "./grid.js";
import { Line, LineDir, Lines, SyncLines } from "./tile.js";
import { Tile } from "./tile.js";

export type Entry = IEntry<Tile>;
export class FlowGrid extends Grid<Tile> {
    constructor(graph: Graph) {
        const set_function = (tile: Tile, coords: Vec2, grid: FlowGrid) => {
            const old_node = grid.get(coords).node;
            if (old_node) {
                grid.#node_map.delete(old_node);
            }
            if (tile.node) {
                if (this.#node_map.has(tile.node)) {
                    const entry = this.nodeEntry(tile.node);
                    entry.tile.node = null;
                    grid.setEntry(entry);
                }
                this.#node_map.set(tile.node, coords);
            }
        };
        const default_constructor = () => new Tile();
        super(set_function, default_constructor, new Vec2(3, graph.maxDepth + 1));
        this.#node_map = new Map<Node, Vec2>();
    }
    // node
    hasNode(node: Node): boolean {
        return this.#node_map.has(node);
    }
    nodeCoords(node: Node): Vec2 {
        return this.#node_map.get(node).clone();
    }
    nodeTile(node: Node): Tile {
        return super.get(this.nodeCoords(node));
    }
    nodeEntry(node: Node): Entry {
        return super.getEntry(this.nodeCoords(node));
    }
    setNode(node: Node, coords: Vec2): void {
        const entry = super.getEntry(coords);
        entry.tile.node = node;
        super.setEntry(entry);
    }
    removeNode(node: Node): void {
        const entry = this.nodeEntry(node);
        entry.tile.node = null;
        super.setEntry(entry);
    }
    // iterate
    get nodeEntries(): Set<[Node, Vec2]> {
        const entries = new Set<[Node, Vec2]>();
        for (const [node, coords] of this.#node_map) {
            entries.add([node, coords.clone()]);
        }
        return entries;
    }
    // bounds
    horBounds(cond: (node: Node) => boolean): HorBounds | null {
        const bounds = new HorBounds(Infinity, -Infinity);
        for (const [node, coords] of this.nodeEntries) {
            if (cond(node)) {
                if (coords.x < bounds.left) {
                    bounds.left = coords.x;
                    bounds.left_node = node;
                }
                if (bounds.right < coords.x) {
                    bounds.right = coords.x;
                    bounds.right_node = node;
                }
            }
        }
        if (bounds.left == Infinity && bounds.right == -Infinity) {
            return null;
        }
        else {
            return bounds;
        }
    }
    verBounds(cond: (node: Node) => boolean): VerBounds | null {
        const bounds = new VerBounds(Infinity, -Infinity);
        for (const [node, coords] of this.nodeEntries) {
            if (cond(node)) {
                if (coords.y < bounds.top) {
                    bounds.top = coords.y;
                    bounds.top_node = node;
                }
                if (bounds.bottom < coords.y) {
                    bounds.bottom = coords.y;
                    bounds.bottom_node = node;
                }
            }
        }
        if (bounds.top == Infinity && bounds.bottom == -Infinity) {
            return null;
        }
        else {
            return bounds;
        }
    }
    bounds(cond: (node: Node) => boolean): Bounds {
        return new Bounds(this.horBounds(cond), this.verBounds(cond));
    }

    // sync-lines
    synclineBounds(members: Set<Node>, where: 'top' | 'bottom'): Bounds {
        const bounds = this.bounds((node: Node) => members.has(node));
        let y = NaN;
        if (where == 'top') {
            y = bounds.top - 1;
        }
        else if (where == 'bottom') {
            y = bounds.bottom + 1;
        }
        bounds.top = y;
        bounds.bottom = y;
        return bounds;
    }
    addSyncline(members: Set<Node>, where: 'top' | 'bottom'): void {
        function create(pos: 'left' | 'middle' | 'right'): SyncLines {
            if (where == 'top') {
                return new SyncLines(pos, null);
            }
            else if (where == 'bottom') {
                return new SyncLines(null, pos);
            }
        }
        const bounds = this.bounds((node: Node) => members.has(node));
        let y = NaN;
        if (where == 'top') {
            y = bounds.top;
        }
        else if (where == 'bottom') {
            y = bounds.bottom + 1;
        }
        this.insertRow(y);
        if (bounds.left == bounds.right) {
            this.set(new Tile(null, new Lines(), create('left'), false), new Vec2(bounds.left - 1, y));
            this.set(new Tile(null, new Lines(), create('middle'), false), new Vec2(bounds.center.x, y));
            this.set(new Tile(null, new Lines(), create('right'), false), new Vec2(bounds.right + 1, y));
        }
        else {
            for (let x = bounds.left + 1; x < bounds.right; ++x) {
                this.set(new Tile(null, new Lines(), create('middle'), false), new Vec2(x, y));
            }
            this.set(new Tile(null, new Lines(), create('left'), false), new Vec2(bounds.left, y));
            this.set(new Tile(null, new Lines(), create('right'), false), new Vec2(bounds.right, y));    
        }
    }
    // get_sync_line_bounds(sync_line: SyncLine): Bounds {
    //     const member_bounds = this.bounds((node: Node) => sync_line.members.has(node));
    //     if (sync_line.where == 'top') {
    //         return new Bounds(new HorBounds(member_bounds.left, member_bounds.right), new VerBounds(member_bounds.top - 1));
    //     }
    //     else {
    //         return new Bounds(new HorBounds(member_bounds.left, member_bounds.right), new VerBounds(member_bounds.bottom + 1));
    //     }
    // }
    // set_sync_line(sync_line: SyncLine): void {
    //     const bounds = this.get_sync_line_bounds(sync_line);
    //     if (!this.is_hor_path_empty(bounds.left, bounds.right, bounds.top)) {
    //         if (sync_line.where == 'top') {
    //             bounds.top++;
    //             this.insert_row(bounds.top);
    //         }
    //         else {
    //             this.insert_row(bounds.top);
    //         }
    //     }

    //     const left_entry = this.get_entry(new Vec2(bounds.left, bounds.top));
    //     left_entry.tile.sync_lines[sync_line.where] = 'left';
    //     this.set_entry(left_entry);
    //     for (let x = bounds.left + 1; x < bounds.right; ++x) {
    //         const entry = this.get_entry(new Vec2(x, bounds.top));
    //         entry.tile.sync_lines[sync_line.where] = 'middle';
    //         this.set_entry(entry);
    //     }
    //     const right_entry = this.get_entry(new Vec2(bounds.right, bounds.top));
    //     right_entry.tile.sync_lines[sync_line.where] = 'right';
    //     this.set_entry(right_entry);
    // }
    // lines
    setLine(dir: LineDir, line: Line, coords: Vec2): void {
        const entry = this.getEntry(coords);
        entry.tile.lines[dir] = line;
        this.setEntry(entry);
    }
    nodeIn(node: Node): Vec2 {
        if (node.hasTopSyncline) {
            const bounds = this.bounds((other: Node) => node.topSyncline.has(other));
            let coords = new Vec2(bounds.center.x, bounds.top);
            while (this.get(coords).sync_lines.isEmpty()) {
                coords = coords.up();
            }
            return coords;
        }
        else {
            return this.nodeCoords(node);
        }
    }
    nodeOut(node: Node): Vec2 {
        if (node.hasBottomSyncline) {
            const bounds = this.bounds((other: Node) => node.bottomSyncline.has(other));
            let coords = new Vec2(bounds.center.x, bounds.bottom);
            while (this.get(coords).sync_lines.isEmpty()) {
                coords = coords.down();
            }
            return coords;
        }
        else {
            return this.nodeCoords(node);
        }
    }
    // cook line
    addCookLine(coords: Vec2): void {
        const entry = this.getEntry(coords);
        entry.tile.cook_line = true;
        this.setEntry(entry);
    }
    // insert
    insertRow(where: number): void {
        super.insertRow(where);
        for (let x = 0; x < super.size.x; ++x) {
            const tile = super.get(new Vec2(x, where));
            if (where + 1 < super.size.y) {
                const bottom = super.get(new Vec2(x, where).down());
                // line
                if (bottom.lines.top) {
                    tile.lines.bottom = bottom.lines.top == 'in' ? 'out' : 'in';
                }
                // cook line
                if (bottom.cook_line) {
                    tile.cook_line = true;
                }
            }
            if (0 < where) {
                const top = super.get(new Vec2(x, where).up());
                // line
                if (top.lines.bottom) {
                    tile.lines.top = top.lines.bottom == 'in' ? 'out' : 'in';
                }
                // cook line
                if (top.cook_line) {
                    tile.cook_line = true;
                }                
            }
            super.set(tile, new Vec2(x, where));
        }
    }
    insertColumn(where: number): void {
        super.insertColumn(where);
        for (let y = 0; y < super.size.y; ++y) {
            const tile = super.get(new Vec2(where, y));
            if (where + 1 < super.size.x) {
                const right = super.get(new Vec2(where, y).right());
                // line
                if (right.lines.left) {
                    tile.lines.right = right.lines.left == 'in' ? 'out' : 'in';
                }
            }
            if (0 < where) {
                const left = super.get(new Vec2(where, y).left());
                // line
                if (left.lines.right) {
                    tile.lines.left = left.lines.right == 'in' ? 'out' : 'in';
                }
            }
            super.set(tile, new Vec2(where, y));
        }
    }
    // member
    #node_map: Map<Node, Vec2>;
}