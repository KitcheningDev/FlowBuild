import { Graph } from "./Graph.js";


export class Recipe {
    name: string;
    graph: Graph;
    #connections: Array<Array<string>>;

    constructor(name: string) {
        this.name = name;
        this.#connections = [["START", "END"]];
        this.graph = new Graph(this.#connections);
    }

    AddConnection(from: string, to: string): void {
        this.#connections.push([from, to]);
    }

    UpdateGraph(): void {
        this.graph = new Graph(this.#connections);
    }
}