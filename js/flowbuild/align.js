import { setIntersection } from "../utils/set.js";
import { Vec2 } from "../utils/vec2.js";
import { depth } from "./graph/depth_map.js";
import { FlowGrid } from "./grid/flow_grid.js";
import { Cook1, Cook2 } from "./recipe/task.js";
function isMidCook(node) {
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
function isvalid(tree) {
    const set = new Set();
    for (const row of tree) {
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
            if (set.has(el)) {
                return false;
            }
            set.add(el);
        }
    }
    return true;
}
function overlaps(tree1, tree2) {
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
function cut(l1, l2) {
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
function matches(left, right) {
    const length = cut(left, right).length;
    for (let i = 0; i < length; ++i) {
        if (left[(left.length - length) + i] != right[i]) {
            return false;
        }
    }
    return true;
}
function dockable(tree1, tree2) {
    let docking = NaN;
    for (let i1 = 0; i1 < tree1.length; ++i1) {
        for (let i2 = 0; i2 < tree2.length; ++i2) {
            if (0 < cut(tree1[i1], tree2[i2]).length) {
                if (matches(tree1[i1], tree2[i2])) {
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
function merge(left, right) {
    return [...left, ...right.slice(cut(left, right).length)];
}
function dock(tree1, tree2, where) {
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
            out[i] = merge(out[i], tree2[i]);
        }
    }
    else {
        out.push(...tree1);
        for (let i = 0; i < tree2.length; ++i) {
            if (out.length <= i + where) {
                out.push([]);
            }
            out[i + where] = merge(out[i + where], tree2[i]);
        }
    }
    return out;
}
function replace(lists, left, right, where) {
    return [...lists, dock(left, right, where)].filter((val) => val != left && val != right);
}
function rigidResolve(trees) {
    for (const tree1 of trees) {
        for (const tree2 of trees) {
            if (tree1 == tree2) {
                continue;
            }
            if (overlaps(tree1, tree2)) {
                const docking1 = dockable(tree1, tree2);
                if (!isNaN(docking1) && isvalid(dock(tree1, tree2, docking1))) {
                    return rigidResolve(replace(trees, tree1, tree2, docking1));
                }
                const docking2 = dockable(tree2, tree1);
                if (!isNaN(docking2) && isvalid(dock(tree2, tree1, docking2))) {
                    return rigidResolve(replace(trees, tree2, tree1, docking2));
                }
                return null;
            }
        }
    }
    return trees;
}
function swap(list, i1, i2) {
    const temp = list[i1];
    list[i1] = list[i2];
    list[i2] = temp;
}
function permuate(list, callback, index = 0) {
    if (index == Math.min(list.length, 4)) {
        return callback(list);
    }
    for (let i = index; i < list.length; ++i) {
        swap(list, index, i);
        if (permuate(list, callback, index + 1)) {
            return true;
        }
        swap(list, index, i);
    }
}
function resolve(trees, graph) {
    let out = null;
    const rows = [];
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
                out = dock(out, tree, depth(tree[0][0]));
            }
            return true;
        }
        else {
            return false;
        }
    };
    const callback = (list) => {
        let foundbw = false;
        for (const node of list) {
            if (graph.isBackwards(node)) {
                foundbw = true;
            }
            else if (foundbw) {
                return false;
            }
        }
        const index = rows.findIndex((val) => val == list);
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
            return permuate(rows[index + 1], callback);
        }
    };
    if (0 < rows.length) {
        permuate(rows[0], callback);
    }
    else {
        tryResolve();
    }
    // permuate(trees, () => {
    //     return permuate(trees[0], callback);
    // });
    return out;
}
function createAligns(graph) {
    const aligns = [];
    for (const node of graph.nodes) {
        for (const nodes of [new Set([...node.parents, node]), new Set([...node.childs, node])]) {
            if (nodes.size == 1) {
                continue;
            }
            if (nodes.size == 2) {
                const other = [...nodes].find((other) => other != node);
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
function getDependancies(aligns) {
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
function weigh(aligns, resolved, graph) {
    const weights = new Map();
    for (const align of aligns) {
        for (const row of align) {
            for (const node of row) {
                weights.set(node, 0);
            }
        }
    }
    const dep = getDependancies(aligns);
    console.log("DEP", ...dep);
    console.log("ALIGNS", ...aligns);
    function change() {
        let changed = false;
        // order
        for (const row of resolved) {
            for (let i = 1; i < row.length; ++i) {
                if (weights.get(row[i]) <= weights.get(row[i - 1])) {
                    weights.set(row[i], weights.get(row[i - 1]) + 1);
                    console.log("ORDER CHANGE", row[i - 1].task.description, row[i].task.description);
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
                        console.log("BW CHANGE", node.task.description, child.task.description);
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
                const d = depth(node);
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
                            console.log("PARENT CHANGE", list, node.task.description);
                            console.log("PARENT CHILD");
                            for (const row of resolved) {
                                const rowlog = [];
                                for (const el of row) {
                                    rowlog.push(el.task.description, weights.get(el));
                                }
                                console.log("\t", ...rowlog);
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
        console.log("CHANGE");
        for (const row of resolved) {
            const rowlog = [];
            for (const el of row) {
                rowlog.push(el.task.description, weights.get(el));
            }
            console.log("\t", ...rowlog);
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
export function createGrid(graph) {
    const map = weigh(createAligns(graph), resolve(createAligns(graph), graph), graph);
    console.log("RESOLVED");
    for (const row of resolve(createAligns(graph), graph)) {
        const rowlog = [];
        for (const el of row) {
            rowlog.push(el.task.description, map.get(el));
        }
        console.log("\t\t", ...rowlog);
    }
    const order = [...map.entries()].sort((a, b) => a[1] - b[1]);
    console.log("ORDER");
    for (const [node, weight] of order) {
        console.log("\t", node.task.description, weight);
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
//# sourceMappingURL=align.js.map