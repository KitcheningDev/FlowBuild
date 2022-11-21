import { rect_t } from "../utils/rect.js";
import { vec2_t, vec2 } from "../utils/vec2.js";
import { global_config } from "./config.js";
import { get_chart_left_right } from "./get_chart_size.js";
import { ID } from "./hash_str.js";
import { path_t } from "./path.js";

function get_top_bottom(paths: Set<path_t>, origin_map: Map<ID, vec2_t>): number[] {
    let top = Infinity;
    let bottom = -Infinity;
    for (const path of paths) {
        const origin_y = origin_map.get(path.id).y;
        top = Math.min(origin_y - path.bounds.in.y, top);
        bottom = Math.max(origin_y + path.bounds.out.y, bottom);
    }
    return [top, bottom];
}
function get_left_right(paths: Set<path_t>, origin_map: Map<ID, vec2_t>): number[] {
    let left = Infinity;
    let right = -Infinity;
    for (const path of paths) {
        const origin_x = origin_map.get(path.id).x;
        left = Math.min(origin_x - path.bounds.size.x / 2, left);
        right = Math.max(origin_x + path.bounds.size.x / 2, right);
    }
    return [left, right];
}
function get_center_x(paths: Set<path_t>, origin_map: Map<ID, vec2_t>): number {
    const [left, right] = get_left_right(paths, origin_map);
    return (left + right) / 2;
}

function draw_line_html(from: vec2_t, to: vec2_t, target: HTMLElement): void {
    if (vec2.equals(from, to)) {
        return;
    }
    const center = vec2.div_scal(vec2.add(from, to), 2);
    const size = vec2.sub(from, to).abs();

    target.style.left = center.x.toString() + "px";
    target.style.top = center.y.toString() + "px";
    if (from.y == to.y) {
        target.style.width = size.x.toString() + "px";
        target.style.height = "0px";
    }
    else if (from.x == to.x) {
        target.style.width = "0px";
        target.style.height = size.y.toString() + "px";
    }
    global_config.chart_container_html.appendChild(target.cloneNode(false));
}

function draw_sync_line(paths: Set<path_t>, pos: "top" | "bottom", origin_map: Map<ID, vec2_t>): void {
    const [left, right] = get_left_right(paths, origin_map);
    const [top, bottom] = get_top_bottom(paths, origin_map);
    const y_plateau = (pos == "bottom") ? bottom + global_config.depth_margin / 2 : top - global_config.depth_margin / 2;
    draw_line_html(new vec2_t(left + global_config.box_margin * 2, y_plateau), new vec2_t(right - global_config.box_margin, y_plateau), global_config.sync_line_html);
    for (const path of paths) {
        if (pos == "top") {
            const to = vec2.add(origin_map.get(path.id), path.bounds.in);
            draw_line(new vec2_t(to.x, y_plateau), to);
        }
        else if (pos == "bottom") {
            const from = vec2.add(origin_map.get(path.id), path.bounds.out);
            draw_line(from, new vec2_t(from.x, y_plateau));
        }
    }
}
function draw_global_line(path: path_t, paths: path_t[], origin_map: Map<ID, vec2_t>, entry_map: Map<ID, any>): void {
    const [chart_left, chart_right] = get_chart_left_right(paths, origin_map);
    let y_plateau = null;
    if (path.parents.size == 0) {
        y_plateau = origin_map.get(path.id).y + path.bounds.out.y + global_config.depth_margin / 2;
    }
    else {
        y_plateau = origin_map.get(path.id).y + path.bounds.in.y - global_config.depth_margin / 2;
    }
    draw_line_html(new vec2_t(chart_left, y_plateau), new vec2_t(chart_right, y_plateau), global_config.sync_line_html);
    
    if (path.parents.size == 0) {
        for (const child of path.childs) {
            if (child.childs.size > 0) {
                const to = get_in_pos(child, origin_map, entry_map);
                draw_line(new vec2_t(to.x, y_plateau), to);
            }
        }
    }
    else {
        for (const parent of path.parents) {
            if (parent.parents.size > 0) {
                const from = get_out_pos(parent, origin_map, entry_map);
                draw_line(from, new vec2_t(from.x, y_plateau));
            }
        }
    }
}
function draw_line(from: vec2_t, to: vec2_t): void {
    const y_plateau = to.y - global_config.depth_margin / 2;
    draw_line_html(from, new vec2_t(from.x, y_plateau), global_config.line_html);
    draw_line_html(new vec2_t(from.x, y_plateau), new vec2_t(to.x, y_plateau), global_config.line_html);
    draw_line_html(new vec2_t(to.x, y_plateau), to, global_config.line_html);
}

function draw_inner_lines(paths :path_t[], origin_map :Map<number, vec2_t>) {
    for (const path of paths) {
        const origin = origin_map.get(path.id);
        let last: rect_t;
        for (const curr of path.bounds.task_rects) {
            if (last != undefined) {
                draw_line_html(vec2.add(origin, last.origin), vec2.add(origin, curr.origin), global_config.line_html);
            }
            last = curr;
        }
    }
}
function create_entry_map(paths: path_t[], ignore: path_t, relative: 'childs' | 'parents'): Map<ID, any> {
    const entry_map = new Map<ID, { cook_id: number, relatives: Set<path_t>, paths: Set<path_t> }>();
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
                entry.paths.add(path);
                found_entry = true;
                break;
            }
        }

        if (!found_entry) {
            const entry = { cook_id: path.cook_id, relatives: path[relative], paths: new Set<path_t>([path]) };
            entry_map.set(path.id, entry);
        }
    }
    return entry_map;
}

function get_in_pos(path: path_t, origin_map: Map<ID, vec2_t>, in_map: Map<ID, any>): vec2_t {
    const in_paths = in_map.get(path.id).paths;
    if (in_paths.size == 1) {
        return vec2.add(origin_map.get(path.id), path.bounds.in);
    }
    else {
        return new vec2_t(get_center_x(in_paths, origin_map), get_top_bottom(in_paths, origin_map)[0] - global_config.depth_margin / 2);
    }
}
function get_out_pos(path: path_t, origin_map: Map<ID, vec2_t>, out_map: Map<ID, any>): vec2_t {
    const out_paths = out_map.get(path.id).paths;
    if (out_paths.size == 1) {
        return vec2.add(origin_map.get(path.id), path.bounds.out);
    }
    else {
        return new vec2_t(get_center_x(out_paths, origin_map), get_top_bottom(out_paths, origin_map)[1] + global_config.depth_margin / 2);
    }
}

export function draw_lines(paths :path_t[], start :path_t, end :path_t, origin_map :Map<ID, vec2_t>): void {
    draw_inner_lines(paths, origin_map);
    const in_map = create_entry_map(paths, start, 'parents');
    const out_map = create_entry_map(paths, end, 'childs');

    for (const path of paths) {
        if (!path.is_bw && path != start) {
            for (const child of path.childs) {
                if (!child.is_bw && child != end) {
                    draw_line(get_out_pos(path, origin_map, out_map), get_in_pos(child, origin_map, in_map));
                }
            }
        }
    }
    for (const entry_in of in_map.values()) {
        if (entry_in.paths.size > 1 && (entry_in.relatives.size > 1 || !entry_in.relatives.has(start))) {
            draw_sync_line(entry_in.paths, "top", origin_map);
        }
    }
    for (const entry_out of out_map.values()) {
        if (entry_out.paths.size > 1 && (entry_out.relatives.size > 1 || !entry_out.relatives.has(end))) {
            draw_sync_line(entry_out.paths, "bottom", origin_map);
        }
    }
    
    for (const path of paths) {
        if (path.is_bw) {
            for (const child of path.childs) {
                if (child.is_loop_entry) {
                    const mid = vec2.add(origin_map.get(path.id), path.bounds.in);
                    draw_line(vec2.add(origin_map.get(path.id), path.bounds.out), mid);
                    draw_line(mid, vec2.add(origin_map.get(child.id), child.bounds.in));
                }
            }
            for (const parent of path.parents) {
                if (parent.is_loop_exit) {
                    const mid = vec2.add(vec2.add(origin_map.get(parent.id), parent.bounds.out), new vec2_t(0, global_config.depth_margin));
                    draw_line(mid, vec2.add(origin_map.get(parent.id), parent.bounds.out));
                    draw_line(vec2.add(origin_map.get(path.id), path.bounds.out), mid);
                }
            }
        }
    }

    draw_global_line(start, paths, origin_map, in_map);
    draw_global_line(end, paths, origin_map, out_map);

    // start end
    // const min_max_x = get_chart_min_max_x(paths, origin_map);
    // const y_plateu_start = origin_map.get(start.id).y + start.bounds.out.y + global_config.depth_margin / 2;
    // const y_plateu_end = origin_map.get(end.id).y + end.bounds.in.y - global_config.depth_margin / 2;
    // draw_line_html(new vec2_t(min_max_x.x, y_plateu_start), new vec2_t(min_max_x.y, y_plateu_start), global_config.sync_line_html);
    // draw_line_html(new vec2_t(min_max_x.x, y_plateu_end), new vec2_t(min_max_x.y, y_plateu_end), global_config.sync_line_html);
    // for (const child of start.childs) {
    //     if (child == end) {
    //         continue;
    //     }
    //     let to;
    //     const paths_in = in_map.get(child.id);
    //     if (paths_in.size == 1) {
    //         to = vec2.add(origin_map.get(child.id), child.bounds.in);
    //     }
    //     else {
    //         to = new vec2_t(center_x(to_paths, origin_map), get_top_bottom(to_paths, origin_map)[0] - global_config.depth_margin / 2);
    //     }
    //     draw_line(new vec2_t(to.x, y_plateu_start), to);
    // }
    // for (const parent of end.parents) {
    //     if (parent == start) {
    //         continue;
    //     }
    //     const entry_paths = out_map.get(parent.id).paths;
    //     let from:vec2_t;
    //     if (entry_paths.size == 1) {
    //         from = vec2.add(origin_map.get(parent.id), parent.bounds.in);
    //     }
    //     else {
    //         if (entry_paths.size == end.parents.size) {
    //             continue;
    //         }
    //         from = new vec2_t(center_x(entry_paths, origin_map), get_top_bottom(entry_paths, origin_map)[1] + global_config.depth_margin / 2);
    //     }
    //     draw_line(from, new vec2_t(from.x, y_plateu_end));
    // }
}
