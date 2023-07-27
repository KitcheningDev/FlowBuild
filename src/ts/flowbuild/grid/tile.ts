import { Node } from "../graph/node.js";
import { ITile } from "./grid.js";

// lines
export type Line = 'in' | 'out' | null;
export type LineDir = 'top' | 'right' | 'bottom' | 'left';
export class Lines {
    constructor(top: Line = null, right: Line = null, bottom: Line = null, left: Line = null) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
    // access
    hasConnector(): boolean {
        let line_count = 0;
        for (const dir of ['top', 'right', 'bottom', 'left']) {
            if (this[dir] == 'in') {
                line_count++;
            }
        }
        return line_count >= 2;
    }
    isEmpty(): boolean {
        return this.top === null && this.right === null && this.bottom === null && this.left === null;
    }
    // clear
    clear(): void {
        this.top = null;
        this.right = null;
        this.bottom = null;
        this.left = null;
    }
    // clone
    clone(): Lines {
        return new Lines(this.top, this.right, this.bottom, this.left);
    }
    // member
    top: Line;
    right: Line;
    bottom: Line;
    left: Line;
}
// sync-line
type SyncLine = 'left' | 'middle' | 'right' | null;
export class SyncLines {
    constructor(top: SyncLine = null, bottom: SyncLine = null) {
        this.top = top;
        this.bottom = bottom;
    }
    // access
    isEmpty(): boolean {
        return this.top === null && this.bottom === null;
    }
    // clear
    clear(): void {
        this.top = null;
        this.bottom = null;
    }
    // clone
    clone(): SyncLines {
        return new SyncLines(this.top, this.bottom);
    }
    // member
    top: SyncLine;
    bottom: SyncLine;
}
// grid val
export class Tile implements ITile {
    constructor(node: Node | null = null, lines: Lines = new Lines(), sync_lines: SyncLines = new SyncLines(), cook_line: boolean = false, cook_title: string = '') {
        this.node = node;
        this.lines = lines;
        this.sync_lines = sync_lines;
        this.cook_line = cook_line;
        this.cook_title = cook_title;
    }
    // access
    isSolid(): boolean {
        return (this.node !== null && this.node.task !== null)/* || this.lines.hasConnector() */|| !this.sync_lines.isEmpty() || this.cook_title != '';
    }
    isEmpty(): boolean {
        return this.node === null && this.lines.isEmpty() && this.sync_lines.isEmpty() && this.cook_line == false && this.cook_title == '';
    }
    // clear
    clear(): void {
        this.node = null;
        this.lines.clear();
        this.sync_lines.clear();
        this.cook_line = false;
        this.cook_title = '';
    }
    // clone
    clone(): any {
        return new Tile(this.node, this.lines.clone(), this.sync_lines.clone(), this.cook_line, this.cook_title);
    }
    // member
    node: Node | null;
    lines: Lines;
    sync_lines: SyncLines;
    cook_line: boolean;
    cook_title: string;
}