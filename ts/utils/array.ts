export function filter_in_place<T>(arr: T[], cond: (val: T) => boolean): void {
    for (let i = 0; i < arr.length; ++i) {
        if (cond(arr[i])) {
            remove_index(arr, i);
            return filter_in_place(arr, cond);
        }
    }
}
export function remove_val<T>(arr: T[], val: T): void {
    for (let i = 0; i < arr.length; ++i) {
        if (arr[i] == val) {
            remove_index(arr, i);
            return remove_val(arr, val);
        }
    }
}
export function remove_index<T>(arr: T[], index: number): void {
    for (let i = index; i < arr.length - 1; ++i) {
        arr[i] = arr[i + 1];
    }
    arr.pop();
}