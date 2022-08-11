import { Graph } from "./Graph.js";


export class Recipe {
    name: string;
    #connections: Array<Array<string>>;
    #boxes: Set<string>;

    constructor(name: string) {
        this.name = name;
        this.#connections = [["START", "END"]];
        this.#boxes = new Set<string>();
        this.#boxes.add("START");
        this.#boxes.add("END");
    }

    AddConnection(from: string, to: string): void {
        if (!this.#boxes.has(to)) {
            this.#boxes.add(to);
            this.#connections.push([to, "END"]);
        }
        this.#connections = this.#connections.filter((pair: Array<string>) => { return pair[0] != from || pair[1] != "END"; });
        this.#connections.push([from, to]);
    }

    CreateGraph(): Graph {
        const graph = new Graph(this.#connections);
        if (!graph.is_valid) {
            console.log(`recipe \"${this.name}\" has an invalid graph`)
            console.table(this.#connections);
        }
        return graph;
    }
}