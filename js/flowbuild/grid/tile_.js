class Lines {
    constructor(top = null, right = null, bottom = null, left = null) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
    has_connector() {
        let line_count = 0;
        for (const dir of ['top', 'right', 'bottom', 'left']) {
            if (this[dir] == 'in') {
                line_count++;
            }
        }
        return line_count >= 2;
    }
    is_empty() {
        return this.top === null && this.right === null && this.bottom === null && this.left === null;
    }
    clear() {
        this.top = null;
        this.right = null;
        this.bottom = null;
        this.left = null;
    }
    copy() {
        return new Lines(this.top, this.right, this.bottom, this.left);
    }
}
class SyncLines {
    constructor(top = null, bottom = null) {
        this.top = top;
        this.bottom = bottom;
    }
    is_empty() {
        return this.top === null && this.bottom === null;
    }
    clear() {
        this.top = null;
        this.bottom = null;
    }
    copy() {
        return new SyncLines(this.top, this.bottom);
    }
}
// grid val
export class Tile {
    constructor(node = null, lines = new Lines(), sync_lines = new SyncLines()) {
        this.node = node;
        this.lines = lines;
        this.sync_lines = sync_lines;
    }
    is_solid() {
        return this.node !== null || this.lines.has_connector() || !this.sync_lines.is_empty();
    }
    is_empty() {
        return this.node === null && this.lines.is_empty() && this.sync_lines.is_empty();
    }
    clear() {
        this.node = null;
        this.lines.clear();
        this.sync_lines.clear();
    }
    copy() {
        return new Tile(this.node, this.lines.copy(), this.sync_lines.copy());
    }
}
//# sourceMappingURL=tile_.js.map