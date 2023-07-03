import { sample, set_equal, set_includes, set_merge } from "../ts/utils/set.js";
import { Graph } from "../ts/flowbuild/graph/graph.js";
import { Node } from "../ts/flowbuild/graph/node.js";

class Path {
    parents: Path[];
    childs: Path[];
    nodes: Node[];

    constructor(nodes: Node[]) {
        this.parents = [];
        this.childs = [];
        this.nodes = nodes;
    }

    get head(): Node {
        return this.nodes[0];
    }
    get tail(): Node {
        return this.nodes[this.nodes.length - 1];
    }
};
export function create_paths(graph: Graph): Set<Path> {
    const relation_map = new Map<Node, Set<Node>>();
    for (const node of graph.nodes) {
        relation_map.set(node, new Set([node]));
    }
    for (const parent of graph.nodes) {
        if (parent.childs.size == 1) {
            const child = sample(parent.childs);
            if (child.parents.size == 1) {
                let set = set_merge(relation_map.get(parent), relation_map.get(child));
                for (const node of set) {
                    relation_map.set(node, set);
                }
            }
        }
    }

    const paths = new Set<Path>();
    const visited = new Set<Set<Node>>();
    for (const [node, set] of relation_map) {
        if (!visited.has(set)) {
            paths.add(new Path([...set].sort((a: Node, b: Node) => graph.get_depth(a) - graph.get_depth(b))));
            visited.add(set);
        }
    }
    for (const path of paths) {
        for (const other of paths) {
            if (path.head.parents.has(other.tail)) {
                path.parents.push(other);
            }
            if (path.tail.childs.has(other.head)) {
                path.childs.push(other);
            }
        }
    }
    return paths;
}

export function create_relations(graph: Graph): Map<Path, Path> {
    const paths = create_paths(graph);
    const relations = new Map<Path, Path>();
    for (const path of paths) {
        for (let i = 0; i < path.parents.length - 1; ++i) {
            relations.set(path.parents[i], path.parents[i + 1]);
        }
        for (let i = 0; i < path.childs.length - 1; ++i) {
            relations.set(path.childs[i], path.childs[i + 1]);
        }
    }
    // while (true) {
    //     let changed = false;
    //     for (const path of paths) {
    //         if (path.parents.length > 1) {
    //             for (const parent of path.parents) {
    //                 if (!set_includes(relations.get(parent), relations.get(path))) {
    //                     relations.set(parent, set_merge(relations.get(parent), relations.get(path)));
    //                     changed = true;
    //                 }
    //             }
    //         }
    //         if (path.childs.length > 1) {
    //             for (const child of path.childs) {
    //                 if (!set_includes(relations.get(child), relations.get(path))) {
    //                     relations.set(child, set_merge(relations.get(child), relations.get(path)));
    //                     changed = true;
    //                 }
    //             }
    //         }
    //     }
    //     if (!changed) {
    //         break;
    //     }
    // }
    return relations;
}