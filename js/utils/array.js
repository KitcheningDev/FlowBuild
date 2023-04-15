export function filter_in_place(arr, cond) {
    for (let i = 0; i < arr.length; ++i) {
        if (cond(arr[i])) {
            remove_index(arr, i);
            return filter_in_place(arr, cond);
        }
    }
}
export function remove_val(arr, val) {
    for (let i = 0; i < arr.length; ++i) {
        if (arr[i] == val) {
            remove_index(arr, i);
            return remove_val(arr, val);
        }
    }
}
export function remove_index(arr, index) {
    for (let i = index; i < arr.length - 1; ++i) {
        arr[i] = arr[i + 1];
    }
    arr.pop();
}
//# sourceMappingURL=array.js.map