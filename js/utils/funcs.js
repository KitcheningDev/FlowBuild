// arr creation
export function create_arr(size, val) {
    return create_arr_with_func(size, () => { return val; });
}
export function create_arr_with_func(size, func) {
    const arr = [];
    for (let i = 0; i < size; ++i) {
        arr.push(func(i));
    }
    return arr;
}
// arr access
export function first_elem(arr) {
    return arr[0];
}
export function last_elem(arr) {
    return arr[arr.length - 1];
}
// set utils
export function eq_set(set1, set2) {
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
export function cut_set(set1, set2) {
    const out = new Set();
    for (const el of set1) {
        if (set2.has(el)) {
            out.add(el);
        }
    }
    return out;
}
//# sourceMappingURL=funcs.js.map