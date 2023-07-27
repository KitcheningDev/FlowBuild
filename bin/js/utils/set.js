// sample
export function sample(set) {
    for (const val of set) {
        return val;
    }
}
// compare
export function setEqual(set1, set2) {
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
export function setIncludes(subset, superset) {
    for (const elem of subset) {
        if (superset.has(elem)) {
            return false;
        }
    }
    return true;
}
// operation
export function setIntersection(set1, set2) {
    const intersection = new Set();
    for (const elem of set1) {
        if (set2.has(elem)) {
            intersection.add(elem);
        }
    }
    return intersection;
}
export function setMerge(set1, set2) {
    return new Set([...set1, ...set2]);
}
// clone
export function setClone(set) {
    return new Set([...set]);
}
//# sourceMappingURL=set.js.map