export function Includes<T>(arr: T[], cmp_func: (val: T) => boolean): boolean {
    for (const val of arr) {
        if (cmp_func(val))
            return true;
    }
    return false;
}

export function PrimitiveEquals<T>(ptr1: T, ptr2: T): boolean {
    return ptr1 == ptr2;
}
export function ObjEquals<T extends object>(obj1: T, obj2: T): boolean {
    for (const key in obj1) {
        if (obj1[key] !== obj2[key])
            return false;
    }
    return true;
}

export function PrimitiveEqualsFunc<T>(ptr: T): (to_cmp: T) => boolean {
    return (to_cmp: T) => { return PrimitiveEquals(ptr, to_cmp); };
}
export function ObjEqualsFunc<T extends object>(obj: T): (to_cmp: T) => boolean {
    return (to_cmp: T) => { return ObjEquals(obj, to_cmp); };
}

export function AtIndex<T>(arr: T[], index: number): T {
    if (index >= 0)
        return arr[index];
    else 
        return arr[arr.length + index];
}
export function LastElem<T>(arr: T[]): T {
    return arr[arr.length - 1];
}

export function RemoveObj<T extends object>(arr: T[], obj: T): T[] {
    return arr.filter((obj2: T) => { return !ObjEquals(obj, obj2); });
}
export function RemovePrimitive<T>(arr: T[], ptr: T): T[] {
    return arr.filter((ptr2: T) => { return !PrimitiveEquals(ptr, ptr2); });
}