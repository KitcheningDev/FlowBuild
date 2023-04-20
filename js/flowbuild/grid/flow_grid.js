var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _FlowGrid_node_map;
import { Vec2 } from "../../utils/vec2.js";
import { Bounds, HorBounds, VerBounds } from "./bounds.js";
import { Grid } from "./grid.js";
import { Tile } from "./tile.js";
export class FlowGrid extends Grid {
    constructor(graph) {
        const set_function = (tile, coords, grid) => {
            // node
            const old_node = grid.get(coords).node;
            if (old_node !== null) {
                __classPrivateFieldGet(grid, _FlowGrid_node_map, "f").delete(old_node);
            }
            if (tile.node !== null) {
                if (__classPrivateFieldGet(this, _FlowGrid_node_map, "f").has(tile.node)) {
                    const entry = this.get_node_entry(tile.node);
                    entry.tile.node = null;
                    grid.set_entry(entry);
                }
                __classPrivateFieldGet(this, _FlowGrid_node_map, "f").set(tile.node, coords);
            }
        };
        const default_constructor = () => new Tile();
        super(set_function, default_constructor, new Vec2(3, graph.max_depth() + 1));
        _FlowGrid_node_map.set(this, void 0);
        __classPrivateFieldSet(this, _FlowGrid_node_map, new Map(), "f");
    }
    // node
    has_node(node) {
        return __classPrivateFieldGet(this, _FlowGrid_node_map, "f").has(node);
    }
    get_node_coords(node) {
        return __classPrivateFieldGet(this, _FlowGrid_node_map, "f").get(node).copy();
    }
    get_node_tile(node) {
        return super.get(this.get_node_coords(node));
    }
    get_node_entry(node) {
        return super.get_entry(this.get_node_coords(node));
    }
    set_node(node, coords) {
        const entry = super.get_entry(coords);
        entry.tile.node = node;
        super.set_entry(entry);
    }
    remove_node(node) {
        const entry = this.get_node_entry(node);
        entry.tile.node = null;
        super.set_entry(entry);
    }
    get_node_entries() {
        const entries = new Set();
        for (const [node, coords] of __classPrivateFieldGet(this, _FlowGrid_node_map, "f")) {
            entries.add([node, coords.copy()]);
        }
        return entries;
    }
    // bounds
    get_hor_bounds(cond) {
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
    get_ver_bounds(cond) {
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
    get_bounds(cond) {
        return new Bounds(this.get_hor_bounds(cond), this.get_ver_bounds(cond));
    }
    // sync-lines
    get_sync_line_bounds(sync_line) {
        const member_bounds = this.get_bounds((node) => sync_line.members.has(node));
        if (sync_line.where == 'top') {
            return new Bounds(new HorBounds(member_bounds.left, member_bounds.right), new VerBounds(member_bounds.top - 1));
        }
        else {
            return new Bounds(new HorBounds(member_bounds.left, member_bounds.right), new VerBounds(member_bounds.bottom + 1));
        }
    }
    set_sync_line(sync_line) {
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
    get_node_in(node, graph) {
        const sync_line = graph.get_sync_line(node, 'top');
        if (sync_line !== null) {
            return this.get_sync_line_bounds(sync_line).center();
        }
        else {
            return this.get_node_coords(node);
        }
    }
    get_node_out(node, graph) {
        const sync_line = graph.get_sync_line(node, 'bottom');
        if (sync_line !== null) {
            return this.get_sync_line_bounds(sync_line).center();
        }
        else {
            return this.get_node_coords(node);
        }
    }
    // insert
    insert_row(where) {
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
    insert_column(where) {
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
_FlowGrid_node_map = new WeakMap();
//# sourceMappingURL=flow_grid.js.map