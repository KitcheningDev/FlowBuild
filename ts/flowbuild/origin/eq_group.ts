import { eq_set } from "../../utils/funcs.js";
import { path_t } from "../path.js";
import { ID } from "../task.js";

export interface eq_group_t {
    members: path_t[];
    cook_id: ID;
    shared: Set<path_t>;
}
function is_isolated_path(path: path_t): boolean {
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
export function create_eq_group_map(paths: Set<path_t>, share: 'parents' | 'childs'): Map<path_t, eq_group_t> {
    const eq_groups = new Map<path_t, eq_group_t>();
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
            eq_groups.set(path, { members: [path], cook_id: path.cook_id, shared: path[share] } as eq_group_t)
        }
    }
    return eq_groups;
}
export function create_eq_groups(paths: Set<path_t>, share: 'parents' | 'childs'): Set<eq_group_t> {
    return new Set(create_eq_group_map(paths, share).values());
}