import { eq_set } from "../../utils/funcs.js";
function is_isolated_path(path) {
    if (path.parents.size == 0 || path.is_bw) {
        return true;
    }
    else if (path.parents.size == 1) {
        const [parent] = path.parents;
        if (parent.parents.size == 0) {
            console.log(path.head.str, "ISOLATED");
            return true;
        }
    }
    return false;
}
export function create_eq_group_map(paths, share) {
    const eq_groups = new Map();
    for (const path of paths) {
        let found_entry = false;
        if (!is_isolated_path(path)) {
            for (const eq_group of eq_groups.values()) {
                if (eq_group.members.length == 1 && is_isolated_path(eq_group.members[0])) {
                    continue;
                }
                if (eq_group.cook_id == path.cook_id && eq_set(eq_group.shared, path[share])) {
                    eq_group.members.push(path);
                    eq_groups.set(path, eq_group);
                    found_entry = true;
                    break;
                }
            }
        }
        if (!found_entry) {
            eq_groups.set(path, { members: [path], cook_id: path.cook_id, shared: path[share] });
        }
    }
    return eq_groups;
}
export function create_eq_groups(paths, share) {
    return new Set(create_eq_group_map(paths, share).values());
}
//# sourceMappingURL=eq_group.js.map