import { Vec2, vec2_abs, vec2_div, vec2_sub } from "../../utils/vec2.js";
import { Grid } from "../grid/grid.js";
import { get_tile_size } from "./get_tile_size.js";
class MetricTile {
    constructor(pos = new Vec2(0, 0), dim = new Vec2(0, 0), no_margin = new Vec2(0, 0)) {
        this.pos = pos;
        this.dim = dim;
        this.no_margin = no_margin;
    }
    is_empty() {
        return this.dim.x == 0 && this.dim.y == 0;
    }
    copy() {
        return new MetricTile(this.pos.copy(), this.dim.copy(), this.no_margin.copy());
    }
    top() {
        return this.pos.y - this.dim.y / 2;
    }
    right() {
        return this.pos.x + this.dim.x / 2;
    }
    bottom() {
        return this.pos.y + this.dim.y / 2;
    }
    left() {
        return this.pos.x - this.dim.x / 2;
    }
}
;
export class MetricGrid extends Grid {
    constructor(flow_grid) {
        super(() => { }, () => new MetricTile(), flow_grid.get_size());
        this.set_dim(flow_grid);
        this.set_pos_y(flow_grid);
        this.set_pos_x(flow_grid);
    }
    set_dim(flow_grid) {
        for (const [tile, coords] of flow_grid.get_entries()) {
            const entry = super.get_entry(coords);
            entry.tile.dim = get_tile_size(tile);
            entry.tile.no_margin = get_tile_size(tile, false);
            super.set_entry(entry);
        }
    }
    set_pos_x(flow_grid) {
        for (let y = 0; y < flow_grid.get_size().y; ++y) {
            const entry = super.get_entry(new Vec2(0, y));
            entry.tile.pos.x = 0;
            super.set_entry(entry);
        }
        for (let x = 1; x < flow_grid.get_size().x; ++x) {
            while (true) {
                let has_changed = false;
                for (let y = 0; y < flow_grid.get_size().y; ++y) {
                    const tile = flow_grid.get(new Vec2(x, y));
                    let max_x = super.get(new Vec2(x - 1, y)).right() + super.get(new Vec2(x, y)).dim.x / 2;
                    if (tile.node !== null) {
                        for (const sibling of [...tile.node.parents, ...tile.node.childs]) {
                            const coords = flow_grid.get_node_coords(sibling);
                            if (coords.x < x) {
                                max_x = Math.max(super.get(coords).right(), max_x);
                            }
                            else if (coords.x == x) {
                                max_x = Math.max(super.get(coords).pos.x, max_x);
                            }
                        }
                    }
                    if (tile.lines.top != null) {
                        max_x = Math.max(super.get(new Vec2(x, y - 1)).pos.x, max_x);
                    }
                    if (tile.lines.bottom != null) {
                        max_x = Math.max(super.get(new Vec2(x, y + 1)).pos.x, max_x);
                    }
                    if (tile.sync_lines.top !== null) {
                        max_x = Math.max(super.get(new Vec2(x, y + 1)).pos.x, max_x);
                    }
                    if (tile.sync_lines.bottom !== null) {
                        max_x = Math.max(super.get(new Vec2(x, y - 1)).pos.x, max_x);
                    }
                    if (tile.cook_line) {
                        max_x = Math.max(super.get(new Vec2(x, y - 1)).pos.x, max_x);
                        max_x = Math.max(super.get(new Vec2(x, y + 1)).pos.x, max_x);
                    }
                    const entry = super.get_entry(new Vec2(x, y));
                    if (entry.tile.pos.x < max_x) {
                        has_changed = true;
                        entry.tile.pos.x = max_x;
                    }
                    super.set_entry(entry);
                }
                if (!has_changed) {
                    break;
                }
            }
        }
    }
    set_pos_y(flow_grid) {
        for (let x = 0; x < flow_grid.get_size().x; ++x) {
            const entry = super.get_entry(new Vec2(x, 0));
            entry.tile.pos.y = 0;
            super.set_entry(entry);
        }
        for (let y = 1; y < flow_grid.get_size().y; ++y) {
            while (true) {
                let has_changed = false;
                for (let x = 0; x < flow_grid.get_size().x; ++x) {
                    const tile = flow_grid.get(new Vec2(x, y));
                    const entry = super.get_entry(new Vec2(x, y));
                    let max_y = 0;
                    for (let index = 0; index < flow_grid.get_size().x; ++index) {
                        const index_tile = super.get(new Vec2(index, y - 1));
                        if (entry.tile.left() <= index_tile.right() && index_tile.left() <= entry.tile.right()) {
                            max_y = Math.max(index_tile.bottom(), max_y);
                        }
                    }
                    max_y += super.get(new Vec2(x, y)).dim.y / 2;
                    if (tile.node !== null) {
                        for (const sibling of [...tile.node.parents, ...tile.node.childs]) {
                            const coords = flow_grid.get_node_coords(sibling);
                            if (coords.y < y) {
                                max_y = Math.max(super.get(coords).bottom(), max_y);
                            }
                            else if (coords.y == y && coords.x < x) {
                                max_y = Math.max(super.get(coords).pos.y, max_y);
                            }
                        }
                    }
                    if (tile.lines.left !== null) {
                        max_y = Math.max(super.get(new Vec2(x - 1, y)).pos.y, max_y);
                    }
                    if (tile.lines.right !== null) {
                        max_y = Math.max(super.get(new Vec2(x + 1, y)).pos.y, max_y);
                    }
                    if (entry.tile.pos.y < max_y) {
                        entry.tile.pos.y = max_y;
                        has_changed = true;
                    }
                    super.set_entry(entry);
                }
                if (!has_changed) {
                    break;
                }
            }
        }
    }
    get_grid_dim() {
        let max_x = -Infinity;
        let min_x = Infinity;
        let max_y = -Infinity;
        let min_y = Infinity;
        for (let y = 0; y < super.get_size().y; ++y) {
            max_x = Math.max(super.get(new Vec2(super.get_size().x - 1, y)).right(), max_x);
            min_x = Math.min(super.get(new Vec2(0, y)).left(), min_x);
        }
        for (let x = 0; x < super.get_size().x; ++x) {
            max_y = Math.max(super.get(new Vec2(x, super.get_size().y - 1)).bottom(), max_y);
            min_y = Math.min(super.get(new Vec2(x, 0)).top(), min_y);
        }
        return new Vec2(max_x - min_x, max_y - min_y);
    }
    get_grid_center() {
        let max_x = -Infinity;
        let min_x = Infinity;
        let max_y = -Infinity;
        let min_y = Infinity;
        for (let y = 0; y < super.get_size().y; ++y) {
            max_x = Math.max(super.get(new Vec2(super.get_size().x - 1, y)).right(), max_x);
            min_x = Math.min(super.get(new Vec2(0, y)).left(), min_x);
        }
        for (let x = 0; x < super.get_size().x; ++x) {
            max_y = Math.max(super.get(new Vec2(x, super.get_size().y - 1)).bottom(), max_y);
            min_y = Math.min(super.get(new Vec2(x, 0)).top(), min_y);
        }
        return vec2_div(new Vec2(max_x + min_x, max_y + min_y), 2);
    }
    diff(coords1, coords2) {
        return vec2_abs(vec2_sub(super.get(coords2).pos, super.get(coords1).pos));
    }
}
//# sourceMappingURL=metric_grid.js.map