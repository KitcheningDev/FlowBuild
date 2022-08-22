import { Graph } from "./Graph.js";

export class Recipe {
    name: string;
    #connections: Array<Array<string>>;
    #boxes: Set<string>;

    constructor(name: string, connections: Array<Array<string>>) {
        this.name = name;
        this.#boxes = new Set<string>();
        this.SetConnections(connections);
    }

    AddConnection(from: string, to: string): void {
        this.#connections = this.#connections.filter((pair: Array<string>) => { return !(pair[0] == from && pair[1] == "END"); });
        if (!this.#boxes.has(to)) {
            this.#boxes.add(to);
            this.#connections.push([to, "END"]);
        }
        this.#connections.push([from, to]);
    }
    SetConnections(connections: Array<Array<string>>): void {
        this.#connections = connections;
        this.#boxes.clear();
        for (const connection of connections) {
            for (const text of connection) {
                if (!this.#boxes.has(text))
                    this.#boxes.add(text);
            }
        }
    }
    
    CreateGraph(): Graph {
        const graph = new Graph(this.#connections);
        if (!graph.is_valid) {
            alert(`recipe \"${this.name}\" has an invalid graph`)
            console.table(this.#connections);
        }
        return graph;
    }
}