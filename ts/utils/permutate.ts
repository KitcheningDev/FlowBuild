import { last_elem } from "./funcs.js";

export namespace permutate {
    function fact(n: number): number {
        let res = 1;
        for (let i = 1; i <= n; ++i) {
            res *= i;
        }
        return res;
    }

    function index_to_order(index: number, el_count: number): number[] {
        const order = [];
        for (let i = 0; i < el_count - 1; ++i) {
            order.push(index % (el_count - i));
        }
        return order;
    }
    export function permutate_list<T>(list: T[], callback: () => void, exit_cond: () => boolean = () => { return false }): void {
        const pos_count = fact(list.length);
        for (let i = 0 ; i < pos_count; ++i) {
            const order = index_to_order(i, list.length);
            for (let j = 0; j < order.length; ++j) {
                const temp = list[j];
                list[j] = list[j + order[j]];
                list[j + order[j]] = temp;
            }
            callback();
            if (exit_cond()) {
                return;
            }
            for (let j = order.length - 1; j >= 0; --j) {
                const temp = list[j];
                list[j] = list[j + order[j]];
                list[j + order[j]] = temp;
            }
        }
    }
    export function permutate_multiple_lists<T>(list_list: T[][], callback: () => void, exit_cond: () => boolean = () => { return false }): void {
        let nested_callbacks = [callback];
        for (let i = 0; i < list_list.length; ++i) {
            nested_callbacks.push(() => { permutate_list(list_list[list_list.length - 1 - i], nested_callbacks[i], exit_cond); });
        }
        last_elem(nested_callbacks)();
    }
}