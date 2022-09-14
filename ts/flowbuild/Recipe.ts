import { Graph } from "./Graph.js";
import { Includes, LastElem, ObjEqualsFunc } from "../Utils/Funcs.js";

export interface Connection {
    from: string;
    to: string;
}
interface ConnectionChange {
    added: Connection[];
    removed: Connection[];
}
export class Recipe {
    name: string;

    #conns: Connection[];
    #change_log: ConnectionChange[];

    #graph: Graph;
    #changed: boolean;

    constructor(name: string, paths: string[][]) {
        this.name = name;

        this.#conns = [];
        this.#change_log = [];

        this.#graph = null;
        this.#changed = true;
        
        this.SetConnections(paths);
    }

    AddConn(from: string, to: string): void {
        const conn = { from: from, to: to };
        if (Includes(this.#conns, ObjEqualsFunc(conn)))
            return;
        
        this.#changed = true;
        const conn_change = { added: [], removed: [] };

        this.#conns = this.#conns.filter((conn2: Connection) => 
            {
                if ((conn2.from == "START" && conn2.to == to) || (conn2.from == from && conn2.to == "END")) {
                    conn_change.removed.push(conn2);
                    return false;
                }
                return true;
            });

        if (from != "START" && !Includes(this.#conns, (val: Connection) => { return val.to == from; })) {
            this.#conns.push({ from: "START", to: from });
            conn_change.added.push({ from: "START", to: from });
        }
        if (to != "END" && !Includes(this.#conns, (val: Connection) => { return val.from == to; })) {
            this.#conns.push({ from: to, to: "END" });
            conn_change.added.push({ from: to, to: "END" });
        } 
  
        this.#conns.push(conn);
        conn_change.added.push(conn);

        this.#change_log.push(conn_change);
    }
    UndoConn(): void {
        if (this.#change_log.length == 0)
            return;

        this.#changed = true;
        
        const connection_change = LastElem(this.#change_log);
        this.#conns = this.#conns.filter((conn: Connection) => { return !Includes(connection_change.added, ObjEqualsFunc(conn)); });
        for (const conn of connection_change.removed)
            this.#conns.push(conn);
        
        this.#change_log.pop();
    }
    SetConnections(paths: string[][]): void {
        this.#changed = true;
        this.#conns = [];
        this.#change_log = [];
        for (const path of paths) {
            let from: string;
            for (const text of path) {
                const conn = { from: from, to: text };
                if (from && !Includes(this.#conns, ObjEqualsFunc(conn)))
                    this.#conns.push(conn);
                from = text;
            }
        }
    }
    Includes(text: string): boolean {
        return Includes(this.#conns, (val: Connection) => { return val.from == text || val.to == text; });
    }

    get graph(): Graph {
        if (this.#changed) {
            this.#graph = new Graph(this.#conns);
            if (!this.#graph.is_valid) {
                console.log(`Recipe \"${this.name}\" created invalid graph!`);
                console.log(...this.#conns);
            }
            this.#changed = false;
            console.log(...this.#conns);
        }
        return this.#graph;
    }
}