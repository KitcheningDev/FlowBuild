import { sample, setEqual } from "../../utils/set.js";
export class Node {
    constructor(task = null, parents = new Set(), childs = new Set()) {
        this.task = task;
        this.parents = parents;
        this.childs = childs;
    }
    // graph properties
    isStart() {
        return this.parents.size == 0;
    }
    isEnd() {
        return this.childs.size == 0;
    }
    allNodes(nodes = new Set()) {
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
    reachable(to, visited = new Set()) {
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
    inLoop() {
        return this.reachable(this);
    }
    shortestPath(to) {
        let paths = new Set([[this]]);
        while (true) {
            const new_paths = new Set();
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
    longestPath(to) {
        let longest_path = [];
        let paths = new Set([[this]]);
        while (paths.size > 0) {
            const new_paths = new Set();
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
    minDistance(to) {
        return this.shortestPath(to).length - 1;
    }
    maxDistance(to) {
        return this.longestPath(to).length - 1;
    }
    // neighbours
    get topNeighbours() {
        if (this.parents.size) {
            return new Set([...sample(this.parents).childs].filter((neighbour) => setEqual(neighbour.parents, this.parents)));
        }
        else {
            return new Set();
        }
    }
    get bottomNeighbours() {
        if (this.childs.size) {
            return new Set([...sample(this.childs).parents].filter((neighbour) => setEqual(neighbour.childs, this.childs)));
        }
        else {
            return new Set();
        }
    }
    // syncline
    get topSyncline() {
        if (this.parents.size == 0) {
            return new Set();
        }
        if (sample(this.parents).isStart()) {
            return new Set([...this.allNodes()].filter((node) => !node.isStart()));
        }
        else {
            return new Set([...this.topNeighbours].filter((neighbour) => neighbour.task.cook == this.task.cook));
        }
    }
    get bottomSyncline() {
        if (this.childs.size == 0) {
            return new Set();
        }
        if (sample(this.childs).isEnd()) {
            return new Set([...this.allNodes()].filter((node) => !node.isEnd()));
        }
        else {
            return new Set([...this.bottomNeighbours].filter((neighbour) => neighbour.task.cook == this.task.cook));
        }
    }
    get hasTopSyncline() {
        var _a;
        return 1 < this.topSyncline.size || ((_a = sample(this.parents)) === null || _a === void 0 ? void 0 : _a.isStart());
    }
    get hasBottomSyncline() {
        var _a;
        return 1 < this.bottomSyncline.size || ((_a = sample(this.childs)) === null || _a === void 0 ? void 0 : _a.isEnd());
    }
}
//# sourceMappingURL=node.js.map