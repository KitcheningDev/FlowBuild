import { Node } from "../graph/node.js";
import { ITile } from "./grid.js";

// lines
type Line = 'in' | 'out' | null;
export type LineDir = 'up' | 'right' | 'down' | 'left';
export class Lines {
    top: Line;
    right: Line;
    bottom: Line;
    left: Line;

    constructor(top: Line = null, right: Line = null, bottom: Line = null, left: Line = null) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }

    has_connector(): boolean {
        let line_count = 0;
        for (const dir of ['top', 'right', 'bottom', 'left']) {
            if (this[dir] == 'in') {
                line_count++;
            }
        }
        return line_count >= 2;
    }

    is_empty(): boolean {
        return this.top === null && this.right === null && this.bottom === null && this.left === null;
    }
    clear(): void {
        this.top = null;
        this.right = null;
        this.bottom = null;
        this.left = null;
    }
    copy(): Lines {
        return new Lines(this.top, this.right, this.bottom, this.left);
    }
}

// sync-line
type SyncLine = 'left' | 'middle' | 'right' | null;
export class SyncLines {
    top: SyncLine;
    bottom: SyncLine;

    constructor(top: SyncLine = null, bottom: SyncLine = null) {
        this.top = top;
        this.bottom = bottom;
    }

    is_empty(): boolean {
        return this.top === null && this.bottom === null;
    }
    clear(): void {
        this.top = null;
        this.bottom = null;
    }
    copy(): SyncLines {
        return new SyncLines(this.top, this.bottom);
    }
}

// grid val
export class Tile implements ITile {
    node: Node | null;
    lines: Lines;
    sync_lines: SyncLines;
    cook_line: boolean;

    constructor(node: Node | null = null, lines: Lines = new Lines(), sync_lines: SyncLines = new SyncLines(), cook_line: boolean = false) {
        this.node = node;
        this.lines = lines;
        this.sync_lines = sync_lines;
        this.cook_line = cook_line;
    }

    is_solid(): boolean {
        return (this.node !== null && !this.node.task.is_empty()) || this.lines.has_connector() || !this.sync_lines.is_empty();
    }

    is_empty(): boolean {
        return this.node === null && this.lines.is_empty() && this.sync_lines.is_empty() && this.cook_line == false;
    }
    clear(): void {
        this.node = null;
        this.lines.clear();
        this.sync_lines.clear();
        this.cook_line = false;
    }
    copy(): any {
        return new Tile(this.node, this.lines.copy(), this.sync_lines.copy(), this.cook_line);
    }
}