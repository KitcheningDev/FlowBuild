import { Grid, Vec2, Arrow, SyncLine, ArrowUp, ArrowRight, ArrowDown, ArrowLeft, SyncLineDown, SyncLineUp } from "./grid.js";

class Rect {
    pos: Vec2;
    bounds: Vec2;

    constructor(pos: Vec2, bounds: Vec2) {
        this.pos = pos;
        this.bounds = bounds;
    }

    Offset(off: Vec2): Rect {
        this.pos.AddVec(off);
        return this;
    }
}

interface BoxRect {
    text: string;
    rect: Rect;
}
interface ArrowRect {
    arrow: Arrow;
    rect: Rect;
}
interface SynclineRect {
    sync_line: SyncLine;
    rect: Rect;
}

export class FlowchartConfig {
    size: Vec2;

    flowchart_html: HTMLElement;
    box_html: HTMLElement;
    arrow_html: HTMLElement;
    sync_line_html: HTMLElement;

    sync_line_margin: number;
    constructor() {}
}

export class FlowchartPos {
    box_rects: BoxRect[];
    arrow_rects: ArrowRect[];
    sync_line_rects: SynclineRect[];

    #rect_grid: Rect[];
    #grid: Grid;
    #config: FlowchartConfig;

    constructor(grid: Grid, config: FlowchartConfig) {
        this.box_rects = [];
        this.arrow_rects = [];
        this.sync_line_rects = [];
        this.#rect_grid = [];
        this.#grid = grid;
        this.#config = config;

        this.SetTileOrigins();
        this.SetPos();
    }

    private SetTileOrigins(): void {
        const size_grid: Vec2[] = [];
        for (let y = 0; y < this.#grid.size.y; ++y) {
            for (let x = 0; x < this.#grid.size.x; ++x) {
                const tile = this.#grid.Get(new Vec2(x, y));
                if (tile.text) {
                    this.#config.box_html.innerHTML = tile.text;
                    const rect = this.#config.box_html.getBoundingClientRect();
                    size_grid.push(new Vec2(rect.width, rect.height));
                }
                else if (!tile.arrow.IsEmpty()) {
                    const rect = this.#config.arrow_html.getBoundingClientRect();
                    size_grid.push(new Vec2(rect.width, rect.height));
                }
                else if (!tile.sync_line.IsEmpty()) {
                    const rect = this.#config.sync_line_html.getBoundingClientRect();
                    size_grid.push(new Vec2(rect.width, rect.height));
                }
                else 
                    size_grid.push(new Vec2());
            }
        }

        const size_heights = [];
        let diff_y = this.#config.size.y;
        for (let y = 0; y < this.#grid.size.y; ++y) {
            let max_y = 0;
            for (let x = 0; x < this.#grid.size.x; ++x) {
                const curr_y = size_grid[this.#grid.size.x * y + x].y;
                if (max_y < curr_y)
                    max_y = curr_y;
            }
            size_heights.push(max_y);
            diff_y -= max_y;
        }
        diff_y /= this.#grid.size.y;
        for (let i = 0; i < size_heights.length; ++i)
            size_heights[i] += diff_y;

        const size_widths = [];
        let diff_x = this.#config.size.x;
        for (let x = 0; x < this.#grid.size.x; ++x) {
            let max_x = 0;
            for (let y = 0; y < this.#grid.size.y; ++y) {
                const curr_x = size_grid[this.#grid.size.x * y + x].x;
                if (max_x < curr_x)
                    max_x = curr_x;
            }
            size_widths.push(max_x);
            diff_x -= max_x;
        }
        diff_x /= this.#grid.size.x;
        for (let i = 0; i < size_widths.length; ++i)
            size_widths[i] += diff_x;

        let curr_y = 0;
        for (let y = 0; y < this.#grid.size.y; ++y) {
            let curr_x = 0;
            for (let x = 0; x < this.#grid.size.x; ++x) {
                const pos = new Vec2(curr_x + size_widths[x] / 2, curr_y + size_heights[y] / 2);
                const bounds = size_grid[this.#grid.size.x * y + x];
                this.#rect_grid.push(new Rect(pos, bounds));
                curr_x += size_widths[x];
            }
            curr_y += size_heights[y];
        }
    }

    private SetPos(): void {
        for (let y = 0; y < this.#grid.size.y; ++y) {
            for (let x = 0; x < this.#grid.size.x; ++x) {
                const tile = this.#grid.Get(new Vec2(x, y));
                const rect = this.#rect_grid[this.#grid.size.x * y + x];
                if (tile.text)
                    this.box_rects.push({ text: tile.text, rect: rect });
                if (!tile.arrow.IsEmpty()) {
                    if (tile.arrow.up)
                        this.arrow_rects.push({ arrow: ArrowUp(), rect: rect.Offset(new Vec2(0, -rect.bounds.y / 2)) });
                    if (tile.arrow.right)
                        this.arrow_rects.push({ arrow: ArrowRight(), rect: rect.Offset(new Vec2(rect.bounds.x / 2, 0)) });
                    if (tile.arrow.down)
                        this.arrow_rects.push({ arrow: ArrowDown(), rect: rect.Offset(new Vec2(0, rect.bounds.y / 2)) });
                    if (tile.arrow.left)
                        this.arrow_rects.push({ arrow: ArrowLeft(), rect: rect.Offset(new Vec2(-rect.bounds.y / 2, 0)) });
                }
                if (!tile.sync_line.IsEmpty()) {
                    if (tile.sync_line.up)
                        this.sync_line_rects.push({ sync_line: SyncLineUp(), rect: rect.Offset(new Vec2(0, -rect.bounds.y / 2)) });
                    if (tile.sync_line.down)
                        this.sync_line_rects.push({ sync_line: SyncLineDown(), rect: rect.Offset(new Vec2(0, rect.bounds.y - this.#config.sync_line_margin)) });
                }
            }
        }
    }
}
