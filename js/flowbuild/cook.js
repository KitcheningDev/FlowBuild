import { ObjID } from "../utils/obj_id.js";
export class Cook extends ObjID {
    constructor(name) {
        super();
        this.name = name;
    }
    is_empty() {
        return this.name == '';
    }
}
//# sourceMappingURL=cook.js.map