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
import { Lines, SyncLines } from "./tile.js";
import { Tile } from "./tile.js";
export class FlowGrid extends Grid {
    constructor(graph) {
        const set_function = (tile, coords, grid) => {
            const old_node = grid.get(coords).node;
            if (old_node) {
                __classPrivateFieldGet(grid, _FlowGrid_node_map, "f").delete(old_node);
            }
            if (tile.node) {
                if (__classPrivateFieldGet(this, _FlowGrid_node_map, "f").has(tile.node)) {
                    const entry = this.nodeEntry(tile.node);
                    entry.tile.node = null;
                    grid.setEntry(entry);
                }
                __classPrivateFieldGet(this, _FlowGrid_node_map, "f").set(tile.node, coords);
            }
        };
        const default_constructor = () => new Tile();
        super(set_function, default_constructor, new Vec2(3, graph.maxDepth + 1));
        // member
        _FlowGrid_node_map.set(this, void 0);
        __classPrivateFieldSet(this, _FlowGrid_node_map, new Map(), "f");
    }
    // node
    hasNode(node) {
        return __classPrivateFieldGet(this, _FlowGrid_node_map, "f").has(node);
    }
    nodeCoords(node) {
        return __classPrivateFieldGet(this, _FlowGrid_node_map, "f").get(node).clone();
    }
    nodeTile(node) {
        return super.get(this.nodeCoords(node));
    }
    nodeEntry(node) {
        return super.getEntry(this.nodeCoords(node));
    }
    setNode(node, coords) {
        const entry = super.getEntry(coords);
        entry.tile.node = node;
        super.setEntry(entry);
    }
    removeNode(node) {
        const entry = this.nodeEntry(node);
        entry.tile.node = null;
        super.setEntry(entry);
    }
    // iterate
    get nodeEntries() {
        const entries = new Set();
        for (const [node, coords] of __classPrivateFieldGet(this, _FlowGrid_node_map, "f")) {
            entries.add([node, coords.clone()]);
        }
        return entries;
    }
    // bounds
    horBounds(cond) {
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
    verBounds(cond) {
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
    bounds(cond) {
        return new Bounds(this.horBounds(cond), this.verBounds(cond));
    }
    // sync-lines
    synclineBounds(members, where) {
        const bounds = this.bounds((node) => members.has(node));
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
    addSyncline(members, where) {
        function create(pos) {
            if (where == 'top') {
                return new SyncLines(pos, null);
            }
            else if (where == 'bottom') {
                return new SyncLines(null, pos);
            }
        }
        const bounds = this.bounds((node) => members.has(node));
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
    setLine(dir, line, coords) {
        const entry = this.getEntry(coords);
        entry.tile.lines[dir] = line;
        this.setEntry(entry);
    }
    nodeIn(node) {
        if (node.hasTopSyncline) {
            const bounds = this.bounds((other) => node.topSyncline.has(other));
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
    nodeOut(node) {
        if (node.hasBottomSyncline) {
            const bounds = this.bounds((other) => node.bottomSyncline.has(other));
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
    addCookLine(coords) {
        const entry = this.getEntry(coords);
        entry.tile.cook_line = true;
        this.setEntry(entry);
    }
    // insert
    insertRow(where) {
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
    insertColumn(where) {
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
}
_FlowGrid_node_map = new WeakMap();
//# sourceMappingURL=flow_grid.js.map