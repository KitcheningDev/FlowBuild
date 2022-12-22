// arr creation
export function create_arr<T>(size: number, val: T) {
    return create_arr_with_func(size, () => { return val; });
}
export function create_arr_with_func<T>(size: number, func: (index: number) => T) {
    const arr = [];
    for (let i = 0; i < size; ++i) {
        arr.push(func(i));
    }
    return arr;
}

// arr access
export function first_elem<T>(arr: T[]): T{
    return arr[0];
}
export function last_elem<T>(arr: T[]): T {
    return arr[arr.length - 1];
}

// set utils
export function eq_set<T>(set1: Set<T>, set2: Set<T>): boolean {
    if (set1.size != set2.size) {
        return false;
    }
    for (const el of set1) {
        if (!set2.has(el)) {
            return false;
        }
    }
    return true;
}
export function cut_set<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    const out = new Set<T>();
    for (const el of set1) {
        if (set2.has(el)) {
            out.add(el);
        }
    }
    return out;
}