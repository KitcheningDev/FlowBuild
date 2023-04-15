import { last_elem } from "../../utils/funcs.js";
import { Vec2, vec2 } from "../../utils/vec2.js";
import { config } from "../config.js";
import { line_intersect, Line } from "../line.js";
import { create_eq_group_map } from "../origin/eq_group.js";
import { pathset_bounds } from "../pathset.js";
import { draw_caret_html, draw_crossing_html, draw_line_html, draw_sync_line_html } from "./draw_html.js";
let line_segments;
function draw_line(line, ver_first = true) {
    if (line.dir.x == 0 || line.dir.y == 0) {
        draw_line_html(line);
        draw_caret_html(line);
        line_segments.add([line]);
    }
    else {
        const y_plateau = line.to.y - config.y_plateu;
        let mid1;
        let mid2;
        if (ver_first) {
            mid1 = new Vec2(line.from.x, y_plateau);
            mid2 = new Vec2(line.to.x, y_plateau);
        }
        else {
            mid1 = new Vec2(line.to.x, line.from.y);
            mid2 = new Vec2(line.to.x, y_plateau);
        }
        draw_line_html(new Line(line.from, mid1));
        draw_line_html(new Line(mid1, mid2));
        draw_line_html(new Line(mid2, line.to));
        draw_caret_html(new Line(mid2, line.to));
        line_segments.add([new Line(line.from, mid1), new Line(mid1, mid2), new Line(mid2, line.to)]);
    }
}
function draw_sync_line(paths, pos, origin_map) {
    const bounds = pathset_bounds(new Set(paths), origin_map);
    const y_plateau = (pos == 'top') ? bounds.top - config.sync_line_margin : bounds.bottom + config.sync_line_margin;
    // draw sync_line
    const sync_line_from = new Vec2(bounds.left, y_plateau);
    const sync_Lineo = new Vec2(bounds.right, y_plateau);
    draw_sync_line_html(new Line(sync_line_from, sync_Lineo));
    // draw lines attached to sync_line
    if (pos == 'top') {
        for (const path of paths) {
            const to = vec2.add(origin_map.get(path), path.bounds.in);
            draw_line(new Line(new Vec2(to.x, y_plateau + config.sync_line_width), to));
        }
    }
    else if (pos == 'bottom') {
        for (const path of paths) {
            const from = vec2.add(origin_map.get(path), path.bounds.out);
            draw_line(new Line(from, new Vec2(from.x, y_plateau - config.sync_line_width)));
        }
    }
}
function draw_global_sync_line(path, end, paths, origin_map, entry_map) {
    const pos = (path.parents.size == 0) ? 'top' : 'bottom';
    const chart_bounds = pathset_bounds(paths, origin_map);
    let y_plateau = (pos == 'top') ?
        origin_map.get(path).y + path.bounds.out.y + config.sync_line_margin :
        origin_map.get(path).y + path.bounds.in.y - config.sync_line_margin;
    // draw sync_line
    draw_sync_line_html(new Line(new Vec2(chart_bounds.left, y_plateau), new Vec2(chart_bounds.right, y_plateau)));
    // draw lines attached to sync_line
    if (pos == 'top') {
        for (const child of path.childs) {
            if (child.childs.size > 0) {
                const to = vec2.add(origin_map.get(child), child.bounds.in); //get_in_pos(child, origin_map, entry_map);
                draw_line(new Line(new Vec2(to.x, y_plateau + config.sync_line_width), to));
            }
        }
    }
    else if (pos == 'bottom') {
        for (const parent of path.parents) {
            if (parent.parents.size > 0) {
                const from = get_out_pos(parent, end, origin_map, entry_map);
                draw_line(new Line(from, new Vec2(from.x, y_plateau - config.sync_line_width)));
            }
        }
    }
}
function draw_inner_lines(paths, origin_map) {
    for (const path of paths) {
        const origin = origin_map.get(path);
        let last = null;
        for (const curr of path.bounds.task_rects) {
            if (last !== null) {
                draw_line_html(new Line(vec2.add(origin, last.origin), vec2.add(origin, curr.origin)));
            }
            last = curr;
        }
    }
}
function get_in_pos(path, start, origin_map, in_map) {
    const entry_in = in_map.get(path);
    if (entry_in.members.length > 1 && (entry_in.shared.size > 1 || !entry_in.shared.has(start))) {
        const bounds = pathset_bounds(new Set(entry_in.members), origin_map);
        return new Vec2(bounds.origin.x, bounds.top - (config.sync_line_margin + config.sync_line_width));
    }
    else {
        return vec2.add(origin_map.get(path), path.bounds.in);
    }
}
function get_out_pos(path, end, origin_map, out_map) {
    const entry_out = out_map.get(path);
    if (entry_out.members.length > 1 && (entry_out.shared.size > 1 || !entry_out.shared.has(end))) {
        const bounds = pathset_bounds(new Set(entry_out.members), origin_map);
        return new Vec2(bounds.origin.x, bounds.bottom + (config.sync_line_margin + config.sync_line_width));
    }
    else {
        return vec2.add(origin_map.get(path), path.bounds.out);
    }
}
export function draw_lines(paths, start, end, origin_map) {
    // reset line segment cache
    line_segments = new Set();
    // create in and out map
    const in_map = create_eq_group_map(paths, 'parents');
    const out_map = create_eq_group_map(paths, 'childs');
    // draw lines
    for (const path of paths) {
        if (!path.is_bw && path != start) {
            for (const child of path.childs) {
                if (!child.is_bw && child != end) {
                    draw_line(new Line(get_out_pos(path, end, origin_map, out_map), get_in_pos(child, start, origin_map, in_map)));
                }
            }
        }
    }
    // draw sync_lines
    for (const entry_in of in_map.values()) {
        if (entry_in.members.length > 1 && (entry_in.shared.size > 1 || !entry_in.shared.has(start))) {
            draw_sync_line(entry_in.members, 'top', origin_map);
        }
    }
    for (const entry_out of out_map.values()) {
        if (entry_out.members.length > 1 && (entry_out.shared.size > 1 || !entry_out.shared.has(end))) {
            draw_sync_line(entry_out.members, 'bottom', origin_map);
        }
    }
    // draw backwards lines
    for (const path of paths) {
        if (path.is_bw) {
            //const dummy_pos = vec2.add(origin_map.get(path), new Vec2(last_elem(path.bounds.task_rects).left, path.bounds.out.y));
            for (const parent of path.parents) {
                if (parent.is_loop_entry) {
                    const from = get_in_pos(path, start, origin_map, in_map);
                    const to = get_in_pos(parent, start, origin_map, in_map);
                    draw_line(new Line(from, to));
                    // const to = vec2.add(origin_map.get(child), child.bounds.task_rects[0].origin);
                    // const mid = new Vec2(dummy_pos.x, to.y);
                    // draw_line_html(new Line(from, mid));
                    // draw_line_html(new Line(mid, to));
                    // line_segments.add([new Line(from, mid), new Line(mid, to)])
                }
            }
            for (const child of path.childs) {
                if (child.is_loop_exit) {
                    // const from = get_out_pos(child, end, origin_map, in_map);//origin_map.get(child);
                    // const to = get_out_pos(path, end, origin_map, in_map);
                    // draw_line(new Line(from, to), false);
                    const from = vec2.add(origin_map.get(child), last_elem(child.bounds.task_rects).origin);
                    const to = path.head.str == "DUMMY" ? get_in_pos(path, start, origin_map, in_map) : get_out_pos(path, end, origin_map, out_map);
                    const mid = new Vec2(to.x, from.y); //from, new Vec2(0, config.depth_margin));
                    draw_line_html(new Line(from, mid));
                    draw_line_html(new Line(mid, to));
                    if (path.head.str != "DUMMY") {
                        draw_caret_html(new Line(mid, to));
                    }
                    line_segments.add([new Line(from, mid), new Line(mid, to)]);
                }
            }
        }
    }
    // draw global sync_lines
    draw_global_sync_line(start, end, paths, origin_map, in_map);
    draw_global_sync_line(end, end, paths, origin_map, out_map);
    // draw inner lines
    draw_inner_lines(paths, origin_map);
    // draw crossings
    for (const lines1 of line_segments) {
        for (const lines2 of line_segments) {
            if (vec2.equals(lines1[0].from, lines2[0].from)) {
                continue;
            }
            for (const l1 of lines1) {
                for (const l2 of lines2) {
                    const intersection = line_intersect(l1, l2, true);
                    if (intersection !== null) {
                        draw_caret_html(new Line(l1.from, vec2.sub(intersection, vec2.mult_scal(vec2.normalized(l1.dir), 8))));
                        draw_caret_html(new Line(l2.from, vec2.sub(intersection, vec2.mult_scal(vec2.normalized(l2.dir), 8))));
                        draw_crossing_html(intersection);
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=draw_line.js.map