// bounds
export const MinID = 1000;
export const MaxID = 1000000;
export function randomID() {
    return Math.floor(MinID + Math.random() * MaxID);
}
export class ObjID {
    constructor() {
        this.id = randomID();
    }
}
//# sourceMappingURL=obj_id.js.map