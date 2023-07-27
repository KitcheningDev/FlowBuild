// sample
export function sample<T>(set: Set<T>): T {
    for (const val of set) {
        return val;
    }
}
// compare
export function setEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
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
export function setIncludes<T>(subset: Set<T>, superset: Set<T>): boolean {
    for (const elem of subset) {
        if (superset.has(elem)) {
            return false;
        }
    }
    return true;
}
// operation
export function setIntersection<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    const intersection = new Set<T>();
    for (const elem of set1) {
        if (set2.has(elem)) {
            intersection.add(elem);
        }
    }
    return intersection;
}
export function setMerge<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    return new Set([...set1, ...set2]);
}
// clone
export function setClone<T>(set: Set<T>): Set<T> {
    return new Set<T>([...set]);
}