export function filterInPlace<T>(arr: T[], cond: (val: T) => boolean): void {
    for (let i = 0; i < arr.length; ++i) {
        if (cond(arr[i])) {
            removeIndex(arr, i);
            return filterInPlace(arr, cond);
        }
    }
}
export function removeVal<T>(arr: T[], val: T): void {
    for (let i = 0; i < arr.length; ++i) {
        if (arr[i] == val) {
            removeIndex(arr, i);
            return removeVal(arr, val);
        }
    }
}
export function removeIndex<T>(arr: T[], index: number): void {
    for (let i = index; i < arr.length - 1; ++i) {
        arr[i] = arr[i + 1];
    }
    arr.pop();
}