import { permutate } from "../../utils/permutate.js";
import { vec2, vec2_t } from "../../utils/vec2.js";
import { graph_t } from "../graph.js";
import { hash_str, ID } from "../hash_str.js";
import { line_intersection, line_segment_t } from "../line_segment.js";
import { has_path, path_t } from "../path.js";
import { alignment } from "./alignment.js";
import { create_origin_map_y } from "./create_origin_map_y.js";

function create_depth_alignment(depth: number, graph: graph_t): alignment.type {
    const members = [];
    for (const path of graph.depth_levels[depth]) {
        if (graph.get_diff_max(path) <= 1 && (!path.in_loop || has_path(path, graph.start))) {
            members.push(alignment.create(path));
        }
    }
    return alignment.create("hor", members);
}
function create_graph_alignment(graph: graph_t): alignment.type {
    if (graph.cook_count > 1) {
        const cook_aligns = [];
        for (let cook_id = 0; cook_id < graph.cook_count; ++cook_id) {
            cook_aligns.push(create_graph_alignment(graph.get_cook_graph(cook_id)));
        }
        return alignment.create("ver", [alignment.create(graph.start), alignment.create("hor", cook_aligns), alignment.create(graph.end)]);
    }
    else {
        const depth_aligns = [];
        const end_depth_map = new Map<number, alignment.type[]>();
        for (let depth = 0; depth <= graph.depth; ++depth) {
            depth_aligns.push(create_depth_alignment(depth, graph));
            end_depth_map.set(depth, []);
        }

        for (const path of graph.paths) {
            if (graph.get_diff_max(path) > 1 && (!path.in_loop || has_path(path, graph.start))) {
                end_depth_map.get(graph.get_depth(path) + graph.get_diff_max(path) - 1).push(alignment.create(path));
            }
        }
        for (const [id, loop_graph] of graph.loop_graphs) {
            const align = create_graph_alignment(loop_graph);
            if (loop_graph.depth == 0) {
                if (depth_aligns[graph.get_depth(loop_graph.start)] === null) {
                    depth_aligns[graph.get_depth(loop_graph.start)] = align;
                }
                else {
                    depth_aligns[graph.get_depth(loop_graph.start)].members.push(align);
                }
            }
            else {
                end_depth_map.get(graph.get_depth(loop_graph.end)).push(align);
            }
        }

        let align = null;
        for (let depth = 0; depth <= graph.depth; ++depth) {
            align = alignment.create("ver", [align, depth_aligns[depth]]);
            align = alignment.create("hor", [align, ...end_depth_map.get(depth)]);
        }
        return align;
    }
}

function create_permuation_list(align: alignment.type, list: alignment.type[][] = []) {
    list.push(align.members);
    for (const member of align.members) {
        create_permuation_list(member, list);
    }
    return list;
}

function eval_permutation(paths: Set<path_t>, origin_map_x: Map<ID, number>, origin_map_y: Map<ID, number>): number {
    let eval_x = 0;
    const lineset = new Set<line_segment_t[]>;
    for (const path of paths) {
        if (path.parents.size == 0) {
            continue;
        }

        const lines = [];
        const top_left = new vec2_t(origin_map_x.get(path.id) - path.bounds.size.x / 2, origin_map_y.get(path.id));
        const bottom_right = vec2.add(top_left, path.bounds.size);
        const top_right = vec2.add(top_left, new vec2_t(path.bounds.size.x, 0));
        const bottom_left = vec2.add(top_left, new vec2_t(0, path.bounds.size.y));
        lines.push(new line_segment_t(top_left, top_right));
        lines.push(new line_segment_t(top_left, bottom_left));
        lines.push(new line_segment_t(bottom_right, top_right));
        lines.push(new line_segment_t(bottom_right, bottom_left));
        for (const child of path.childs) {
            if (child.childs.size >= 0) {
                const from = vec2.add(new vec2_t(origin_map_x.get(path.id), origin_map_y.get(path.id)), path.bounds.out);
                const to = vec2.add(new vec2_t(origin_map_x.get(child.id), origin_map_y.get(child.id)), child.bounds.in); 
                const mid = new vec2_t(from.x, to.y);
                lines.push(new line_segment_t(from, mid));
                lines.push(new line_segment_t(mid, to));
            }
        }
        lineset.add(lines);
    }
    for (const lines1 of lineset) {
        for (const lines2 of lineset) {
            if (lines1 == lines2) {
                continue;
            }
            for (const l1 of lines1) {
                for (const l2 of lines2) {
                    if (line_intersection(l1, l2) !== null) {
                        eval_x += 1;
                    }
                }
            }
        }
    }
    console.log("EVAL", eval_x);
    return eval_x;
}
function set_origin_map_x(align: alignment.type, off_x: number, origin_map_x: Map<ID, number>): void {
    if (typeof align.type == "object") {
        origin_map_x.set(align.type.id, off_x);
    }
    for (let i = 0; i < align.members.length; ++i) {
        set_origin_map_x(align.members[i], off_x + alignment.get_member_off_x(align, i), origin_map_x);
    }
}

export function create_origin_map_x(graph: graph_t): Map<ID, number> {
    const align = create_graph_alignment(graph);

    const origin_map_x = new Map<ID, number>();
    for (const path of graph.paths) {
        origin_map_x.set(path.id, -500);
    }
        
    let best_eval_x = Infinity;
    let best_align = null as alignment.type;

    const origin_map_y = create_origin_map_y(graph);
    const permutation_list = create_permuation_list(align);
    permutate.permutate_multiple_lists(permutation_list, () => {
        set_origin_map_x(align, 0, origin_map_x);
        const eval_x = eval_permutation(graph.paths, origin_map_x, origin_map_y);
        if (eval_x < best_eval_x) {
            best_eval_x = eval_x;
            best_align = alignment.copy(align);
        }
    }, () => {
        if (best_eval_x == 0) {
            return true;
        }
        else {
            return false;
        }
    });

    set_origin_map_x(best_align, 0, origin_map_x);
    return origin_map_x;
}