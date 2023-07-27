export function filterInPlace(arr, cond) {
    for (let i = 0; i < arr.length; ++i) {
        if (cond(arr[i])) {
            removeIndex(arr, i);
            return filterInPlace(arr, cond);
        }
    }
}
export function removeVal(arr, val) {
    for (let i = 0; i < arr.length; ++i) {
        if (arr[i] == val) {
            removeIndex(arr, i);
            return removeVal(arr, val);
        }
    }
}
export function removeIndex(arr, index) {
    for (let i = index; i < arr.length - 1; ++i) {
        arr[i] = arr[i + 1];
    }
    arr.pop();
}
//# sourceMappingURL=array.js.map