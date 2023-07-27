import { sample, setEqual } from "../../utils/set.js";
import { Vec2, vec2Abs, vec2Sub } from "../../utils/vec2.js";
import { createCenterOrder } from "../collapse/post_process/center.js";
import { depth } from "../graph/depth_map.js";
import { Graph } from "../graph/graph.js";
import { Node } from "../graph/node.js";
import { Bounds, HorBounds, VerBounds } from "../grid/bounds.js";
import { Entry, FlowGrid } from "../grid/flow_grid.js";
import { Grid } from "../grid/grid.js";
import { log_metric_grid } from "../log.js";
import { createMetricTile } from "./html_size.js";
import { MetricTile } from "./metric_tile.js";

export class MetricGrid extends Grid<MetricTile> {
    constructor(flow_grid: FlowGrid, graph: Graph) {
        super(() => {}, () => new MetricTile(), flow_grid.size);
        for (const [tile, coords] of flow_grid.entries) {
            this.set(createMetricTile(tile), coords);
        }

        // naive
        // for (let y = 0; y < flow_grid.size.y; ++y) {
        //     let maxy = 0;
        //     for (let x = 0; x < flow_grid.size.x; ++x) {
        //         maxy = Math.max(this.get(new Vec2(x, y)).height, maxy);
        //     }
        //     const posy = (0 < y ? this.get(new Vec2(0, y).up()).bottom : 0) + maxy / 2;
        //     for (let x = 0; x < flow_grid.size.x; ++x) {
        //         const entry = this.getEntry(new Vec2(x, y));
        //         entry.tile.pos.y = posy;
        //         entry.tile.dim.y = maxy;
        //         this.setEntry(entry);
        //     }
        // }
        // for (let x = 0; x < flow_grid.size.x; ++x) {
        //     let maxx = 0;
        //     for (let y = 0; y < flow_grid.size.y; ++y) {
        //         maxx = Math.max(this.get(new Vec2(x, y)).width, maxx);
        //     }
        //     const posx = (0 < x ? this.get(new Vec2(x, 0).left()).right : 0) + maxx / 2;
        //     for (let y = 0; y < flow_grid.size.y; ++y) {
        //         const entry = this.getEntry(new Vec2(x, y));
        //         entry.tile.pos.x = posx;
        //         entry.tile.dim.x = maxx;
        //         this.setEntry(entry);
        //     }
        // }
        this.setPosX(flow_grid);
        for (const [node, relatives] of createCenterOrder(flow_grid, graph)) {
            const bounds = flow_grid.bounds((node: Node) => relatives.has(node));
            let entry = null;
            if (node.isStart() || setEqual(node.childs, relatives)) {
                entry = this.getEntry(flow_grid.nodeIn(sample(relatives)).up());
            }
            else {
                entry = this.getEntry(flow_grid.nodeOut(sample(relatives)).down());
            }
            const left = this.get(flow_grid.nodeCoords(bounds.left_node)).left;
            const right = this.get(flow_grid.nodeCoords(bounds.right_node)).right;
            // console.log(node.task.description, (left + right) / 2);
            entry.tile.pos.x = Math.max((left + right) / 2, entry.tile.pos.x);
            this.setEntry(entry);
            this.setPosX(flow_grid);
        }
        this.setPosY(flow_grid, graph);

        // cook title
        if (flow_grid.get(new Vec2(0, 0)).cook_title != '') {
            const entry = this.getEntry(new Vec2(0, 0));
            entry.tile.pos.x = this.bounds.left + entry.tile.width / 2;
            this.setEntry(entry);
        }
        if (flow_grid.get(new Vec2(flow_grid.size.x - 1, 0)).cook_title != '') {
            const entry = this.getEntry(new Vec2(flow_grid.size.x - 1, 0));
            entry.tile.pos.x = this.bounds.right - entry.tile.width / 2;
            this.setEntry(entry);
        }
    }
    intersect(tile1: MetricTile, tile2: MetricTile): boolean {
        const xintersect = (tile1.left <= tile2.right && tile2.left <= tile1.right);
        const yintersect = (tile1.top <= tile2.bottom && tile2.top <= tile1.bottom);
        return xintersect && yintersect;
    }
    // set x
    updatePosX(coords: Vec2, flow_grid: FlowGrid): boolean {
        let posx = null;
        if (0 < coords.x) {
            posx = this.get(coords.left()).right + Math.floor(this.get(coords).width / 2);
        }
        else {
            posx = Math.ceil(this.get(coords).width / 2);
        }
        const tile = flow_grid.get(coords);
        // lines
        if (tile.lines.top != null && tile.sync_lines.isEmpty() && flow_grid.get(coords.up()).sync_lines.isEmpty()) {
            posx = Math.max(super.get(coords.up()).pos.x, posx);
        }
        if (tile.lines.bottom != null && flow_grid.get(coords.down()).sync_lines.isEmpty()) {
            posx = Math.max(super.get(coords.down()).pos.x, posx);
        }
        // cook line
        if (tile.cook_line) {
            posx = Math.max(super.get(coords.up()).pos.x, super.get(coords.down()).pos.x, posx);
        }
        // cook title
        if (tile.cook_title != '') {
            posx = Math.max(super.get(coords.down()).pos.x, posx);
        }
        // update
        const entry = super.getEntry(coords);
        if (entry.tile.pos.x < posx) {
            entry.tile.pos.x = posx;
            super.setEntry(entry);
            return true;
        }
        else {
            return false;
        }
    }
    setPosX(flow_grid: FlowGrid, iteration: number = 0): void {
        if (iteration == 10) {
            return;
        }
        for (let x = 0; x < flow_grid.size.x; ++x) {
            let updated = true;
            while (updated) {
                updated = false;
                for (let y = 0; y < flow_grid.size.y; ++y) {
                    const coords = new Vec2(x, y);
                    updated ||= this.updatePosX(coords, flow_grid);
                }
            }
        }
        let updated = false;
        for (const [node, coords] of flow_grid.nodeEntries) {
            if (node.childs.size == 1) {
                const child = sample(node.childs);
                if (child.parents.size == 1 && node.task.cook == child.task.cook) {
                    const entry = this.getEntry(coords);
                    const child_entry = this.getEntry(flow_grid.nodeCoords(child));
                    if (entry.tile.pos.x != child_entry.tile.pos.x) {
                        updated = true;
                        // console.error("X", node.task.description, child.task.description);
                        const max = Math.max(entry.tile.pos.x, child_entry.tile.pos.x);
                        entry.tile.pos.x = max;
                        child_entry.tile.pos.x = max;
                        this.setEntry(entry);
                        this.setEntry(child_entry);
                    }
                }
            }
        }
        if (updated) {
            return this.setPosX(flow_grid, iteration + 1);
        }
    }
    // set y
    updatePosY(coords: Vec2, flow_grid: FlowGrid): boolean {
        const metrictile = this.get(coords);
        let posy = this.get(coords.up()).bottom + Math.ceil(this.get(coords).height / 2);
        // above
        for (let index = 0; index < flow_grid.size.x; ++index) {
            const index_tile = super.get(new Vec2(index, coords.y).up());
            if (metrictile.left < index_tile.right && index_tile.left < metrictile.right) {
                posy = Math.max(index_tile.bottom, posy);
            }
        }
        const tile = flow_grid.get(coords);
        // node
        if (tile.node !== null) {
            for (const parent of tile.node.parents) {
                const parent_coords = flow_grid.nodeCoords(parent);
                if (parent_coords.y < coords.y) {
                    posy = Math.max(super.get(parent_coords).bottom, posy);
                }
            }
        }
        // line
        if (tile.lines.left !== null) {
            posy = Math.max(super.get(coords.left()).pos.y, posy);
        }
        if (tile.lines.right !== null) {
            posy = Math.max(super.get(coords.right()).pos.y, posy);
        }
        // sync line
        if (tile.sync_lines.top) {
            if (tile.sync_lines.top != 'left') {
                posy = Math.max(super.get(coords.left()).pos.y, posy);
            }
            if (tile.sync_lines.top != 'right') {
                posy = Math.max(super.get(coords.right()).pos.y, posy);
            }
        }
        if (tile.sync_lines.bottom) {
            if (tile.sync_lines.bottom != 'left') {
                posy = Math.max(super.get(coords.left()).pos.y, posy);
            }
            if (tile.sync_lines.bottom != 'right') {
                posy = Math.max(super.get(coords.right()).pos.y, posy);
            }
        }
        // update
        const entry = super.getEntry(coords);
        if (entry.tile.pos.y < posy) {
            entry.tile.pos.y = posy;
            super.setEntry(entry);
            return true;
        }
        else {
            return false;
        }
    }
    setPosY(flow_grid: FlowGrid, graph: Graph): void {
        for (let y = 1; y < flow_grid.size.y; ++y) {
            let updated = true;
            while (updated) {
                updated = false;
                for (let x = 0; x < flow_grid.size.x; ++x) {
                    updated ||= this.updatePosY(new Vec2(x, y), flow_grid);
                }
            }
        }
        let updated = false;
        for (let d = 0; d <= graph.maxDepth; ++d) {
            let maxy = -Infinity;
            for (const node of graph.nodes) {
                if (depth(node) == d) {
                    maxy = Math.max(this.get(flow_grid.nodeCoords(node)).pos.y, maxy);
                }
            }
            for (const node of graph.nodes) {
                if (depth(node) == d) {
                    const entry = this.getEntry(flow_grid.nodeCoords(node));
                    if (entry.tile.pos.y < maxy) {
                        entry.tile.pos.y = maxy;
                        this.setEntry(entry);
                        updated = true;
                    }
                }
            }
        }
        if (updated) {
            return this.setPosY(flow_grid, graph);
        }
    }
    // bounds
    get bounds(): Bounds {
        let max_x = -Infinity;
        let min_x = Infinity;
        let max_y = -Infinity;
        let min_y = Infinity;
        for (let y = 0; y < super.size.y; ++y) {
            max_x = Math.max(super.get(new Vec2(super.size.x - 1, y)).right, max_x);
            min_x = Math.min(super.get(new Vec2(0, y)).left, min_x);
        }
        for (let x = 0; x < super.size.x; ++x) {
            max_y = Math.max(super.get(new Vec2(x, super.size.y - 1)).bottom, max_y);
            min_y = Math.min(super.get(new Vec2(x, 0)).top, min_y);
        }
        return new Bounds(new HorBounds(min_x, max_x), new VerBounds(min_y, max_y));
    }
    get dim(): Vec2 {
        return this.bounds.dim;
    }
    get center(): Vec2 {
        return this.bounds.center;
    }
    // diff
    diff(coords1: Vec2, coords2: Vec2): Vec2 {
        return vec2Abs(vec2Sub(super.get(coords2).pos, super.get(coords1).pos));
    }
    // max
    maxLeft(coords: Vec2, noMargin: boolean = false): number {
        const entry = this.getEntry(coords);
        const left = this.get(coords.left()).right - (noMargin ? this.get(coords.left()).margin.x / 2: 0);
        return entry.tile.pos.x - left;
    }
    maxRight(coords: Vec2, noMargin: boolean = false): number {
        const entry = this.getEntry(coords);
        const right = this.get(coords.right()).left + (noMargin ? this.get(coords.right()).margin.x / 2: 0);
        return right - entry.tile.pos.x;
    }
    maxX(coords: Vec2): number {
        if (coords.x == 0) {
            return this.maxRight(coords);
        }
        else if (coords.x + 1 == this.size.x) {
            return this.maxLeft(coords);
        }
        const left = this.get(coords.left()).right
        const right = this.get(coords.right()).left;
        return right - left;
    }
    maxTop(coords: Vec2, noMargin: boolean = false): number {
        const entry = this.getEntry(coords);
        const top = this.get(coords.up()).bottom  - (noMargin ? this.get(coords.up()).margin.y / 2: 0);
        return entry.tile.pos.y - top;
    }
    maxBottom(coords: Vec2, noMargin: boolean = false): number {
        const entry = this.getEntry(coords);
        const bottom = this.get(coords.down()).top  + (noMargin ? this.get(coords.down()).margin.y / 2: 0);
        return bottom - entry.tile.pos.y;
    }
    maxY(coords: Vec2): number {
        if (coords.y == 0) {
            return this.maxBottom(coords);
        }
        else if (coords.y + 1 == this.size.y) {
            return this.maxTop(coords);
        }
        const top = this.get(coords.up()).bottom;
        const bottom = this.get(coords.down()).top;
        return bottom - top;
    }
    // get_hor_bounds(cond: (node: Node) => boolean, flow_grid: FlowGrid): HorBounds | null{
    //     let left = Infinity;
    //     let left_node = null;
    //     let right = -Infinity;
    //     let right_node = null;
    //     for (const [node, pos] of flow_grid.nodeEntries) {
    //         if (cond(node)) {
    //             const curr_left = super.get(pos).left();
    //             const curr_right = super.get(pos).right();

    //             if (curr_left < left) {
    //                 left = curr_left;
    //                 left_node = node;
    //             }
    //             if (right < curr_right) {
    //                 right = curr_right;
    //                 right_node = node;
    //             }
    //         }
    //     }

    //     if (left == Infinity || right == -Infinity) {
    //         return null;
    //     }
    //     else {
    //         return new HorBounds(left, right, left_node, right_node);
    //     }
    // }
}