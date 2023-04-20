import { Vec2, vec2_abs, vec2_add, vec2_div, vec2_sub } from "../../utils/vec2.js";
import { Bounds, HorBounds } from "../grid/bounds.js";
import { Entry, FlowGrid } from "../grid/flow_grid.js";
import { Grid, IEntry, ITile } from "../grid/grid.js";
import { Tile } from "../grid/tile.js";
import { get_tile_size } from "./get_tile_size.js";
import { get_node_size, get_sync_line_height } from "./html_size.js";

class MetricTile implements ITile {
    pos: Vec2;
    dim: Vec2;
    no_margin: Vec2;

    constructor(pos: Vec2 = new Vec2(0, 0), dim: Vec2 = new Vec2(0, 0), no_margin: Vec2 = new Vec2(0, 0)) {
        this.pos = pos;
        this.dim = dim;
        this.no_margin = no_margin;
    }

    is_empty(): boolean {
        return this.dim.x == 0 && this.dim.y == 0;
    }
    copy(): any {
        return new MetricTile(this.pos.copy(), this.dim.copy(), this.no_margin.copy());
    }

    top(): number {
        return this.pos.y - this.dim.y / 2;
    }
    right(): number {
        return this.pos.x + this.dim.x / 2;
    }
    bottom(): number {
        return this.pos.y + this.dim.y / 2;
    }
    left(): number {
        return this.pos.x - this.dim.x / 2;
    }
};

export class MetricGrid extends Grid<MetricTile> {
    constructor(flow_grid: FlowGrid) {
        super(() => {}, () => new MetricTile(), flow_grid.get_size());
        this.set_dim(flow_grid);
        this.set_pos_y(flow_grid);
        this.set_pos_x(flow_grid);
    }
    
    set_dim(flow_grid: FlowGrid): void {
        for (const [tile, coords] of flow_grid.get_entries()) {
            const entry = super.get_entry(coords);
            entry.tile.dim = get_tile_size(tile);
            entry.tile.no_margin = get_tile_size(tile, false);
            super.set_entry(entry);
        }
    }
    set_pos_x(flow_grid: FlowGrid): void {
        for (let y = 0; y  < flow_grid.get_size().y; ++y) {
            const entry = super.get_entry(new Vec2(0, y));
            entry.tile.pos.x = 0;
            super.set_entry(entry);
        }
        for (let x = 1; x < flow_grid.get_size().x; ++x) {
            while (true) {
                let has_changed = false;
                for (let y = 0; y  < flow_grid.get_size().y; ++y) {
                    const tile = flow_grid.get(new Vec2(x, y));
                    let max_x = super.get(new Vec2(x - 1, y)).right() + super.get(new Vec2(x, y)).dim.x / 2;
                    if (tile.node !== null) {
                        for (const sibling of [...tile.node.parents, ...tile.node.childs]) {
                            if (sibling.is_end()) {
                                continue;
                            }
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
        const start_entry = super.get_entry(new Vec2(0, 0));
        start_entry.tile.pos.x = this.get_grid_center().x;
        super.set_entry(start_entry);
        const last_step_entry = super.get_entry(new Vec2(0, flow_grid.get_size().y - 1));
        last_step_entry.tile.pos.x = start_entry.tile.pos.x;
        super.set_entry(last_step_entry);
        // const end_entry = super.get_entry(new Vec2(1, flow_grid.get_size().y - 1));
        // end_entry.tile.pos.x = last_step_entry.tile.pos.right().x + 60;
        // super.set_entry(end_entry);
    }
    set_pos_y(flow_grid: FlowGrid): void {
        for (let x = 0; x  < flow_grid.get_size().x; ++x) {
            const entry = super.get_entry(new Vec2(x, 0));
            entry.tile.pos.y = 0;
            super.set_entry(entry);
        }
        for (let y = 1; y < flow_grid.get_size().y; ++y) {
            while (true) {
                let has_changed = false;
                for (let x = 0; x  < flow_grid.get_size().x; ++x) {
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
                            if (sibling.is_end()) {
                                continue;
                            }
                            const coords = flow_grid.get_node_coords(sibling);
                            if (coords.y < y) {
                                max_y = Math.max(super.get(coords).bottom(), max_y);
                            }
                            else if (coords.y ==  y && coords.x < x) {
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
                    if (tile.sync_lines.top) {
                        if (tile.sync_lines.top != 'left' && 0 < x) {
                            max_y = Math.max(super.get(new Vec2(x - 1, y)).pos.y, max_y);
                        }
                        if (tile.sync_lines.top != 'right' && x < super.get_size().x - 1) {
                            max_y = Math.max(super.get(new Vec2(x + 1, y)).pos.y, max_y);
                        }
                    }
                    if (tile.sync_lines.bottom) {
                        if (tile.sync_lines.bottom != 'left' && 0 < x) {
                            max_y = Math.max(super.get(new Vec2(x - 1, y)).pos.y, max_y);
                        }
                        if (tile.sync_lines.bottom != 'right' && x < super.get_size().x - 1) {
                            max_y = Math.max(super.get(new Vec2(x + 1, y)).pos.y, max_y);
                        }
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
        const last_step_entry = super.get_entry(new Vec2(0, flow_grid.get_size().y - 1));
        last_step_entry.tile.pos.y = super.get_entry(new Vec2(0, flow_grid.get_size().y - 2)).tile.pos.y;
        last_step_entry.tile.pos.y += last_step_entry.tile.dim.y / 2;
        super.set_entry(last_step_entry);
    }

    get_grid_dim(): Vec2 {
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
    get_grid_center(): Vec2 {
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

    diff(coords1: Vec2, coords2: Vec2): Vec2 {
        return vec2_abs(vec2_sub(super.get(coords2).pos, super.get(coords1).pos));
    }
}