export function flatten_graph(graph) {
    const out = [];
    const queue = [graph.start];
    while (queue.length > 0) {
        const path = queue.shift();
        if (!out.includes(path)) {
            out.push(path);
            for (const child of path.childs) {
                queue.push(child);
            }
        }
    }
    return out;
}
//# sourceMappingURL=flatten.js.map