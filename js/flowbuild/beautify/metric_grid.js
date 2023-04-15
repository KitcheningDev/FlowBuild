import { Vec2, vec2_add } from "../../utils/vec2.js";
import { Grid } from "../grid/grid.js";
import { get_node_size, get_sync_line_height } from "../position/html_size.js";
export function get_tile_size(tile, margin = true) {
    let size = new Vec2(0, 0);
    if (tile.node !== null && !tile.node.task.is_empty()) {
        size = get_node_size(tile.node);
        if (margin) {
            size = vec2_add(new Vec2(20, 15), size);
        }
    }
    else if (tile.sync_lines.top || tile.sync_lines.bottom) {
        size = new Vec2(0, get_sync_line_height());
        if (margin) {
            size = vec2_add(new Vec2(0, 20), size);
        }
    }
    else if (tile.cook_line) {
        if (margin) {
            size = new Vec2(10, 0);
        }
    }
    else if (tile.lines.has_connector()) {
        size = new Vec2(12, 12);
        if (margin) {
            size = vec2_add(new Vec2(10, 10), size);
        }
    }
    return size;
}
class MetricTile {
    constructor(dim = new Vec2(0, 0)) {
        this.dim = dim;
    }
    is_empty() {
        return this.dim.x == 0 && this.dim.y == 0;
    }
    copy() {
        return new MetricTile(this.dim.copy());
    }
}
;
export class MetricGrid extends Grid {
    constructor(flow_grid) {
        super(() => { }, () => new MetricTile(), flow_grid.get_size());
        for (const [tile, coords] of flow_grid.get_entries()) {
            this.set_flow_entry(tile, coords);
        }
    }
    set_flow_entry(tile, coords) {
        super.set(new MetricTile(get_tile_size(tile)), coords);
    }
    // max entry
    get_max_x_entry(x = null) {
        let entry = null;
        if (x === null) {
            for (let y = 0; y < this.get_size().y; ++y) {
                for (let x = 0; x < this.get_size().x; ++x) {
                    if (entry === null || entry.tile.dim.x < this.get(new Vec2(x, y)).dim.x) {
                        entry = this.get_entry(new Vec2(x, y));
                    }
                }
            }
        }
        else {
            for (let y = 0; y < this.get_size().y; ++y) {
                if (entry === null || entry.tile.dim.x < this.get(new Vec2(x, y)).dim.x) {
                    entry = this.get_entry(new Vec2(x, y));
                }
            }
        }
        return entry;
    }
    get_max_y_entry(y = null) {
        let entry = null;
        if (y === null) {
            for (let y = 0; y < this.get_size().y; ++y) {
                for (let x = 0; x < this.get_size().x; ++x) {
                    if (entry === null || entry.tile.dim.y < this.get(new Vec2(x, y)).dim.y) {
                        entry = this.get_entry(new Vec2(x, y));
                    }
                }
            }
        }
        else {
            for (let x = 0; x < this.get_size().x; ++x) {
                if (entry === null || entry.tile.dim.y < this.get(new Vec2(x, y)).dim.y) {
                    entry = this.get_entry(new Vec2(x, y));
                }
            }
        }
        return entry;
    }
    // pos
    get_tile_pos_x(x) {
        let dist = 0;
        for (let curr_x = 0; curr_x < x; ++curr_x) {
            dist += this.get_tile_dim_x(curr_x);
        }
        dist += this.get_tile_dim_x(x) / 2;
        return dist;
    }
    get_tile_pos_y(y) {
        let dist = 0;
        for (let curr_y = 0; curr_y < y; ++curr_y) {
            dist += this.get_tile_dim_y(curr_y);
        }
        dist += this.get_tile_dim_y(y) / 2;
        return dist;
    }
    get_tile_pos(coords) {
        return new Vec2(this.get_tile_pos_x(coords.x), this.get_tile_pos_y(coords.y));
    }
    // dim
    get_tile_dim_x(x) {
        return this.get_max_x_entry(x).tile.dim.x;
    }
    get_tile_dim_y(y) {
        return this.get_max_y_entry(y).tile.dim.y;
    }
    get_tile_dim(coords) {
        return new Vec2(this.get_tile_dim_x(coords.x), this.get_tile_dim_y(coords.y));
    }
    // dist
    get_tile_dist_x(x1, x2) {
        if (x1 == x2) {
            return 0;
        }
        else if (x2 < x1) {
            return this.get_tile_dist_x(x2, x1);
        }
        let dist = 0;
        dist += this.get_tile_dim_x(x1) / 2;
        for (let x = x1 + 1; x < x2; ++x) {
            dist += this.get_tile_dim_x(x);
        }
        dist += this.get_tile_dim_x(x2) / 2;
        return dist;
    }
    get_tile_dist_y(y1, y2) {
        if (y1 == y2) {
            return 0;
        }
        else if (y2 < y1) {
            return this.get_tile_dist_y(y2, y1);
        }
        let dist = 0;
        dist += this.get_tile_dim_y(y1) / 2;
        for (let y = y1 + 1; y < y2; ++y) {
            dist += this.get_tile_dim_y(y);
        }
        dist += this.get_tile_dim_y(y2) / 2;
        return dist;
    }
    get_tile_dist(coords1, coords2) {
        return new Vec2(this.get_tile_dist_x(coords1.x, coords2.x), this.get_tile_dist_y(coords1.y, coords2.y));
    }
    // grid dim
    get_grid_dim() {
        let dim = new Vec2(0, 0);
        for (let x = 0; x < super.get_size().x; ++x) {
            dim.x += this.get_tile_dim_x(x);
        }
        for (let y = 0; y < super.get_size().y; ++y) {
            dim.y += this.get_tile_dim_y(y);
        }
        return dim;
    }
    // reduce
    reduce_x() {
        const entries = [];
        for (let x = 1; x < super.get_size().x - 1; ++x) {
            const entry = this.get_max_x_entry(x);
            if (0 < entry.tile.dim.x) {
                entries.push(entry);
            }
        }
        entries.sort((a, b) => b.tile.dim.x - a.tile.dim.x);
        for (const entry of entries) {
            if (super.get(entry.coords.left()).is_empty() && super.get(entry.coords.right()).is_empty()) {
                if (entry.tile.dim.x / 2 < this.get_tile_dim_x(entry.coords.x - 1) && entry.tile.dim.x / 2 < this.get_tile_dim_x(entry.coords.x + 1)) {
                    entry.tile.dim.x = 0;
                    super.set_entry(entry);
                    return this.reduce_x();
                }
            }
        }
    }
}
//# sourceMappingURL=metric_grid.js.map