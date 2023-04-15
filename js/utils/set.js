export function set_element(set) {
    for (const val of set) {
        return val;
    }
}
export function set_equal(set1, set2) {
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
export function set_copy(set) {
    return new Set([...set]);
}
export function set_intersection(set1, set2) {
    const intersection = new Set();
    for (const elem of set1) {
        if (set2.has(elem)) {
            intersection.add(elem);
        }
    }
    return intersection;
}
export function set_merge(set1, set2) {
    return new Set([...set1, ...set2]);
}
//# sourceMappingURL=set.js.map