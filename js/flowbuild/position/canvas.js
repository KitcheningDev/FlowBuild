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
var _Canvas_sync_line_top_map, _Canvas_sync_line_bottom_map;
import { Vec2 } from "../../utils/vec2.js";
import { get_node_positions } from "./get_node_positions.js";
import { config_sync_line_margin, get_node_size, get_sync_line_height } from "./get_size.js";
import { has_sync_line, SyncLine } from "./sync_line.js";
export class Rect {
    constructor(origin, size) {
        this.origin = origin;
        this.size = size;
    }
    get top() {
        return new Vec2(this.origin.x, this.origin.y - this.size.y / 2);
    }
    get right() {
        return new Vec2(this.origin.x + this.size.x / 2, this.origin.y);
    }
    get bottom() {
        return new Vec2(this.origin.x, this.origin.y + this.size.y / 2);
    }
    get left() {
        return new Vec2(this.origin.x - this.size.x / 2, this.origin.y);
    }
    get top_left() {
        return new Vec2(this.origin.x - this.size.x / 2, this.origin.y - this.size.y / 2);
    }
    get top_right() {
        return new Vec2(this.origin.x + this.size.x / 2, this.origin.y - this.size.y / 2);
    }
    get bottom_right() {
        return new Vec2(this.origin.x + this.size.x / 2, this.origin.y + this.size.y / 2);
    }
    get bottom_left() {
        return new Vec2(this.origin.x - this.size.x / 2, this.origin.y + this.size.y / 2);
    }
}
class Line {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get id() {
        return this.from.id + (2 ** 20) * this.to.id;
    }
    equals(other) {
        return this.from === other.from && this.to === other.to;
    }
}
export class Canvas {
    constructor(graph) {
        _Canvas_sync_line_top_map.set(this, void 0);
        _Canvas_sync_line_bottom_map.set(this, void 0);
        // node rects
        this.node_rect_map = new Map();
        const node_positions = get_node_positions(graph);
        for (const node of graph.nodes) {
            this.node_rect_map.set(node, new Rect(node_positions.get(node), get_node_size(node)));
        }
        console.table(node_positions);
        // sync line maps
        __classPrivateFieldSet(this, _Canvas_sync_line_top_map, new Map(), "f");
        __classPrivateFieldSet(this, _Canvas_sync_line_bottom_map, new Map(), "f");
        for (const node of graph.nodes) {
            if (has_sync_line(node, 'top')) {
                __classPrivateFieldGet(this, _Canvas_sync_line_top_map, "f").set(node, new SyncLine(node, 'top'));
            }
            if (has_sync_line(node, 'bottom')) {
                __classPrivateFieldGet(this, _Canvas_sync_line_top_map, "f").set(node, new SyncLine(node, 'bottom'));
            }
        }
        // sync line rects
        this.sync_line_rect_map = new Map();
        for (const sync_line of __classPrivateFieldGet(this, _Canvas_sync_line_top_map, "f").values()) {
            const nodes_rect = this.get_nodeset_bounds(sync_line.members);
            const y_offset = config_sync_line_margin + get_sync_line_height() / 2;
            nodes_rect.origin.y += sync_line.where == 'bottom' ? y_offset : -y_offset;
            this.sync_line_rect_map.set(sync_line, new Rect(nodes_rect.origin, nodes_rect.size));
        }
        // lines
        this.lines = new Map();
        for (const node of graph.nodes) {
            const from = __classPrivateFieldGet(this, _Canvas_sync_line_bottom_map, "f").has(node) ? __classPrivateFieldGet(this, _Canvas_sync_line_bottom_map, "f").get(node) : node;
            for (const child of node.childs) {
                const to = __classPrivateFieldGet(this, _Canvas_sync_line_top_map, "f").has(child) ? __classPrivateFieldGet(this, _Canvas_sync_line_top_map, "f").get(child) : child;
                const line = new Line(from, to);
                this.lines.set(line.id, line);
            }
        }
    }
    get_nodeset_bounds(nodes) {
        let min_x = Infinity;
        let max_x = -Infinity;
        let min_y = Infinity;
        let max_y = -Infinity;
        for (const node of nodes) {
            const rect = this.node_rect_map.get(node);
            min_x = Math.min(rect.left.x, min_x);
            max_x = Math.min(rect.right.x, max_x);
            min_y = Math.min(rect.top.y, min_y);
            max_y = Math.min(rect.bottom.y, max_y);
        }
        return new Rect(new Vec2((min_x + max_x) / 2, (min_y + max_y) / 2), new Vec2(max_x - min_x, max_y - min_y));
    }
    get_in_pos(node) {
        if (__classPrivateFieldGet(this, _Canvas_sync_line_top_map, "f").has(node)) {
            return this.sync_line_rect_map.get(__classPrivateFieldGet(this, _Canvas_sync_line_top_map, "f").get(node)).top;
        }
        else {
            return this.node_rect_map.get(node).top;
        }
    }
    get_out_pos(node) {
        if (__classPrivateFieldGet(this, _Canvas_sync_line_bottom_map, "f").has(node)) {
            return this.sync_line_rect_map.get(__classPrivateFieldGet(this, _Canvas_sync_line_bottom_map, "f").get(node)).bottom;
        }
        else {
            return this.node_rect_map.get(node).bottom;
        }
    }
}
_Canvas_sync_line_top_map = new WeakMap(), _Canvas_sync_line_bottom_map = new WeakMap();
//# sourceMappingURL=canvas.js.map