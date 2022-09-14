import * as Utils from "../Utils/Funcs.js";
import { Graph } from "./Graph.js";

export type Connection = [string, string];
export class Recipe {
    name: string;

    #connections: Connection[];
    #change_log: number[];

    #graph: Graph;
    #changed: boolean;

    constructor(name: string, paths: string[][]) {
        this.name = name;
        this.#connections = [];
        this.#change_log = [];
        this.#graph = null;
        this.#changed = true;
        this.SetConnections(paths);
    }

    AddConn(from: string, to: string): void {
        this.#changed = true;
        const connection = [from, to] as Connection;
        if (Utils.Includes(this.#connections, Utils.ArrEqualsFunc(connection)))
            return;
        let connection_count = 1;
        if (!Utils.Includes(this.#connections, (val: Connection) => { return val[1] == from; })) {
            this.#connections.push(["START", from]);
            connection_count++;
        }
        if (!Utils.Includes(this.#connections, (val: Connection) => { return val[0] == to; })) {
            this.#connections.push([to, "END"]);
            connection_count++;
        } 
        this.#connections.push(connection);
        this.#change_log.push(connection_count);
    }
    UndoConn(): void {
        this.#changed = true;
        if (this.#change_log.length == 0)
            return;
        for (let i = 0; i < Utils.LastElem(this.#change_log); ++i)
            this.#connections.pop();
        this.#change_log.pop();
    }
    SetConnections(paths: string[][]): void {
        this.#changed = true;
        this.#connections = [];
        for (const path of paths) {
            let from: string;
            for (const text of path) {
                const connection = [from, text] as Connection;
                if (from && !Utils.Includes(this.#connections, Utils.ArrEqualsFunc(connection)))
                    this.#connections.push(connection);
                from = text;
            }
        }
    }
    Includes(text: string): boolean {
        return Utils.Includes(this.#connections, (val: Connection) => { return val[0] == text || val[1] == text; });
    }

    get graph(): Graph {
        if (this.#changed) {
            this.#graph = new Graph(this.#connections);
            if (!this.#graph.is_valid) {
                console.log(`Recipe \"${this.name}\" created invalid graph!`);
                console.log(...this.#connections);
            }
            this.#changed = false;
        }
        return this.#graph;
    }
}