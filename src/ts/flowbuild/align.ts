import { sample, setEqual, setIntersection } from "../utils/set.js";
import { Vec2 } from "../utils/vec2.js";
import { depth } from "./graph/depth_map.js";
import { Graph } from "./graph/graph.js";
import { Node } from "./graph/node.js";
import { FlowGrid } from "./grid/flow_grid.js";
import { Recipe } from "./recipe/recipe.js";
import { Cook, Cook1, Cook2 } from "./recipe/task.js";

// validity
function isMidCook(node: Node): boolean {
    if (node.task.cook == Cook2) {
        for (const parent of node.parents) {
            if (parent.task.cook == Cook1) {
                return true;
            }
        }
        for (const child of node.childs) {
            if (child.task.cook == Cook1) {
                return true;
            }
        }
    }
    return false;
}
function isCookOrderingValid(row: Node[]): boolean {
    let foundMidCook2 = false;
    let foundRealCook2 = false;
    for (const el of row) {
        if (el.task.cook == Cook2) {
            if (isMidCook(el)) {
                if (foundRealCook2) {
                    return false;
                }
                foundMidCook2 = true;
            }
            else {
                foundRealCook2 = true;
            }
        }
        if (el.task.cook == Cook1 && (foundMidCook2 || foundRealCook2)) {
            return false;
        }
    }
    return true;
}
function isvalid(tree: Node[][]): boolean {
    const set = new Set<Node>();
    for (const row of tree) {
        if (!isCookOrderingValid(row)) {
            return false;
        }
        for (const el of row) {
            if (set.has(el)) {
                return false;
            }
            set.add(el);
        }
    }
    return true;
}
// compatibility
function overlaps<T>(tree1: T[][], tree2: T[][]): boolean {
    for (const row1 of tree1) {
        for (const el1 of row1) {
            for (const row2 of tree2) {
                for (const el2 of row2) {
                    if (el1 == el2) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
function cut<T>(l1: T[], l2: T[]): T[] {
    const out = [];
    for (const el1 of l1) {
        for (const el2 of l2) {
            if (el1 == el2) {
                out.push(el1);
            }
        }
    }
    return out;
}
function matchesHor<T>(left: T[], right: T[]): boolean {
    const length = cut(left, right).length;
    for (let i = 0; i < length; ++i) {
        if (left[(left.length - length) + i] != right[i]) {
            return false;
        }
    }
    return true;
}
function dockableHor<T>(tree1: T[][], tree2: T[][]): number {
    let docking = NaN;
    for (let i1 = 0; i1 < tree1.length; ++i1) {
        for (let i2 = 0; i2 < tree2.length; ++i2) {
            if (0 < cut(tree1[i1], tree2[i2]).length) {
                if (matchesHor(tree1[i1], tree2[i2])) {
                    docking = i1 - i2;
                }
                else {
                    return NaN;
                }
            }
        }
    }
    return docking;
}
function dockableVer<T>(tree1: T[][], tree2: T[][]): number {
    let first_index = NaN;
    for (let i = 0; i < tree1.length; ++i) {
        if (tree1[i].includes(tree2[0][0])) {
            first_index = i;
            break;
        }
    }
    if (isNaN(first_index)) {
        return NaN;
    }
    for (let i = first_index; i < tree1.length; ++i) {
        if (i - first_index == tree2.length) {
            break;
        }
        if (tree1[i].includes(tree2[i - first_index][0])) {
            const hor_index = tree1[i].indexOf(tree2[i - first_index][0]);
            for (let j = 0; j < tree2[i - first_index].length; ++j) {
                if (hor_index + j == tree1[i].length) {
                    break;
                }
                if (tree1[i][hor_index + j] != tree2[i - first_index][j]) {
                    return NaN;
                }
            }
        }
        else {
            return NaN;
        }
    }
    return first_index;
}
// merge
function mergeHor<T>(left: T[], right: T[]): T[] {
    return [...left, ...right.slice(cut(left, right).length)];
}
function dockHor<T>(tree1: T[][], tree2: T[][], where: number): T[][] {
    const out = [];
    if (where < 0) {
        for (let i = 0; i < -where; ++i) {
            out.push([]);
        }
        out.push(...tree1);
        for (let i = 0; i < tree2.length; ++i) {
            if (i == out.length) {
                out.push([]);
            }
            out[i] = mergeHor(out[i], tree2[i]);
        }
    }
    else {
        out.push(...tree1);
        for (let i = 0; i < tree2.length; ++i) {
            if (out.length <= i + where) {
                out.push([]);
            }
            out[i + where] = mergeHor(out[i + where], tree2[i]);
        }
    }
    return out;
}
function dockVer<T>(tree1: T[][], tree2: T[][], where: number): T[][] {
    let out = [];
    for (let i = where; i < tree1.length; ++i) {
        if (i - where == tree2.length) {
            break;
        }
        let hor_index = tree1[i].indexOf(tree2[i - where][0]);
        if (hor_index + tree2[i - where].length < tree1[i].length) {
            out.push([...tree1[i]]);
        }
        else {
            out.push(mergeHor(tree1[i], tree2[i - where]));
        }
    }
    for (let i = tree1.length; i < tree2.length + where; ++i) {
        out.push([...tree2[i - where]]);
    }
    return out;
}
function replaceHor<T>(lists: T[][][], left: T[][], right: T[][], where: number): T[][][] {
    return [...lists, dockHor(left, right, where)].filter((val: T[][]) => val != left && val != right);
}
function replaceVer<T>(lists: T[][][], top: T[][], bottom: T[][], where: number): T[][][] {
    return [...lists, dockVer(top, bottom, where)].filter((val: T[][]) => val != top && val != bottom);
}
function rigidResolve<T>(trees: T[][][]): T[][][] | null {
    for (const tree1 of trees) {
        for (const tree2 of trees) {
            if (tree1 == tree2) {
                continue;
            }
            if (overlaps(tree1, tree2)) {
                const docking_right = dockableHor(tree1, tree2);
                if (!isNaN(docking_right) && isvalid(dockHor(tree1, tree2, docking_right) as Node[][])) {
                    return rigidResolve(replaceHor(trees, tree1, tree2, docking_right));
                }
                const docking_left = dockableHor(tree2, tree1);
                if (!isNaN(docking_left) && isvalid(dockHor(tree2, tree1, docking_left) as Node[][])) {
                    return rigidResolve(replaceHor(trees, tree2, tree1, docking_left));
                }
                const docking_bottom = dockableVer(tree1, tree2);
                // console.warn('BOTTOM', tree1, tree2, docking_bottom);
                if (!isNaN(docking_bottom) && isvalid(dockVer(tree1, tree2, docking_bottom) as Node[][])) {
                    return rigidResolve(replaceVer(trees, tree1, tree2, docking_bottom));
                }
                const docking_top = dockableVer(tree2, tree1);
                // console.warn('TOP', tree1, tree2, docking_top);
                if (!isNaN(docking_top) && isvalid(dockVer(tree2, tree1, docking_top) as Node[][])) {
                    return rigidResolve(replaceVer(trees, tree2, tree1, docking_top));
                }
                return null;
            }
        }
    }
    return trees;
}

function swap<T>(list: T[], i1: number, i2: number): void {
    const temp = list[i1];
    list[i1] = list[i2];
    list[i2] = temp;
}
function permutate<T>(list: T[], callback: (list: T[]) => boolean, index: number = 0): boolean {
    if (index == Math.min(list.length, 4)) {
        return callback(list);
    }
    for (let i = index; i < list.length; ++i) {
        swap(list, index, i);
        if (permutate(list, callback, index + 1)) {
            return true;
        }
        swap(list, index, i);
    }
}
function resolve<T>(trees: T[][][], graph: Graph): T[][] | null {
    let out = null;
    const rows = [] as T[][];
    for (const tree of trees) {
        for (const row of tree) {
            if (1 < row.length) {
                rows.push(row);
            }
        }
    }
    const tryResolve = () => {
        const resolved = rigidResolve(trees);
        if (resolved) {
            out = [];
            for (let i = 0; i <= graph.maxDepth; ++i) {
                out.push([]);
            }
            for (const tree of resolved) {
                out = dockHor(out, tree, depth(tree[0][0] as Node));
            }
            return true;
        }
        else {
            return false;
        }
    }
    const callback = (list: T[]) => {
        let foundbw = false;
        for (const node of list) {
            if (graph.isBackwards(node as Node)) {
                foundbw = true;
            }
            else if (foundbw) {
                return false;
            }
        }
        const index = rows.findIndex((val: T[]) => val == list);
        if (index + 1 == rows.length) {
            // console.warn('ITERATION');
            // for (const tree of trees) {
            //     console.warn("\t", "TREE");
            //     for (const row of tree) {
            //         const rowlog = [];
            //         for (const el of row) {
            //             rowlog.push(el.task.description);
            //         }
            //         console.warn("\t\t", ...rowlog);
            //     }
            // }
            return tryResolve();
        }
        else {
            return permutate(rows[index + 1], callback);
        }
    };
    if (0 < rows.length) {
        permutate(rows[0], callback);
    }
    else {
        tryResolve();
    }
    // permutate(trees, () => {
    //     return permutate(trees[0], callback);
    // });
    return out;
}

function createAligns(graph: Graph): any[][][] {
    const aligns = [];
    for (const node of graph.nodes) {
        for (const nodes of [new Set([...node.parents, node]), new Set([...node.childs, node])]) {
            if (nodes.size == 1) {
                continue;
            }
            if (nodes.size == 2) {
                const other = [...nodes].find((other: Node) => other != node);
                if (node.parents.has(other)) {
                    if (1 < other.childs.size) {
                        continue;
                    }
                }
                else if (node.childs.has(other)) {
                    if (1 < other.parents.size) {
                        continue;
                    }
                }
            }
            let miny = Infinity;
            let maxy = -Infinity;
            for (const node of nodes) {
                if (depth(node) < miny) {
                    miny = depth(node);
                }
                if (maxy < depth(node)) {
                    maxy = depth(node);
                }
            }
            const tree = [];
            for (let i = 0; i <= maxy - miny; ++i) {
                tree.push([]);
            }
            for (const node of nodes) {
                tree[depth(node) - miny].push(node);
            }
            aligns.push(tree);
        }
    }
    for (const loop of graph.loops) {
        const textlist = [];
        for (const node of [...loop.loop_entries, ...loop.backwards_heads]) {
            textlist.push(node);
        }
        aligns.push([textlist]);
    }
    return aligns;
}

function getDependancies<T>(aligns: T[][][]): T[][] {
    const out = [];
    for (const align of aligns) {
        const dep = [];
        for (const row of align) {
            dep.push(...row);
        }
        out.push(dep);
    }
    return out;
}
function weigh(aligns: Node[][][], resolved: Node[][], graph: Graph): Map<Node, number> {
    const weights = new Map<Node, number>();
    for (const align of aligns) {
        for (const row of align) {
            for (const node of row) {
                weights.set(node, 0);
            }
        }
    }
    const dep = getDependancies(aligns);
    // console.log("DEP", ...dep);
    // console.log("ALIGNS", ...aligns);
    function change(): boolean {
        let changed = false;
        // order
        for (const row of resolved) {
            for (let i = 1; i < row.length; ++i) {
                if (weights.get(row[i]) <= weights.get(row[i - 1])) {
                    weights.set(row[i], weights.get(row[i - 1]) + 1);
                    // console.log("ORDER CHANGE", row[i - 1].task.description, row[i].task.description);
                    changed = true;
                }
            }
        }
        // bw
        for (const node of graph.nodes) {
            if (graph.isBackwards(node)) {
                for (const child of node.childs) {
                    if (!graph.isBackwards(child) && weights.get(node) <= weights.get(child)) {
                        weights.set(node, weights.get(child) + 1);
                        // console.log("BW CHANGE", node.task.description, child.task.description);
                        changed = true;
                    }
                }
            }
        }
        // parent child
        let parentchild = false;
        for (const list of dep) {
            if (parentchild) {
                break;
            }
            let minDepth = Infinity;
            let maxDepth = -Infinity;
            let minWeight = Infinity;
            let maxWeight = -Infinity;
            for (const node of list) {
                const weight = weights.get(node);
                const d = depth(node as Node);
                if (weight < minWeight) {
                    minWeight = weight;
                }
                if (maxWeight < weight) {
                    maxWeight = weight;
                }
                if (d < minDepth) {
                    minDepth = d;
                }
                if (maxDepth < d) {
                    maxDepth = d;
                }
            }
            for (let y = minDepth; y <= maxDepth; ++y) {
                for (const node of resolved[y]) {
                    const weight = weights.get(node);
                    if (minWeight <= weight && weight <= maxWeight) {
                        if (!list.includes(node)) {
                            if (0.5 < Math.random()) {
                                for (const otherlist of dep) {
                                    if (otherlist.includes(node) && setIntersection(new Set(list), new Set(otherlist)).size == 0) {
                                        for (const othernode of otherlist) {
                                            weights.set(othernode, Math.max(weights.get(othernode), maxWeight + 1));
                                        }
                                    }
                                }
                                weights.set(node, maxWeight + 1);
                            }
                            else {
                                for (const othernode of list) {
                                    weights.set(othernode, weights.get(node) + 1);
                                }
                            }
                            // console.log("PARENT CHANGE", list, node.task.description);
                            // console.log("PARENT CHILD");
                            for (const row of resolved) {
                                const rowlog = [];
                                for (const el of row) {
                                    rowlog.push(el.task.description, weights.get(el));
                                }
                                // console.log("\t", ...rowlog);
                            }

                            changed = true;
                            parentchild = true;
                        }
                    }
                }
            }
        }
        // cook
        for (const node of weights.keys()) {
            if (node.task.cook == Cook1) {
                for (const other of [...weights.keys()]) {
                    if (other.task.cook == Cook2) {
                        if (weights.get(other) <= weights.get(node)) {
                            weights.set(other, weights.get(node) + 1);
                        }
                    }
                }
            }
        }
        // console.log("CHANGE");
        for (const row of resolved) {
            const rowlog = [];
            for (const el of row) {
                rowlog.push(el.task.description, weights.get(el));
            }
            // console.log("\t", ...rowlog);
        }
        // for (const align of aligns) {
        //     if (1 < align.length) {
        //         // avg
        //         if (align[0].length == 1 && 1 < align[1].length) {
        //             const weight = weights.get(align[0][0]);
        //             const left = weights.get(align[1][0]);
        //             const right = weights.get(align[1][align[1].length - 1]);
        //             if (weight <= left) {
        //                 weights.set(align[0][0], (left + right) / 2);
        //                 changed = true;
        //             }
        //             else if (right <= weight) {
        //                 weights.set(align[1][0], weight - align[1].length / 2);
        //                 changed = true;
        //             }
        //         }
        //         else if (align[1].length == 1 && 1 < align[0].length) {
        //             const weight = weights.get(align[1][0]);
        //             const left = weights.get(align[0][0]);
        //             const right = weights.get(align[0][align[0].length - 1]);
        //             if (weight <= left) {
        //                 weights.set(align[1][0], (left + right) / 2);
        //                 changed = true;
        //             }
        //             else if (right <= weight) {
        //                 weights.set(align[0][0], weight - align[0].length / 2);
        //                 changed = true;
        //             }
        //         }
        //         else if (align[0].length == 1 && align[1].length == 1){
        //             const max = Math.max(weights.get(align[0][0]), weights.get(align[1][0]));
        //             weights.set(align[0][0], max);
        //             weights.set(align[1][0], max);
        //             changed = true;
        //         }
        //     }
        // }
        return changed;
    }
    let iteration = 0;
    while (change() && iteration++ < 20) {
        continue;
    }
    if (20 <= iteration) {
        console.error("ITERATION LIMIT REACHED");
    }
    return weights;
}
export function createGrid(graph: Graph): FlowGrid {
    const map = weigh(createAligns(graph), resolve(createAligns(graph), graph), graph);
    // console.log("RESOLVED");
    for (const row of resolve(createAligns(graph), graph)) {
        const rowlog = [];
        for (const el of row) {
            rowlog.push(el.task.description, map.get(el));
        }
        // console.log("\t\t", ...rowlog);
    }
    const order = [...map.entries()].sort((a: [Node, number], b: [Node, number]) => a[1] - b[1]);
    // console.log("ORDER");
    for (const [node, weight] of order) {
        // console.log("\t", node.task.description, weight);
    }
    const grid = new FlowGrid(graph);
    grid.setSize(new Vec2(order.length, graph.maxDepth + 1));
    let x = 0;
    for (let i = 0; i < order.length; ++i) {
        if (i != 0 && order[i - 1][1] < order[i][1]) {
            x += 1;
        }
        grid.setNode(order[i][0], new Vec2(i, depth(order[i][0])));
    }
    return grid;
}

function isMostLeft(node: Node, dependancies: Node[][], exclude: Set<Node> = new Set()): boolean {
    for (const dependancy of dependancies) {
        if (dependancy.includes(node)) {
            const index = dependancy.indexOf(node);
            for (let i = 0; i < index; ++i) {
                if (!exclude.has(dependancy[i])) {
                    return false;
                }
            }
        }
    }
    return true;
}
function canCollapse(node: Node, dependancies: Node[][], order: Node[]): boolean {
    // old
    let queue = [node];
    const exclude = new Set<Node>(order);
    // validate queue
    const validate_queue = () => {
        let is_valid = true;
        const queue_copy = [...queue];
        const exlude_copy = new Set([...exclude]);
        while (queue_copy.length) {
            const front = queue_copy.shift();
            if (!isMostLeft(front, dependancies, exlude_copy)) {
                is_valid = false;
                break;
            }
            exlude_copy.add(front);
        }
        return is_valid;
    };
    let iteration = 0;
    let threshold = 2;
    while (iteration < threshold && queue.length && permutate(queue, validate_queue)) {
        // fill queue
        const temp = [];
        for (const node of queue) {
            exclude.add(node);
            for (const successor of [...node.parents, ...node.childs]) {
                if (!exclude.has(successor)) {
                    temp.push(successor);
                }
            }
        }
        queue = temp;
        iteration++;
    }
    return queue.length == 0 || iteration == threshold;
}
function wasRestricted(node: Node, dependancies: Node[][]): boolean {
    for (const dependancy of dependancies) {
        if (dependancy.includes(node) && 0 < dependancy.indexOf(node)) {
            return true;
        }
    }
    return false;
}
function collapse(nodes: Set<Node>, dependancies: Node[][]): Node[] | null {
    const order = [];
    while (nodes.size) {
        let found = false;
        let has_dependancy = false;
        for (const node of nodes) {
            if (wasRestricted(node, dependancies)) {
                has_dependancy = true;
                if (canCollapse(node, dependancies, order)) {
                    order.push(node);
                    nodes.delete(node);
                    found = true;
                    break;
                }
            }
        }
        // if (has_dependancy && !found) {
        //     return null;
        // }
        if (!found) {
            for (const node of nodes) {
                if (canCollapse(node, dependancies, order)) {
                    order.push(node);
                    nodes.delete(node);
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            return null;
        }
    }
    return order;
}
function existsDependancy(dependancy: Set<Node>, lookup: Node[][]): boolean {
    for (const existing of lookup) {
        if (setEqual(dependancy, new Set(existing))) {
            return true;
        }
    }
    return false;
}
export function createDependancies(graph: Graph): Node[][] {
    const dependancies = [];
    for (const node of graph.nodes) {
        if (1 < node.parents.size && !existsDependancy(new Set([node, ...node.parents]), dependancies)) {
            dependancies.push([node, ...node.parents]);
        }
        if (1 < node.childs.size && !existsDependancy(new Set([node, ...node.childs]), dependancies)) {
            dependancies.push([node, ...node.childs]);
        }
        if (node.parents.size == 1 && sample(node.parents).childs.size == 1) {
            dependancies.push([node, sample(node.parents)]);
        }
    }
    for (const loop of graph.loops) {
        const top = [loop.loop_top, ...loop.backwards_heads];
        const bottom = [loop.loop_bottom, ...loop.backwards_tails];
        if (!existsDependancy(new Set(top), dependancies)) {
            dependancies.push(top);
        }
        if (!existsDependancy(new Set(bottom), dependancies)) {
            dependancies.push(bottom);
        }
    }
    return dependancies;
}
function adjustForCooks(order: Node[]): Node[] {
    const rest = [];
    let cook2s = [];
    for (const node of order) {
        if (node.task.cook == Cook2) {
            cook2s.push(node);
        }
        else {
            rest.push(node);
        }
    }
    return [...rest, ...cook2s];
}
export function createGridNew(graph: Graph): FlowGrid {
    let order = [] as Node[];
    const dependancies = createDependancies(graph);
    
    const callback = (dependancy: Node[]) => {
        if (!isCookOrderingValid(dependancy)) {
            return false;
        }
        const index = dependancies.indexOf(dependancy) + 1;
        if (index == dependancies.length) {
            order = collapse(new Set([...graph.nodes]), dependancies);
            return order != null;
        }
        return permutate(dependancies[index], callback);
    };
    
    // console.warn('DEPENDANCIES');
    for (const dep of dependancies) {
        const strings = [];
        for (const el of dep) {
            strings.push(el.task.description);
        }
        // console.warn('\t', ...strings);
    }

    if (permutate(dependancies, () => permutate(dependancies[0], callback))) {
        order = adjustForCooks(order);

        const strings = [];
        for (const el of order) {
            strings.push(el.task.description);
        }
        // console.warn('ORDER', ...strings);

        const grid = new FlowGrid(graph);
        grid.setSize(new Vec2(order.length, graph.maxDepth + 1));
        for (let x = 0; x < order.length; ++x) {
            grid.setNode(order[x], new Vec2(x, depth(order[x])));
        }
        return grid;
    }
    return null;
}