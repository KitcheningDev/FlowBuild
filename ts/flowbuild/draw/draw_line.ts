import { rect_t } from "../../utils/rect.js";
import { vec2_t, vec2 } from "../../utils/vec2.js";
import { global_config } from "../config.js";
import { ID } from "../hash_str.js";
import { line_intersection, line_segment_t } from "../line_segment.js";
import { path_t } from "../path.js";
import { pathset_center, pathset_left_right, pathset_top_bottom } from "../pathset.js";
import { draw_line_html, draw_sync_line_html } from "./draw_html.js";

let line_segments: Set<line_segment_t[]>;
function draw_line(line: line_segment_t): void {
    if (line.dir.x == 0) {
        draw_line_html(line);
        line_segments.add([line]);
    }
    else {
        const y_plateau = line.to.y - global_config.depth_margin / 2;
        const mid1 = new vec2_t(line.from.x, y_plateau);
        const mid2 = new vec2_t(line.to.x, y_plateau);
        
        draw_line_html(new line_segment_t(line.from, mid1));
        draw_line_html(new line_segment_t(mid1, mid2));
        draw_line_html(new line_segment_t(mid2, line.to));
        
        line_segments.add([new line_segment_t(line.from, mid1), new line_segment_t(mid1, mid2), new line_segment_t(mid2, line.to)]);
    }
}
function draw_sync_line(paths: Set<path_t>, pos: 'top' | 'bottom', origin_map: Map<ID, vec2_t>): void {
    const [left, right] = pathset_left_right(paths, origin_map);
    const [top, bottom] = pathset_top_bottom(paths, origin_map);
    const y_plateau = (pos == 'top') ? top - global_config.depth_margin / 2 : bottom + global_config.depth_margin / 2;
    
    // draw sync_line
    const sync_line_from = new vec2_t(left + global_config.box_margin, y_plateau);
    const sync_line_to = new vec2_t(right - global_config.box_margin, y_plateau);
    draw_sync_line_html(new line_segment_t(sync_line_from, sync_line_to));
    
    // draw lines attached to sync_line
    if (pos == 'top') {
        for (const path of paths) {
            const to = vec2.add(origin_map.get(path.id), path.bounds.in);
            draw_line_html(new line_segment_t(new vec2_t(to.x, y_plateau), to));
        }
    }
    else if (pos == 'bottom') {
        for (const path of paths) {
            const from = vec2.add(origin_map.get(path.id), path.bounds.out);
            draw_line_html(new line_segment_t(from, new vec2_t(from.x, y_plateau)));
        }
    }
}
function draw_global_sync_line(path: path_t, paths: Set<path_t>, origin_map: Map<ID, vec2_t>, entry_map: Map<ID, any>): void {
    const pos = (path.parents.size == 0) ? 'top' : 'bottom';
    const [chart_left, chart_right] = pathset_left_right(paths, origin_map);
    let y_plateau = (pos == 'top') ?
     origin_map.get(path.id).y + path.bounds.out.y + global_config.depth_margin / 2 : 
     origin_map.get(path.id).y + path.bounds.in.y - global_config.depth_margin / 2;

    // draw sync_line
    draw_sync_line_html(new line_segment_t(new vec2_t(chart_left, y_plateau), new vec2_t(chart_right, y_plateau))); 
    
    // draw lines attached to sync_line
    if (pos == 'top') {
        for (const child of path.childs) {
            if (child.childs.size > 0) {
                const to = get_in_pos(child, origin_map, entry_map);
                draw_line(new line_segment_t(new vec2_t(to.x, y_plateau), to));
            }
        }
    }
    else if (pos == 'bottom') {
        for (const parent of path.parents) {
            if (parent.parents.size > 0) {
                const from = get_out_pos(parent, origin_map, entry_map);
                draw_line(new line_segment_t(from, new vec2_t(from.x, y_plateau)));
            }
        }
    }
}

function draw_inner_lines(paths :Set<path_t>, origin_map :Map<number, vec2_t>) {
    for (const path of paths) {
        const origin = origin_map.get(path.id);
        let last: rect_t;
        for (const curr of path.bounds.task_rects) {
            if (last != undefined) {
                draw_line_html(new line_segment_t(vec2.add(origin, last.origin), vec2.add(origin, curr.origin)));
            }
            last = curr;
        }
    }
}
function create_entry_map(paths: Set<path_t>, ignore: path_t, relative: 'childs' | 'parents'): Map<ID, any> {
    const entry_map = new Map<ID, { cook_id: number, relatives: Set<path_t>, members: Set<path_t> }>();
    for (const path of paths) {
        if (path.is_bw) {
            continue;
        }

        let found_entry = false;
        for (const entry of entry_map.values()) {
            if (entry.relatives.size != path[relative].size || entry.cook_id != path.cook_id
             || (path[relative].size == 1 && path[relative].has(ignore))) {
                continue;
            }
            let eq_entry = true;
            for (const entry_path of entry.relatives) {
                if (!path[relative].has(entry_path)) {
                    eq_entry = false;
                    break;
                }
            }
            if (eq_entry) {
                entry_map.set(path.id, entry);
                entry.members.add(path);
                found_entry = true;
                break;
            }
        }

        if (!found_entry) {
            const entry = { cook_id: path.cook_id, relatives: path[relative], members: new Set<path_t>([path]) };
            entry_map.set(path.id, entry);
        }
    }
    return entry_map;
}

function get_in_pos(path: path_t, origin_map: Map<ID, vec2_t>, in_map: Map<ID, any>): vec2_t {
    const in_paths = in_map.get(path.id).members;
    if (in_paths.size == 1) {
        return vec2.add(origin_map.get(path.id), path.bounds.in);
    }
    else {
        return new vec2_t(pathset_center(in_paths, origin_map).x, pathset_top_bottom(in_paths, origin_map)[0] - global_config.depth_margin / 2);
    }
}
function get_out_pos(path: path_t, origin_map: Map<ID, vec2_t>, out_map: Map<ID, any>): vec2_t {
    const out_paths = out_map.get(path.id).members;
    if (out_paths.size == 1) {
        return vec2.add(origin_map.get(path.id), path.bounds.out);
    }
    else {
        return new vec2_t(pathset_center(out_paths, origin_map).x, pathset_top_bottom(out_paths, origin_map)[1] + global_config.depth_margin / 2);
    }
}

export function draw_lines(paths :Set<path_t>, start :path_t, end :path_t, origin_map :Map<ID, vec2_t>): void {
    // reset line segment cache
    line_segments = new Set<line_segment_t[]>();
    // for (const path of paths) {
    //     for (const child of path.childs) {
    //         const from = vec2.add(origin_map.get(path.id), path.bounds.out);
    //         if (child.childs.size > 0) {
    //             const to = vec2.add(origin_map.get(child.id), child.bounds.in); 
    //             const y_plateau = to.y - global_config.depth_margin / 2;
    //             const mid1 = new vec2_t(from.x, y_plateau);
    //             const mid2 = new vec2_t(to.x, y_plateau);
    //             line_segments.add([new line_segment_t(from, mid1), new line_segment_t(mid1, mid2), new line_segment_t(mid2, to)]);
    //         }
    //     }
    // }

    // create in and out map
    const in_map = create_entry_map(paths, start, 'parents');
    const out_map = create_entry_map(paths, end, 'childs');

    // draw lines
    for (const path of paths) {
        if (!path.is_bw && path != start) {
            for (const child of path.childs) {
                if (!child.is_bw && child != end) {
                    draw_line(new line_segment_t(get_out_pos(path, origin_map, out_map), get_in_pos(child, origin_map, in_map)));
                }
            }
        }
    }
    // draw sync_lines
    for (const entry_in of in_map.values()) {
        if (entry_in.members.size > 1 && (entry_in.relatives.size > 1 || !entry_in.relatives.has(start))) {
            draw_sync_line(entry_in.members, "top", origin_map);
        }
    }
    for (const entry_out of out_map.values()) {
        if (entry_out.members.size > 1 && (entry_out.relatives.size > 1 || !entry_out.relatives.has(end))) {
            draw_sync_line(entry_out.members, "bottom", origin_map);
        }
    }
    
    // draw backwards lines
    for (const path of paths) {
        if (path.is_bw) {
            for (const child of path.childs) {
                if (child.is_loop_entry) {
                    const from = vec2.add(origin_map.get(path.id), path.bounds.out);
                    const mid = vec2.add(origin_map.get(path.id), path.bounds.in);
                    const to = vec2.add(origin_map.get(child.id), child.bounds.in);
                    draw_line(new line_segment_t(from, mid));
                    draw_line(new line_segment_t(mid, to));
                }
            }
            for (const parent of path.parents) {
                if (parent.is_loop_exit) {
                    const from = vec2.add(origin_map.get(path.id), path.bounds.out);
                    const mid = vec2.add(vec2.add(origin_map.get(parent.id), parent.bounds.out), new vec2_t(0, global_config.depth_margin));
                    const to = vec2.add(origin_map.get(parent.id), parent.bounds.out);
                    draw_line(new line_segment_t(from, mid));
                    draw_line(new line_segment_t(mid, to));
                }
            }
        }
    }
    
    // draw global sync_lines
    draw_global_sync_line(start, paths, origin_map, in_map);
    draw_global_sync_line(end, paths, origin_map, out_map);
    // draw inner lines
    draw_inner_lines(paths, origin_map);
    // draw crossings
    for (const lines1 of line_segments) {
        console.log(...lines1)
        for (const lines2 of line_segments) {
            if (lines1 == lines2) {
                continue;
            }
            for (const l1 of lines1) {
                for (const l2 of lines2) {
                    const intersection = line_intersection(l1, l2);
                    if (intersection !== null) {
                        global_config.crossing_html.style.left = intersection.x.toString() + "px";
                        global_config.crossing_html.style.top = intersection.y.toString() + "px";
                        global_config.chart_container_html.appendChild(global_config.crossing_html.cloneNode(false));
                    }
                }
            }
        }
    }

}
