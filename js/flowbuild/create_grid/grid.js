var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Grid_data, _Grid_size, _Grid_nodes, _Grid_sync_lines;
import { Vec2, vec2_add, vec2_mult } from "../../utils/vec2.js";
import { Tile } from "./tile.js";
export class Grid {
    constructor(size) {
        _Grid_data.set(this, void 0);
        _Grid_size.set(this, void 0);
        _Grid_nodes.set(this, void 0);
        _Grid_sync_lines.set(this, void 0);
        __classPrivateFieldSet(this, _Grid_data, [], "f");
        __classPrivateFieldSet(this, _Grid_size, new Vec2(0, 0), "f");
        __classPrivateFieldSet(this, _Grid_nodes, new Map(), "f");
        __classPrivateFieldSet(this, _Grid_sync_lines, new Map(), "f");
        this.set_size(size);
    }
    // size
    in_bounds(coords) {
        return 0 <= coords.x && coords.x < __classPrivateFieldGet(this, _Grid_size, "f").x && 0 <= coords.y && coords.y < __classPrivateFieldGet(this, _Grid_size, "f").y;
    }
    get_size() {
        return __classPrivateFieldGet(this, _Grid_size, "f");
    }
    set_size(size) {
        const data = [];
        for (let y = 0; y < size.y; ++y) {
            for (let x = 0; x < size.x; ++x) {
                if (this.in_bounds(new Vec2(x, y))) {
                    data.push(this.get(new Vec2(x, y)));
                }
                else {
                    data.push(new Tile());
                }
            }
        }
        __classPrivateFieldSet(this, _Grid_data, data, "f");
        __classPrivateFieldSet(this, _Grid_size, size, "f");
        for (const [sync_line, [pos, length]] of __classPrivateFieldGet(this, _Grid_sync_lines, "f")) {
            if (size.x < pos.x + length || size.y <= pos.y) {
                __classPrivateFieldGet(this, _Grid_sync_lines, "f").delete(sync_line);
            }
        }
        for (const [node, pos] of __classPrivateFieldGet(this, _Grid_nodes, "f")) {
            if (size.x <= pos.x || size.y <= pos.y) {
                __classPrivateFieldGet(this, _Grid_nodes, "f").delete(node);
            }
        }
    }
    shrink_to_fit() {
        let max_x = this.get_size().x - 1;
        let max_y = this.get_size().y - 1;
        while (max_x > 0 && this.is_ver_path_empty(0, this.get_size().y - 1, max_x)) {
            max_x -= 1;
        }
        while (max_y > 0 && this.is_hor_path_empty(0, this.get_size().x - 1, max_y)) {
            max_y -= 1;
        }
        const size = new Vec2(max_x + 1, max_y + 1);
        this.set_size(size);
        return size;
    }
    get_tiles() {
        return __classPrivateFieldGet(this, _Grid_data, "f");
    }
    // coords
    get(coords) {
        return __classPrivateFieldGet(this, _Grid_data, "f")[__classPrivateFieldGet(this, _Grid_size, "f").x * coords.y + coords.x];
    }
    set(coords, tile) {
        __classPrivateFieldGet(this, _Grid_data, "f")[__classPrivateFieldGet(this, _Grid_size, "f").x * coords.y + coords.x] = tile;
    }
    // node
    has_node(node) {
        return __classPrivateFieldGet(this, _Grid_nodes, "f").has(node);
    }
    set_node(coords, node) {
        if (node !== null) {
            if (__classPrivateFieldGet(this, _Grid_nodes, "f").has(node)) {
                const old_coords = __classPrivateFieldGet(this, _Grid_nodes, "f").get(node);
                this.get(old_coords).node = null;
            }
            __classPrivateFieldGet(this, _Grid_nodes, "f").set(node, coords);
        }
        this.get(coords).node = node;
    }
    remove_node(node) {
        const coords = this.get_node_coords(node);
        this.get(coords).node = null;
        __classPrivateFieldGet(this, _Grid_nodes, "f").delete(node);
    }
    get_node_coords(node) {
        const coords = __classPrivateFieldGet(this, _Grid_nodes, "f").get(node);
        if (coords === undefined) {
            return null;
        }
        else {
            return new Vec2(coords.x, coords.y);
        }
    }
    get_nodes() {
        return __classPrivateFieldGet(this, _Grid_nodes, "f").keys();
    }
    get_node_map() {
        return __classPrivateFieldGet(this, _Grid_nodes, "f").entries();
    }
    // sync_line
    has_sync_line(sync_line) {
        return __classPrivateFieldGet(this, _Grid_sync_lines, "f").has(sync_line);
    }
    get_sync_line_bounds(sync_line) {
        return __classPrivateFieldGet(this, _Grid_sync_lines, "f").get(sync_line);
    }
    set_sync_line(sync_line) {
        let top = [null, Infinity];
        let right = [null, -Infinity];
        let bottom = [null, -Infinity];
        let left = [null, Infinity];
        for (const node of sync_line.members) {
            const coords = __classPrivateFieldGet(this, _Grid_nodes, "f").get(node);
            top = coords.y < top[1] ? [node, coords.y] : top;
            right = right[1] < coords.x ? [node, coords.x] : right;
            bottom = bottom[1] < coords.y ? [node, coords.y] : bottom;
            left = coords.x < left[1] ? [node, coords.x] : left;
        }
        let sync_line_y = sync_line.where == 'top' ? top[1] - 1 : bottom[1] + 1;
        if (sync_line.where == 'top') {
            this.insert_row(sync_line_y + 1);
            sync_line_y += 1;
        }
        else {
            this.insert_row(sync_line_y);
        }
        this.get(new Vec2(left[1], sync_line_y)).sync_lines[sync_line.where] = 'left';
        this.get(new Vec2(right[1], sync_line_y)).sync_lines[sync_line.where] = 'right';
        for (let x = left[1] + 1; x < right[1]; ++x) {
            this.get(new Vec2(x, sync_line_y)).sync_lines[sync_line.where] = 'middle';
        }
        const val = [new Vec2(left[1], sync_line_y), right[1] + 1 - left[1]];
        __classPrivateFieldGet(this, _Grid_sync_lines, "f").set(sync_line, val);
        return val;
    }
    get_sync_lines() {
        return __classPrivateFieldGet(this, _Grid_sync_lines, "f").keys();
    }
    remove_sync_line(sync_line) {
        const [pos, length] = __classPrivateFieldGet(this, _Grid_sync_lines, "f").get(sync_line);
        for (let x = pos.x; x < pos.x + length; ++x) {
            this.get(new Vec2(x, pos.y)).sync_lines[sync_line.where] = null;
        }
    }
    get_sync_line(node, where) {
        for (const sync_line of __classPrivateFieldGet(this, _Grid_sync_lines, "f").keys()) {
            if (sync_line.where == where && sync_line.members.has(node)) {
                return sync_line;
            }
        }
        return null;
    }
    // modify
    shift_down(where) {
        for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
            for (let y = __classPrivateFieldGet(this, _Grid_size, "f").y - 1; y > where; --y) {
                this.set(new Vec2(x, y), this.get(new Vec2(x, y - 1)));
            }
        }
        for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
            this.set(new Vec2(x, where), new Tile());
        }
        for (const [node, coords] of __classPrivateFieldGet(this, _Grid_nodes, "f")) {
            if (where <= coords.y) {
                coords.y++;
            }
        }
        for (const [sync_line, [coords, length]] of __classPrivateFieldGet(this, _Grid_sync_lines, "f")) {
            if (where <= coords.y) {
                coords.y++;
            }
        }
    }
    shift_right(where) {
        for (let y = 0; y < __classPrivateFieldGet(this, _Grid_size, "f").y; ++y) {
            for (let x = __classPrivateFieldGet(this, _Grid_size, "f").x - 1; x > where; --x) {
                this.set(new Vec2(x, y), this.get(new Vec2(x - 1, y)));
            }
        }
        for (let y = 0; y < __classPrivateFieldGet(this, _Grid_size, "f").y; ++y) {
            this.set(new Vec2(where, y), new Tile());
        }
        for (const [node, coords] of __classPrivateFieldGet(this, _Grid_nodes, "f")) {
            if (where <= coords.x) {
                coords.x++;
            }
        }
        for (const [sync_line, [coords, length]] of __classPrivateFieldGet(this, _Grid_sync_lines, "f")) {
            if (where <= coords.x) {
                coords.x++;
            }
            else if (coords.x < where && where < coords.x + length) {
                __classPrivateFieldGet(this, _Grid_sync_lines, "f").get(sync_line)[1]++;
            }
        }
    }
    insert_row(where, preserve_lines = true) {
        this.set_size(this.get_size().down());
        this.shift_down(where);
        if (preserve_lines && 0 < where && where < this.get_size().y - 1) {
            for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
                if (this.get(new Vec2(x, where - 1)).lines.bottom == 'out' && this.get(new Vec2(x, where + 1)).lines.top == 'in') {
                    this.get(new Vec2(x, where)).lines.bottom = 'out';
                    this.get(new Vec2(x, where)).lines.top = 'in';
                }
                else if (this.get(new Vec2(x, where - 1)).lines.bottom == 'in' && this.get(new Vec2(x, where + 1)).lines.top == 'out') {
                    this.get(new Vec2(x, where)).lines.bottom = 'in';
                    this.get(new Vec2(x, where)).lines.top = 'out';
                }
            }
        }
    }
    insert_column(where, preserve_lines = true) {
        this.set_size(this.get_size().right());
        this.shift_right(where);
        if (preserve_lines && 0 < where && where < this.get_size().x - 1) {
            for (let y = 0; y < __classPrivateFieldGet(this, _Grid_size, "f").y; ++y) {
                if (where > 0 && this.get(new Vec2(where - 1, y)).lines.right == 'out' && this.get(new Vec2(where + 1, y)).lines.left == 'in') {
                    this.get(new Vec2(where, y)).lines.right = 'out';
                    this.get(new Vec2(where, y)).lines.left = 'in';
                }
                else if (this.get(new Vec2(where - 1, y)).lines.right == 'in' && this.get(new Vec2(where + 1, y)).lines.left == 'out') {
                    this.get(new Vec2(where, y)).lines.right = 'in';
                    this.get(new Vec2(where, y)).lines.left = 'out';
                }
                if (['left', 'middle'].includes(this.get(new Vec2(where - 1, y)).sync_lines.top)
                    && ['middle', 'right'].includes(this.get(new Vec2(where + 1, y)).sync_lines.top)) {
                    this.get(new Vec2(where, y)).sync_lines.top = 'middle';
                }
                if (['left', 'middle'].includes(this.get(new Vec2(where - 1, y)).sync_lines.bottom)
                    && ['middle', 'right'].includes(this.get(new Vec2(where + 1, y)).sync_lines.bottom)) {
                    this.get(new Vec2(where, y)).sync_lines.bottom = 'middle';
                }
            }
        }
    }
    // node in out
    get_node_in_obj(node) {
        for (const [sync_line, [coords, length]] of __classPrivateFieldGet(this, _Grid_sync_lines, "f")) {
            if (sync_line.where == 'top' && sync_line.members.has(node)) {
                return sync_line;
            }
        }
        return node;
    }
    get_node_out_obj(node) {
        for (const [sync_line, [coords, length]] of __classPrivateFieldGet(this, _Grid_sync_lines, "f")) {
            if (sync_line.where == 'bottom' && sync_line.members.has(node)) {
                return sync_line;
            }
        }
        return node;
    }
    get_node_in(node) {
        for (const [sync_line, [coords, length]] of __classPrivateFieldGet(this, _Grid_sync_lines, "f")) {
            if (sync_line.where == 'top' && sync_line.members.has(node)) {
                return new Vec2(coords.x + Math.floor((length - 1) / 2), coords.y);
            }
        }
        return this.get_node_coords(node);
    }
    get_node_out(node) {
        console.log(...__classPrivateFieldGet(this, _Grid_sync_lines, "f"), node.task.description);
        for (const [sync_line, [coords, length]] of __classPrivateFieldGet(this, _Grid_sync_lines, "f")) {
            if (sync_line.where == 'bottom' && sync_line.members.has(node)) {
                console.log(node.task.description, length);
                return new Vec2(coords.x + Math.floor((length - 1) / 2), coords.y);
            }
        }
        return this.get_node_coords(node);
    }
    // path
    is_empty(coords) {
        return this.get(coords).is_empty();
    }
    is_solid(coords) {
        return this.get(coords).is_solid();
    }
    is_path_empty(origin, dir, steps, consider = 'all') {
        for (let i = 0; i <= steps; ++i) {
            const coords = vec2_add(origin, vec2_mult(dir, i));
            if (consider == 'all') {
                if (!this.is_empty(coords)) {
                    return false;
                }
            }
            else if (consider == 'solid') {
                if (this.is_solid(coords)) {
                    return false;
                }
            }
            else if (this.get(coords).node !== null && !this.get(coords).node.task.is_empty()) {
                return false;
            }
        }
        return true;
    }
    is_hor_path_empty(from, to, y, consider = 'all') {
        if (from <= to) {
            return this.is_path_empty(new Vec2(from, y), new Vec2(1, 0), to - from, consider);
        }
        else {
            return this.is_path_empty(new Vec2(from, y), new Vec2(-1, 0), from - to, consider);
        }
    }
    is_ver_path_empty(from, to, x, consider = 'all') {
        if (from <= to) {
            return this.is_path_empty(new Vec2(x, from), new Vec2(0, 1), to - from, consider);
        }
        else {
            return this.is_path_empty(new Vec2(x, from), new Vec2(0, -1), from - to, consider);
        }
    }
    // debug
    log() {
        let description_data = [];
        for (let y = 0; y < __classPrivateFieldGet(this, _Grid_size, "f").y; ++y) {
            const row = [];
            for (let x = 0; x < __classPrivateFieldGet(this, _Grid_size, "f").x; ++x) {
                const tile = this.get(new Vec2(x, y));
                let text = ' ';
                if (tile.node !== null) {
                    text = tile.node.task.description;
                }
                // arrows
                if (tile.lines.left == 'in') {
                    text = '▶' + text;
                }
                else if (tile.lines.left == 'out') {
                    text = '◀' + text;
                }
                if (tile.lines.right == 'in') {
                    text = text + '◀';
                }
                else if (tile.lines.right == 'out') {
                    text = text + '▶';
                }
                let spaces = '';
                for (let i = 0; i <= Math.floor(text.length / 2); ++i) {
                    spaces += ' ';
                }
                if (tile.lines.top == 'in') {
                    text = spaces + '▼' + spaces + '\n' + text;
                }
                else if (tile.lines.top == 'out') {
                    text = spaces + '▲' + spaces + '\n' + text;
                }
                if (tile.lines.bottom == 'in') {
                    text = text + '\n' + spaces + '▲' + spaces;
                }
                else if (tile.lines.bottom == 'out') {
                    text = text + '\n' + spaces + '▼' + spaces;
                }
                if (tile.sync_lines.top) {
                    text += ';top ' + tile.sync_lines.top + ';';
                }
                if (tile.sync_lines.bottom) {
                    text += ';bottom ' + tile.sync_lines.bottom + ';';
                }
                if (tile.cook_line) {
                    text += ';cook_line;';
                }
                row.push(text);
            }
            description_data.push(row);
        }
        console.table(description_data);
    }
}
_Grid_data = new WeakMap(), _Grid_size = new WeakMap(), _Grid_nodes = new WeakMap(), _Grid_sync_lines = new WeakMap();
//# sourceMappingURL=grid.js.map