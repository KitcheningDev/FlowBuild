import { last_elem } from "../../utils/funcs.js";
import { rect_t } from "../../utils/rect.js";
import { vec2_t, vec2 } from "../../utils/vec2.js";
import { config } from "../config.js";
import { line_intersect, line_t } from "../line.js";
import { create_eq_group_map, eq_group_t } from "../origin/eq_group.js";
import { path_t } from "../path.js";
import { pathset_bounds } from "../pathset.js";
import { draw_caret_html, draw_crossing_html, draw_line_html, draw_sync_line_html } from "./draw_html.js";

let line_segments: Set<line_t[]>;
function draw_line(line: line_t, ver_first = true): void {
    if (line.dir.x == 0 || line.dir.y == 0) {
        draw_line_html(line);
        draw_caret_html(line);

        line_segments.add([line]);
    }
    else {
        const y_plateau = line.to.y - config.y_plateu;
        let mid1: vec2_t;
        let mid2: vec2_t;

        if (ver_first) {
            mid1 = new vec2_t(line.from.x, y_plateau);
            mid2 = new vec2_t(line.to.x, y_plateau);
        }
        else {
            mid1 = new vec2_t(line.to.x, line.from.y);
            mid2 = new vec2_t(line.to.x, y_plateau);
        }

        draw_line_html(new line_t(line.from, mid1));
        draw_line_html(new line_t(mid1, mid2));
        draw_line_html(new line_t(mid2, line.to));
        draw_caret_html(new line_t(mid2, line.to));
        
        line_segments.add([new line_t(line.from, mid1), new line_t(mid1, mid2), new line_t(mid2, line.to)]);
    }
}
function draw_sync_line(paths: path_t[], pos: 'top' | 'bottom', origin_map: Map<path_t, vec2_t>): void {
    const bounds = pathset_bounds(new Set(paths), origin_map);
    const y_plateau = (pos == 'top') ? bounds.top - config.sync_line_margin : bounds.bottom + config.sync_line_margin;
    
    // draw sync_line
    const sync_line_from = new vec2_t(bounds.left, y_plateau);
    const sync_line_to = new vec2_t(bounds.right, y_plateau);
    draw_sync_line_html(new line_t(sync_line_from, sync_line_to));
    
    // draw lines attached to sync_line
    if (pos == 'top') {
        for (const path of paths) {
            const to = vec2.add(origin_map.get(path), path.bounds.in);
            draw_line(new line_t(new vec2_t(to.x, y_plateau + config.sync_line_width), to));
        }
    }
    else if (pos == 'bottom') {
        for (const path of paths) {
            const from = vec2.add(origin_map.get(path), path.bounds.out);
            draw_line(new line_t(from, new vec2_t(from.x, y_plateau - config.sync_line_width)));
        }
    }
}
function draw_global_sync_line(path: path_t, end: path_t, paths: Set<path_t>, origin_map: Map<path_t, vec2_t>, entry_map: Map<path_t, any>): void {
    const pos = (path.parents.size == 0) ? 'top' : 'bottom';
    const chart_bounds = pathset_bounds(paths, origin_map);
    let y_plateau = (pos == 'top') ?
     origin_map.get(path).y + path.bounds.out.y + config.sync_line_margin: 
     origin_map.get(path).y + path.bounds.in.y - config.sync_line_margin;

    // draw sync_line
    draw_sync_line_html(new line_t(new vec2_t(chart_bounds.left, y_plateau), new vec2_t(chart_bounds.right, y_plateau))); 
    
    // draw lines attached to sync_line
    if (pos == 'top') {
        for (const child of path.childs) {
            if (child.childs.size > 0) {
                const to = vec2.add(origin_map.get(child), child.bounds.in); //get_in_pos(child, origin_map, entry_map);
                draw_line(new line_t(new vec2_t(to.x, y_plateau + config.sync_line_width), to));
            }
        }
    }
    else if (pos == 'bottom') {
        for (const parent of path.parents) {
            if (parent.parents.size > 0) {
                const from = get_out_pos(parent, end, origin_map, entry_map);
                draw_line(new line_t(from, new vec2_t(from.x, y_plateau - config.sync_line_width)));
            }
        }
    }
}

function draw_inner_lines(paths :Set<path_t>, origin_map :Map<path_t, vec2_t>) {
    for (const path of paths) {
        const origin = origin_map.get(path);
        let last = null as rect_t;
        for (const curr of path.bounds.task_rects) {
            if (last !== null) {
                draw_line_html(new line_t(vec2.add(origin, last.origin), vec2.add(origin, curr.origin)));
            }
            last = curr;
        }
    }
}

function get_in_pos(path: path_t, start: path_t, origin_map: Map<path_t, vec2_t>, in_map: Map<path_t, eq_group_t>): vec2_t {
    const entry_in = in_map.get(path);
    if (entry_in.members.length > 1 && (entry_in.shared.size > 1 || !entry_in.shared.has(start))) {
        const bounds = pathset_bounds(new Set(entry_in.members), origin_map);
        return new vec2_t(bounds.origin.x, bounds.top - (config.sync_line_margin + config.sync_line_width));
    }
    else {
        return vec2.add(origin_map.get(path), path.bounds.in);
    }
}
function get_out_pos(path: path_t, end: path_t, origin_map: Map<path_t, vec2_t>, out_map: Map<path_t, eq_group_t>): vec2_t {
    const entry_out = out_map.get(path);
    if (entry_out.members.length > 1 && (entry_out.shared.size > 1 || !entry_out.shared.has(end))) {
        const bounds = pathset_bounds(new Set(entry_out.members), origin_map);
        return new vec2_t(bounds.origin.x, bounds.bottom + (config.sync_line_margin + config.sync_line_width));
    }
    else {
        return vec2.add(origin_map.get(path), path.bounds.out);
    }
}

export function draw_lines(paths :Set<path_t>, start :path_t, end :path_t, origin_map :Map<path_t, vec2_t>): void {
    // reset line segment cache
    line_segments = new Set<line_t[]>();

    // create in and out map
    const in_map = create_eq_group_map(paths, 'parents');
    const out_map = create_eq_group_map(paths, 'childs');

    // draw lines
    for (const path of paths) {
        if (!path.is_bw && path != start) {
            for (const child of path.childs) {
                if (!child.is_bw && child != end) {
                    draw_line(new line_t(get_out_pos(path, end, origin_map, out_map), get_in_pos(child, start, origin_map, in_map)));
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
            //const dummy_pos = vec2.add(origin_map.get(path), new vec2_t(last_elem(path.bounds.task_rects).left, path.bounds.out.y));
            for (const parent of path.parents) {
                if (parent.is_loop_entry) {
                    const from = get_in_pos(path, start, origin_map, in_map);
                    const to = get_in_pos(parent, start, origin_map, in_map);
                    draw_line(new line_t(from, to));
                    // const to = vec2.add(origin_map.get(child), child.bounds.task_rects[0].origin);
                    // const mid = new vec2_t(dummy_pos.x, to.y);
                    // draw_line_html(new line_t(from, mid));
                    // draw_line_html(new line_t(mid, to));
                    // line_segments.add([new line_t(from, mid), new line_t(mid, to)])
                }
            }
            for (const child of path.childs) {
                if (child.is_loop_exit) {
                    // const from = get_out_pos(child, end, origin_map, in_map);//origin_map.get(child);
                    // const to = get_out_pos(path, end, origin_map, in_map);
                    // draw_line(new line_t(from, to), false);
                    const from = vec2.add(origin_map.get(child), last_elem(child.bounds.task_rects).origin);
                    const to = path.head.str == "DUMMY" ? get_in_pos(path, start, origin_map, in_map) : get_out_pos(path, end, origin_map, out_map);
                    const mid = new vec2_t(to.x, from.y); //from, new vec2_t(0, config.depth_margin));

                    draw_line_html(new line_t(from, mid));
                    draw_line_html(new line_t(mid, to));
                    if (path.head.str != "DUMMY") {
                        draw_caret_html(new line_t(mid, to));
                    }
                    line_segments.add([new line_t(from, mid), new line_t(mid, to)]);
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
                        draw_caret_html(new line_t(l1.from, vec2.sub(intersection, vec2.mult_scal(vec2.normalized(l1.dir), 8))));
                        draw_caret_html(new line_t(l2.from, vec2.sub(intersection, vec2.mult_scal(vec2.normalized(l2.dir), 8))));
                        draw_crossing_html(intersection);
                    }
                }
            }
        }
    }

}
