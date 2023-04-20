import { Vec2 } from "../../utils/vec2.js";
import { Graph } from "../graph/graph.js";
import { Node } from "../graph/node.js";
import { SyncLine } from "../graph/sync_line.js";
import { Bounds, HorBounds, VerBounds } from "./bounds.js";
import { Grid, IEntry, ITile } from "./grid.js";
import { Tile } from "./tile.js";

export type Entry = IEntry<Tile>;
export class FlowGrid extends Grid<Tile> {
    #node_map: Map<Node, Vec2>;

    constructor(graph: Graph) {
        const set_function = (tile: Tile, coords: Vec2, grid: FlowGrid) => {
            // node
            const old_node = grid.get(coords).node;
            if (old_node !== null) {
                grid.#node_map.delete(old_node);
            }
            if (tile.node !== null) {
                if (this.#node_map.has(tile.node)) {
                    const entry = this.get_node_entry(tile.node);
                    entry.tile.node = null;
                    grid.set_entry(entry);
                }
                this.#node_map.set(tile.node, coords);
            }
        };
        const default_constructor = () => new Tile();
        super(set_function, default_constructor, new Vec2(3, graph.max_depth() + 1));
        this.#node_map = new Map<Node, Vec2>();
    }

    // node
    has_node(node: Node): boolean {
        return this.#node_map.has(node);
    }
    get_node_coords(node: Node): Vec2 {
        return this.#node_map.get(node).copy();
    }
    get_node_tile(node: Node): Tile {
        return super.get(this.get_node_coords(node));
    }
    get_node_entry(node: Node): Entry {
        return super.get_entry(this.get_node_coords(node));
    }
    set_node(node: Node, coords: Vec2): void {
        const entry = super.get_entry(coords);
        entry.tile.node = node;
        super.set_entry(entry);
    }
    remove_node(node: Node): void {
        const entry = this.get_node_entry(node);
        entry.tile.node = null;
        super.set_entry(entry);
    }
    get_node_entries(): Set<[Node, Vec2]> {
        const entries = new Set<[Node, Vec2]>();
        for (const [node, coords] of this.#node_map) {
            entries.add([node, coords.copy()]);
        }
        return entries;
    }

    // bounds
    get_hor_bounds(cond: (node: Node) => boolean): HorBounds | null {
        const bounds = new HorBounds(Infinity, -Infinity);
        for (const [node, coords] of this.get_node_entries()) {
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
    get_ver_bounds(cond: (node: Node) => boolean): VerBounds | null {
        const bounds = new VerBounds(Infinity, -Infinity);
        for (const [node, coords] of this.get_node_entries()) {
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
    get_bounds(cond: (node: Node) => boolean): Bounds {
        return new Bounds(this.get_hor_bounds(cond), this.get_ver_bounds(cond));
    }

    // sync-lines
    get_sync_line_bounds(sync_line: SyncLine): Bounds {
        const member_bounds = this.get_bounds((node: Node) => sync_line.members.has(node));
        if (sync_line.where == 'top') {
            return new Bounds(new HorBounds(member_bounds.left, member_bounds.right), new VerBounds(member_bounds.top - 1));
        }
        else {
            return new Bounds(new HorBounds(member_bounds.left, member_bounds.right), new VerBounds(member_bounds.bottom + 1));
        }
    }
    set_sync_line(sync_line: SyncLine): void {
        const bounds = this.get_sync_line_bounds(sync_line);
        if (!this.is_hor_path_empty(bounds.left, bounds.right, bounds.top)) {
            if (sync_line.where == 'top') {
                bounds.top++;
                this.insert_row(bounds.top);
            }
            else {
                this.insert_row(bounds.top);
            }
        }

        const left_entry = this.get_entry(new Vec2(bounds.left, bounds.top));
        left_entry.tile.sync_lines[sync_line.where] = 'left';
        this.set_entry(left_entry);
        for (let x = bounds.left + 1; x < bounds.right; ++x) {
            const entry = this.get_entry(new Vec2(x, bounds.top));
            entry.tile.sync_lines[sync_line.where] = 'middle';
            this.set_entry(entry);
        }
        const right_entry = this.get_entry(new Vec2(bounds.right, bounds.top));
        right_entry.tile.sync_lines[sync_line.where] = 'right';
        this.set_entry(right_entry);
    }

    // lines
    get_node_in(node: Node, graph: Graph): Vec2 {
        const sync_line = graph.get_sync_line(node, 'top');
        if (sync_line !== null) {
            return this.get_sync_line_bounds(sync_line).center();
        }
        else {
            return this.get_node_coords(node);
        }
    }
    get_node_out(node: Node, graph: Graph): Vec2 {
        const sync_line = graph.get_sync_line(node, 'bottom');
        if (sync_line !== null) {
            return this.get_sync_line_bounds(sync_line).center();
        }
        else {
            return this.get_node_coords(node);
        }
    }

    // insert
    insert_row(where: number): void {
        super.insert_row(where);
        for (let x = 0; x < super.get_size().x; ++x) {
            const coords = new Vec2(x, where);
            
            const top = super.get(coords.up());
            const bottom = super.get(coords.down());

            if (bottom.lines.top) {
                const tile = new Tile();
                tile.lines.top = bottom.lines.top;
                tile.lines.bottom = bottom.lines.top == 'in' ? 'out' : 'in';
                super.set(tile, coords);
            }
            if (top.sync_lines.bottom) {
                super.set(top, coords);
                super.set(new Tile(), coords.up());
            }
            if (bottom.sync_lines.bottom) {
                super.set(bottom, coords);
                super.set(new Tile(), coords.down());
            }
        }
    }
    insert_column(where: number): void {
        super.insert_column(where);
        for (let y = 0; y < super.get_size().y; ++y) {
            const tile = super.get(new Vec2(where + 1, y));
            if (tile.lines.left) {
                const tile = new Tile();
                tile.lines.left = tile.lines.left;
                tile.lines.right = tile.lines.left == 'in' ? 'out' : 'in';
                super.set(tile, new Vec2(where, y));
            }
        }
    }
}