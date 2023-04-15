import { ObjID } from "../../utils/obj_id.js";
export class Cook extends ObjID {
    constructor(name) {
        super();
        this.name = name;
    }
    is_empty() {
        return this.name == '';
    }
}
let cook_map = new Map();
export function get_cook(str) {
    if (!cook_map.has(str)) {
        cook_map.set(str, new Cook(str));
    }
    return cook_map.get(str);
}
//# sourceMappingURL=cook.js.map