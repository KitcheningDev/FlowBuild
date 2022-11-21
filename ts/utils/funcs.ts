export function create_arr<T>(size: number, val: T) {
    return create_arr_with_func(size, () => { return val; });
}
export function create_arr_with_func<T>(size: number, func: (index: number) => T) {
    const arr = [];
    for (let i = 0; i < size; ++i) {
        arr.push(func(i));
    }
    return arr;
}

export function first_elem<T>(arr: T[]): T{
    return arr[0];
}
export function last_elem<T>(arr: T[]): T {
    return arr[arr.length - 1];
}