import { permutate } from "../../utils/permutate.js";
import { alignment } from "./alignment.js";
function create_depth_alignment(depth_paths, cook_id, end) {
    const filtered = new Set();
    for (const path of depth_paths) {
        if (path.cook_id == cook_id && path.cook_depth_diff_max <= 1) {
            filtered.add(path);
        }
    }
    const members = [];
    filtered.forEach((path) => { members.push(alignment.create(path)); });
    return alignment.create('hor', members);
}
function recursive_create_alignment(depth, graph, cook_id) {
    if (depth == 0) {
        return create_depth_alignment(new Set([graph.start]), cook_id, graph.end);
    }
    const last_align = recursive_create_alignment(depth - 1, graph, cook_id);
    const depth_align = create_depth_alignment(graph.depth_map[depth], cook_id, graph.end);
    const ver_align = alignment.create('ver', [last_align, depth_align]);
    const members = [ver_align];
    for (const path of graph.paths) {
        let diff = path.childs.has(graph.end) ? graph.depth - path.depth : path.cook_depth_diff_max;
        if (path.cook_id == cook_id && diff > 1 && path.depth + diff == depth + 1) {
            members.push(alignment.create(path));
        }
    }
    if (depth_align == null && last_align != null) {
        if (members.length > 1 && last_align.depth == members[1].depth) {
            return alignment.create('hor', members);
        }
        members.shift();
        return alignment.create('ver', [ver_align, alignment.create('hor', members)]);
    }
    else {
        return alignment.create('hor', members);
    }
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
function recursive_set_origin_map_x(align, off_x, origin_map_x) {
    if (typeof align.type == "object") {
        origin_map_x.set(align.type.id, off_x);
    }
    for (let i = 0; i < align.members.length; ++i) {
        recursive_set_origin_map_x(align.members[i], off_x + alignment.get_member_off_x(align, i), origin_map_x);
    }
}
function recursive_add_to_permutate_list(align, permutate_list) {
    if (align.type == 'hor') {
        permutate_list.push(align.members);
    }
    for (const member of align.members) {
        recursive_add_to_permutate_list(member, permutate_list);
    }
}
export function create_origin_map_x(recipe) {
    const graph = recipe.graph;
    let align;
    if (recipe.cook_count > 1) {
        const cook_aligns = [];
        for (let cook_id = 0; cook_id < recipe.cook_count; ++cook_id) {
            cook_aligns.push(recursive_create_alignment(graph.depth, graph, cook_id));
        }
        align = alignment.create('ver', [alignment.create(graph.start), alignment.create('hor', cook_aligns), alignment.create(graph.end)]);
    }
    else {
        align = recursive_create_alignment(graph.depth, graph, -1);
    }
    const origin_map_x = new Map();
    for (const path of graph.paths) {
        origin_map_x.set(path.id, -500);
    }
    console.log(align);
    // permutation
    const permutate_list = [];
    for (const member of align.members) {
        recursive_add_to_permutate_list(member, permutate_list);
    }
    let best_eval_x = 999999;
    let best_align = null;
    permutate.permutate_multiple_lists(permutate_list, () => {
        recursive_set_origin_map_x(align, 0, origin_map_x);
        const eval_x = eval_permutation(graph.paths, origin_map_x);
        if (eval_x < best_eval_x) {
            best_eval_x = eval_x;
            best_align = alignment.copy(align);
        }
    });
    recursive_set_origin_map_x(best_align, 0, origin_map_x);
    console.log("FINAL EVAL", eval_permutation(graph.paths, origin_map_x));
    return origin_map_x;
}
//# sourceMappingURL=create_origin_map_x_.js.map