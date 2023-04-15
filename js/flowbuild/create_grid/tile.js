export class Tile {
    constructor() {
        this.clear();
    }
    is_empty() {
        return this.node === null &&
            this.lines.top === null &&
            this.lines.right === null &&
            this.lines.bottom === null &&
            this.lines.left === null &&
            this.sync_lines.top === null &&
            this.sync_lines.bottom === null &&
            this.cook_line == false;
    }
    clear() {
        this.node = null;
        this.lines = { top: null, right: null, bottom: null, left: null };
        this.sync_lines = { top: null, bottom: null };
        this.cook_line = false;
        this.account_x = true;
        this.account_y = true;
    }
    has_connector() {
        let line_count = 0;
        for (const dir of ['top', 'right', 'bottom', 'left']) {
            if (this.lines[dir] == 'in') {
                line_count++;
            }
        }
        return line_count >= 2;
    }
    is_solid() {
        return (this.node !== null && !this.node.task.is_empty()) || this.has_connector() || this.sync_lines.top !== null || this.sync_lines.bottom !== null;
    }
}
//# sourceMappingURL=tile.js.map