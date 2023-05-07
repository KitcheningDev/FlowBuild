import { last_elem } from "./funcs.js";
export var permutate;
(function (permutate) {
    function fact(n) {
        let res = 1;
        for (let i = 1; i <= n; ++i) {
            res *= i;
        }
        return res;
    }
    function index_to_order(index, el_count) {
        const order = [];
        for (let i = 0; i < el_count - 1; ++i) {
            order.push(index % (el_count - i));
        }
        return order;
    }
    function permutate_list(list, callback) {
        const pos_count = fact(list.length);
        for (let i = 0; i < pos_count; ++i) {
            const order = index_to_order(i, list.length);
            for (let j = 0; j < order.length; ++j) {
                const temp = list[j];
                list[j] = list[j + order[j]];
                list[j + order[j]] = temp;
            }
            callback();
            for (let j = order.length - 1; j >= 0; --j) {
                const temp = list[j];
                list[j] = list[j + order[j]];
                list[j + order[j]] = temp;
            }
        }
    }
    permutate.permutate_list = permutate_list;
    function permutate_multiple_lists(list_list, callback) {
        let nested_callbacks = [callback];
        for (let i = 0; i < list_list.length; ++i) {
            nested_callbacks.push(() => { permutate_list(list_list[list_list.length - 1 - i], nested_callbacks[i]); });
        }
        last_elem(nested_callbacks)();
    }
    permutate.permutate_multiple_lists = permutate_multiple_lists;
})(permutate || (permutate = {}));
//# sourceMappingURL=permutate.js.map