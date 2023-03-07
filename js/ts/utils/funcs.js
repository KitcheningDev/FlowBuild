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
export function first_elem(arr) {
    return arr[0];
}
export function last_elem(arr) {
    return arr[arr.length - 1];
}
//# sourceMappingURL=funcs.js.map