import { vec2_t, vec2 } from "../utils/vec2.js";
import { global_config } from "./config.js";
import { get_chart_min_max_x } from "./get_chart_size.js";
function get_top_bottom(paths, origin_map) {
    const out = { top: 9999, bottom: -9999 };
    for (const path of paths) {
        const origin_y = origin_map.get(path.id).y;
        out.top = Math.min(origin_y - path.bounds.in.y, out.top);
        out.bottom = Math.max(origin_y + path.bounds.out.y, out.bottom);
    }
    return out;
}
function get_left_right(paths, origin_map) {
    const out = { left: 9999, right: -9999 };
    for (const path of paths) {
        const origin_x = origin_map.get(path.id).x;
        out.left = Math.min(origin_x - path.bounds.size.x / 2, out.left);
        out.right = Math.max(origin_x + path.bounds.size.x / 2, out.right);
    }
    return out;
}
function center_x(paths, origin_map) {
    const left_right = get_left_right(paths, origin_map);
    return (left_right.right + left_right.left) / 2;
}
function draw_line_html(from, to, target) {
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
function draw_sync_line(paths, pos, origin_map) {
    const left_right = get_left_right(paths, origin_map);
    const top_bottom = get_top_bottom(paths, origin_map);
    const y_plateau = pos == "bottom" ? top_bottom.bottom + global_config.depth_margin / 2 : top_bottom.top - global_config.depth_margin / 2;
    draw_line_html(new vec2_t(left_right.left, y_plateau), new vec2_t(left_right.right, y_plateau), global_config.sync_line_html);
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
function draw_line(from, to) {
    const y_plateau = to.y - global_config.depth_margin / 2;
    draw_line_html(from, new vec2_t(from.x, y_plateau), global_config.line_html);
    draw_line_html(new vec2_t(from.x, y_plateau), new vec2_t(to.x, y_plateau), global_config.line_html);
    draw_line_html(new vec2_t(to.x, y_plateau), to, global_config.line_html);
}
function draw_inner_lines(paths, origin_map) {
    for (const path of paths) {
        const origin = origin_map.get(path.id);
        let last;
        for (const curr of path.bounds.task_rects) {
            if (last != undefined) {
                draw_line_html(vec2.add(origin, last.origin), vec2.add(origin, curr.origin), global_config.line_html);
            }
            last = curr;
        }
    }
}
function create_entry_map(paths, relative) {
    const entry_map = new Map();
    for (const path of paths) {
        if (path.is_bw) {
            continue;
        }
        // in
        let found_entry = false;
        for (const entry of entry_map.values()) {
            if (entry.relatives.size != path[relative].size) {
                continue;
            }
            let eq_entry = true;
            for (const entry_path of entry.relatives) {
                if (!path[relative].has(entry_path)) {
                    eq_entry = false;
                    break;
                }
            }
            if (entry.cook_id == path.cook_id && eq_entry) {
                entry_map.set(path.id, entry);
                entry.paths.add(path);
                found_entry = true;
                break;
            }
        }
        if (!found_entry && path[relative == 'childs' ? 'parents' : 'childs'].size > 0) {
            const entry = { cook_id: path.cook_id, relatives: path[relative], paths: new Set() };
            entry.paths.add(path);
            entry_map.set(path.id, entry);
        }
    }
    return entry_map;
}
export function draw_lines(paths, start, end, origin_map) {
    draw_inner_lines(paths, origin_map);
    const in_map = create_entry_map(paths, 'parents');
    const out_map = create_entry_map(paths, 'childs');
    // in
    for (const [id, entry_in] of in_map) {
        if (entry_in.paths.size == 1) {
            for (const parent of entry_in.relatives) {
                if (parent.parents.size == 0) {
                    continue;
                }
                const origin = origin_map.get(id);
                const parent_origin = origin_map.get(parent.id);
                console.log(parent.id, start.id, end.id);
                const from_paths = out_map.get(parent.id).paths;
                const [path] = entry_in.paths;
                if (from_paths.size > 1) {
                    draw_line(new vec2_t(center_x(from_paths, origin_map), get_top_bottom(from_paths, origin_map).bottom + global_config.depth_margin / 2), vec2.add(origin, path.bounds.in));
                }
                else {
                    draw_line(vec2.add(parent_origin, parent.bounds.out), vec2.add(origin, path.bounds.in));
                }
            }
        }
        else {
            console.log("ENTRY_IN", entry_in);
            draw_sync_line(entry_in.paths, "top", origin_map);
        }
    }
    // out
    for (const [id, entry_out] of out_map) {
        if (entry_out.paths.size == 1) {
            for (const child of entry_out.relatives) {
                if (child.childs.size == 0) {
                    continue;
                }
                const origin = origin_map.get(id);
                const child_origin = origin_map.get(child.id);
                const to_paths = in_map.get(child.id).paths;
                const [path] = entry_out.paths;
                if (to_paths.size > 1) {
                    draw_line(vec2.add(origin, path.bounds.out), new vec2_t(center_x(to_paths, origin_map), get_top_bottom(to_paths, origin_map).top - global_config.depth_margin / 2));
                }
                else {
                    draw_line(vec2.add(origin, path.bounds.out), vec2.add(child_origin, child.bounds.in));
                }
            }
        }
        else {
            console.log("ENTRY_OUT", entry_out);
            draw_sync_line(entry_out.paths, "bottom", origin_map);
        }
    }
    // start end
    const min_max_x = get_chart_min_max_x(paths, origin_map);
    const y_plateu_start = get_top_bottom(start.childs, origin_map).top - global_config.depth_margin / 2;
    const y_plateu_end = get_top_bottom(end.parents, origin_map).bottom + global_config.depth_margin / 2;
    draw_line_html(new vec2_t(min_max_x.x, y_plateu_start), new vec2_t(min_max_x.y, y_plateu_start), global_config.sync_line_html);
    draw_line_html(new vec2_t(min_max_x.x, y_plateu_end), new vec2_t(min_max_x.y, y_plateu_end), global_config.sync_line_html);
    for (const child of start.childs) {
        const to = vec2.add(origin_map.get(child.id), child.bounds.in);
        draw_line(new vec2_t(to.x, y_plateu_start), to);
    }
    for (const parent of end.parents) {
        const entry_paths = out_map.get(parent.id).paths;
        let from;
        if (entry_paths.size == 1) {
            from = vec2.add(origin_map.get(parent.id), parent.bounds.in);
        }
        else {
            if (entry_paths.size == end.parents.size) {
                continue;
            }
            from = new vec2_t(center_x(entry_paths, origin_map), get_top_bottom(entry_paths, origin_map).bottom + global_config.depth_margin / 2);
        }
        draw_line(from, new vec2_t(from.x, get_top_bottom(end.parents, origin_map).bottom + global_config.depth_margin / 2));
    }
}
//# sourceMappingURL=draw_line.js.map