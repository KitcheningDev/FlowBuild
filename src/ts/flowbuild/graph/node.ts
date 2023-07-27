import { sample, setEqual } from "../../utils/set.js";
import { Task } from "../recipe/task.js";

export class Node {
    constructor(task: Task | null = null, parents: Set<Node> = new Set(), childs: Set<Node> = new Set()) {
        this.task = task;
        this.parents = parents;
        this.childs = childs;
    }
    // graph properties
    isStart(): boolean {
        return this.parents.size == 0;
    }
    isEnd(): boolean {
        return this.childs.size == 0;
    }
    allNodes(nodes: Set<Node> = new Set()): Set<Node> {
        if (nodes.has(this)) {
            return nodes;
        }
        nodes.add(this);
        for (const relative of [...this.parents, ...this.childs]) {
            relative.allNodes(nodes);
        }
        return nodes;
    }
    // traversal
    reachable(to: Node, visited: Set<Node> = new Set()): boolean {
        if (visited.has(this)) {
            return false;
        }
        visited.add(this);
        for (const child of this.childs) {
            if (child == to || child.reachable(to, visited))
                return true;
        }
        return false;
    }
    inLoop(): boolean {
        return this.reachable(this);
    }
    shortestPath(to: Node): Node[] {
        let paths = new Set<Node[]>([[this]]);
        while (true) {
            const new_paths = new Set<Node[]>();
            for (const path of paths) {
                const back = path[path.length - 1];
                if (back == to) {
                    return path;
                }
                for (const child of back.childs) {
                    new_paths.add([...path, child]);
                }
            }
            paths = new_paths;
        }
    }
    longestPath(to: Node): Node[] {
        let longest_path = [] as Node[];
        let paths = new Set<Node[]>([[this]]);
        while (paths.size > 0) {
            const new_paths = new Set<Node[]>();
            for (const path of paths) {
                const back = path[path.length - 1];
                if (back == to) {
                    longest_path = path;
                }
                else {
                    for (const child of back.childs) {
                        if (!path.includes(child)) {
                            new_paths.add([...path, child]);
                        }
                    }
                }
            }
            paths = new_paths;
        }
        return longest_path;
    }
    minDistance(to: Node): number {
        return this.shortestPath(to).length - 1;
    }
    maxDistance(to: Node): number {
        return this.longestPath(to).length - 1;
    }
    // neighbours
    get topNeighbours(): Set<Node> {
        if (this.parents.size) {
            return new Set([...sample(this.parents).childs].filter((neighbour: Node) => setEqual(neighbour.parents, this.parents)));
        }
        else {
            return new Set();
        }
    }
    get bottomNeighbours(): Set<Node> {
        if (this.childs.size) {
            return new Set([...sample(this.childs).parents].filter((neighbour: Node) => setEqual(neighbour.childs, this.childs)));
        }
        else {
            return new Set();
        }
    }
    // syncline
    get topSyncline(): Set<Node> {
        if (this.parents.size == 0) {
            return new Set();
        }
        if (sample(this.parents).isStart()) {
            return new Set([...this.allNodes()].filter((node: Node) => !node.isStart()));
        }
        else {
            return new Set([...this.topNeighbours].filter((neighbour: Node) => neighbour.task.cook == this.task.cook));
        }
    }
    get bottomSyncline(): Set<Node> {
        if (this.childs.size == 0) {
            return new Set();
        }
        if (sample(this.childs).isEnd()) {
            return new Set([...this.allNodes()].filter((node: Node) => !node.isEnd()));
        }
        else {
            return new Set([...this.bottomNeighbours].filter((neighbour: Node) => neighbour.task.cook == this.task.cook));
        }
    }
    get hasTopSyncline(): boolean {
        return 1 < this.topSyncline.size || sample(this.parents)?.isStart();
    }
    get hasBottomSyncline(): boolean {
        return 1 < this.bottomSyncline.size || sample(this.childs)?.isEnd();
    }
    // members
    task: Task | null;
    parents: Set<Node>;
    childs: Set<Node>;
}