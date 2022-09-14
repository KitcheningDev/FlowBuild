export function Includes<T>(arr: T[], cmp_func: (val: T) => boolean): boolean {
    for (const val of arr) {
        if (cmp_func(val))
            return true;
    }
    return false;
}

export function PtrEquals<T>(ptr1: T, ptr2: T): boolean {
    return ptr1 == ptr2;
}
export function ObjEquals<T>(obj1: T, obj2: T): boolean {
    for (const key in obj1) {
        if (obj1[key] !== obj2[key])
            return false;
    }
    return true;
}
export function ArrEquals<T>(arr1: T[], arr2: T[]): boolean {
    if (arr1.length != arr2.length)
        return false;
    for (let i = 0; i < arr1.length; ++i) {
        if (arr1[i] != arr2[i])
            return false;
    }
    return true;
}
export function PtrEqualsFunc<T>(ptr: T): (to_cmp: T) => boolean {
    return (to_cmp: T) => { return PtrEquals(ptr, to_cmp); };
}
export function ObjEqualsFunc<T>(obj: T): (to_cmp: T) => boolean {
    return (to_cmp: T) => { return ObjEquals(obj, to_cmp); };
}
export function ArrEqualsFunc<T>(arr: T[]): (to_cmp: T[]) => boolean {
    return (to_cmp: T[]) => { return ArrEquals(arr, to_cmp); };
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
export function RemoveObj<T>(arr: T[], obj: T): T[] {
    return arr.filter((obj2: T) => { return !ObjEquals(obj, obj2); });
}
export function RemovePtr<T>(arr: T[], ptr: T): T[] {
    return arr.filter((ptr2: T) => { return !PtrEquals(ptr, ptr2); });
}