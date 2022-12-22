import { permutate } from "../../utils/permutate";
import { alignment } from "./alignment.js";
function create_depth_alignment(depth, graph) {
    const members = [];
    for (const path of graph.depth_levels[depth]) {
        if (graph.get_diff_max(path) <= 1 && !path.in_loop) {
            members.push(alignment.create(path));
        }
    }
    return alignment.create("hor", members);
}
function create_graph_alignment(graph) {
    if (graph.cook_count > 1) {
        const cook_aligns = [];
        for (let cook_id = 0; cook_id < graph.cook_count; ++cook_id) {
            cook_aligns.push(create_graph_alignment(graph.get_cook_graph(cook_id)));
        }
        return alignment.create("ver", [alignment.create(graph.start), alignment.create("hor", cook_aligns), alignment.create(graph.end)]);
    }
    else {
        const depth_aligns = [];
        const end_depth_map = new Map();
        for (let depth = 0; depth <= graph.depth; ++depth) {
            depth_aligns.push(create_depth_alignment(depth, graph));
            end_depth_map.set(depth, []);
        }
        for (const path of graph.paths) {
            if (graph.get_diff_max(path) > 1 && !path.in_loop) {
                end_depth_map.get(graph.get_depth(path) + graph.get_diff_max(path) - 1).push(alignment.create(path));
            }
        }
        for (const [id, loop_graph] of graph.loop_graphs) {
            end_depth_map.get(graph.get_depth(loop_graph.end)).push(create_graph_alignment(loop_graph));
        }
        let align = null;
        for (let depth = 0; depth <= graph.depth; ++depth) {
            align = alignment.create("ver", [align, depth_aligns[depth]]);
            align = alignment.create("hor", [align, ...end_depth_map.get(depth)]);
        }
        return align;
    }
}
function create_permuation_list(align, list = []) {
    list.push(align.members);
    for (const member of align.members) {
        create_permuation_list(member, list);
    }
    return list;
}
function eval_permutation(paths, origin_map_x) {
    let eval_x = 0;
    for (const path of paths) {
        for (const child of path.childs) {
            eval_x += Math.abs(origin_map_x.get(child.id) + child.bounds.in.x - origin_map_x.get(path.id) - path.bounds.out.x);
        }
    }
    return eval_x;
}
function set_origin_map_x(align, off_x, origin_map_x) {
    if (typeof align.type == "object") {
        origin_map_x.set(align.type.id, off_x);
    }
    for (let i = 0; i < align.members.length; ++i) {
        set_origin_map_x(align.members[i], off_x + alignment.get_member_off_x(align, i), origin_map_x);
    }
}
export function create_origin_map_x(graph) {
    const align = create_graph_alignment(graph);
    const origin_map_x = new Map();
    for (const path of graph.paths) {
        origin_map_x.set(path.id, -500);
    }
    console.log(align);
    let best_eval_x = Infinity;
    let best_align = null;
    const permutation_list = create_permuation_list(align);
    permutate.permutate_multiple_lists(permutation_list, () => {
        set_origin_map_x(align, 0, origin_map_x);
        const eval_x = eval_permutation(graph.paths, origin_map_x);
        if (eval_x < best_eval_x) {
            best_eval_x = eval_x;
            best_align = alignment.copy(align);
        }
    });
    set_origin_map_x(best_align, 0, origin_map_x);
    console.log("FINAL EVAL", eval_permutation(graph.paths, origin_map_x));
    return origin_map_x;
}
//# sourceMappingURL=create_origin_map_x.js.map