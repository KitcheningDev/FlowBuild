import { set_equal } from "../../utils/set.js";
import { Vec2 } from "../../utils/vec2.js";
class SyncLine {
    constructor(members, shared, where) {
        this.members = members;
        this.shared = shared;
        this.where = where;
    }
}
export function get_sync_lines(nodes) {
    const sync_lines = new Set();
    const nodes_top = new Set();
    const nodes_bottom = new Set();
    for (const node of nodes) {
        if (!nodes_top.has(node) && node.parents.size > 0) {
            const members = new Set();
            for (const sibling of [...node.parents][0].childs) {
                if (set_equal(node.parents, sibling.parents)) {
                    members.add(sibling);
                }
            }
            if (members.size > 1) {
                sync_lines.add(new SyncLine(members, node.parents, 'top'));
                for (const member of members) {
                    nodes_top.add(member);
                }
            }
        }
        if (!nodes_bottom.has(node) && node.childs.size > 0) {
            const members = new Set();
            for (const sibling of [...node.childs][0].parents) {
                if (set_equal(node.childs, sibling.childs)) {
                    members.add(sibling);
                }
            }
            if (members.size > 1) {
                sync_lines.add(new SyncLine(members, node.childs, 'bottom'));
                for (const member of members) {
                    nodes_bottom.add(member);
                }
            }
        }
    }
    return sync_lines;
}
class Bounds {
    constructor(nodes, grid) {
        this.top = [null, Infinity];
        this.right = [null, -Infinity];
        this.bottom = [null, -Infinity];
        this.left = [null, Infinity];
        for (const node of nodes) {
            const coords = grid.get_coords(node);
            this.top = coords.y < this.top[1] ? [node, coords.y] : this.top;
            this.right = this.right[1] < coords.x ? [node, coords.x] : this.right;
            this.bottom = this.bottom[1] < coords.y ? [node, coords.y] : this.bottom;
            this.left = coords.x < this.left[1] ? [node, coords.x] : this.left;
        }
    }
}
export function post_process_grid(grid) {
    const sync_lines = get_sync_lines(grid.get_members());
    for (const sync_line of sync_lines) {
        // if (sync_line.where == 'top') {
        //     continue;
        // }
        const bounds = new Bounds(sync_line.members, grid);
        let y = sync_line.where == 'top' ? bounds.top[1] - 1 : bounds.bottom[1] + 1;
        if (!grid.is_hor_path_empty(bounds.left[1], bounds.right[1], y)) {
            if (sync_line.where == 'top') {
                grid.insert_row(y + 1);
                y += 1;
            }
            else {
                grid.insert_row(y);
            }
        }
        grid.get(new Vec2(bounds.left[1], y)).sync_lines[sync_line.where] = 'left';
        grid.get(new Vec2(bounds.right[1], y)).sync_lines[sync_line.where] = 'right';
        for (let x = bounds.left[1] + 1; x < bounds.right[1]; ++x) {
            grid.get(new Vec2(x, y)).sync_lines[sync_line.where] = 'middle';
        }
    }
}
//# sourceMappingURL=post_process.js.map