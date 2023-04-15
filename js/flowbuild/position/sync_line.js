import { ObjID } from "../../utils/obj_id.js";
export class SyncLine extends ObjID {
    constructor(node, where) {
        super();
        this.where = where;
        this.members = new Set();
        if (where == 'top') {
            for (const parent of node.parents) {
                for (const child of parent.childs) {
                    if (child.task.cook == node.task.cook) {
                        this.members.add(child);
                    }
                }
            }
        }
        else if (where == 'bottom') {
            for (const child of node.childs) {
                for (const parent of child.parents) {
                    if (parent.task.cook == node.task.cook) {
                        this.members.add(parent);
                    }
                }
            }
        }
    }
    equals(other) {
        if (this.members.size != other.members.size) {
            return false;
        }
        for (const member of this.members) {
            if (!other.members.has(member)) {
                return false;
            }
        }
        return true;
    }
}
;
export function has_sync_line(node, where) {
    if (where == 'top') {
        for (const parent of node.parents) {
            for (const child of parent.childs) {
                if (child != node && child.task.cook == node.task.cook) {
                    return true;
                }
            }
        }
    }
    else if (where == 'bottom') {
        for (const child of node.childs) {
            for (const parent of child.parents) {
                if (parent != node && parent.task.cook == node.task.cook) {
                    return true;
                }
            }
        }
    }
    return false;
}
//# sourceMappingURL=sync_line.js.map