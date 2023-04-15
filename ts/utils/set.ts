export function set_element<T>(set: Set<T>): T {
    for (const val of set) {
        return val;
    }
}
export function set_equal<T>(set1: Set<T>, set2: Set<T>): boolean {
    if (set1.size != set2.size) {
        return false;
    }
    for (const elem of set1) {
        if (!set2.has(elem)) {
            return false;
        }
    }
    return true;
}
export function set_copy<T>(set: Set<T>): Set<T> {
    return new Set<T>([...set]);
}
export function set_intersection<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    const intersection = new Set<T>();
    for (const elem of set1) {
        if (set2.has(elem)) {
            intersection.add(elem);
        }
    }
    return intersection;
}
export function set_merge<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    return new Set([...set1, ...set2]);
}