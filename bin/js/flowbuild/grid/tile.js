export class Lines {
    constructor(top = null, right = null, bottom = null, left = null) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
    // access
    hasConnector() {
        let line_count = 0;
        for (const dir of ['top', 'right', 'bottom', 'left']) {
            if (this[dir] == 'in') {
                line_count++;
            }
        }
        return line_count >= 2;
    }
    isEmpty() {
        return this.top === null && this.right === null && this.bottom === null && this.left === null;
    }
    // clear
    clear() {
        this.top = null;
        this.right = null;
        this.bottom = null;
        this.left = null;
    }
    // clone
    clone() {
        return new Lines(this.top, this.right, this.bottom, this.left);
    }
}
export class SyncLines {
    constructor(top = null, bottom = null) {
        this.top = top;
        this.bottom = bottom;
    }
    // access
    isEmpty() {
        return this.top === null && this.bottom === null;
    }
    // clear
    clear() {
        this.top = null;
        this.bottom = null;
    }
    // clone
    clone() {
        return new SyncLines(this.top, this.bottom);
    }
}
// grid val
export class Tile {
    constructor(node = null, lines = new Lines(), sync_lines = new SyncLines(), cook_line = false, cook_title = '') {
        this.node = node;
        this.lines = lines;
        this.sync_lines = sync_lines;
        this.cook_line = cook_line;
        this.cook_title = cook_title;
    }
    // access
    isSolid() {
        return (this.node !== null && this.node.task !== null) /* || this.lines.hasConnector() */ || !this.sync_lines.isEmpty() || this.cook_title != '';
    }
    isEmpty() {
        return this.node === null && this.lines.isEmpty() && this.sync_lines.isEmpty() && this.cook_line == false && this.cook_title == '';
    }
    // clear
    clear() {
        this.node = null;
        this.lines.clear();
        this.sync_lines.clear();
        this.cook_line = false;
        this.cook_title = '';
    }
    // clone
    clone() {
        return new Tile(this.node, this.lines.clone(), this.sync_lines.clone(), this.cook_line, this.cook_title);
    }
}
//# sourceMappingURL=tile.js.map