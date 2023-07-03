// id
export type ID = number;
// bounds
export const MinID = 1000;
export const MaxID = 1000000;
export function randomID(): number {
    return Math.floor(MinID + Math.random() * MaxID);
}
export class ObjID {
    constructor() {
        this.id = randomID();
    }
    // member
    readonly id: ID;
}