import { Graph } from "./Graph.js";
import { Includes, ObjEqualsFunc, LastElem, RemoveObj } from "../Utils/Funcs.js";

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
    #curr_change: ConnectionChange;
    #change_log: ConnectionChange[];

    #graph: Graph;
    #changed_conns: boolean;

    constructor(name: string, paths: string[][]) {
        this.name = name;

        this.#conns = [];
        for (const path of paths) {
            let last: string;
            for (const curr of path) {
                if (last != undefined)
                    this.#conns.push({ from: last, to: curr });
                last = curr;
            }
        }
        this.#curr_change = null;
        this.#change_log = [];

        this.#graph = null;
        this.#changed_conns = true;
    }

    StartChange(): void {
        this.#curr_change = { added: [], removed: [] } as ConnectionChange;
    }
    CommitChange(): void {
        this.#conns = this.#conns.filter((conn: Connection) => { return !Includes(this.#curr_change.removed, ObjEqualsFunc(conn)); });
        for (const add of this.#curr_change.added)
            this.#conns.push(add);
        
        if (this.#curr_change.added.length > 0 || this.#curr_change.removed.length > 0)
            this.#change_log.push(this.#curr_change);
        this.#curr_change = null;
        this.#changed_conns = true;
        console.log(...this.#conns);
    }
    UndoChange(): void {
        if (this.#change_log.length == 0)
            return;

        
        const last_change = LastElem(this.#change_log);
        this.#conns = this.#conns.filter((conn: Connection) => { return !Includes(last_change.added, ObjEqualsFunc(conn)); });
        for (const conn of last_change.removed)
            this.#conns.push(conn);
        
        this.#change_log.pop();
        this.#changed_conns = true;
    }

    AddConn(from: string, to: string): void {
        console.assert(this.#curr_change != null, "You need to start a change before you add connections to the recipe!");
        this.#curr_change.added.push({ from: from, to: to });
    }
    RemoveConn(from: string, to: string): void {
        console.assert(this.#curr_change != null, "You need to start a change before you remove connections from the recipe!");
        this.#curr_change.removed.push({ from: from, to: to });
    }

    HasText(text: string): boolean {
        return Includes(this.#conns, (val: Connection) => { return val.from == text || val.to == text; });
    }
    HasParent(text: string): boolean {
        return Includes(this.#conns, (val: Connection) => { return val.to == text; });
    }
    HasChild(text: string): boolean {
        return Includes(this.#conns, (val: Connection) => { return val.from == text; });
    }
    HasConn(from: string, to: string): boolean {
        return Includes(this.#conns, ObjEqualsFunc({ from: from, to: to } as Connection));
    }

    get graph(): Graph {
        if (this.#changed_conns) {
            this.#graph = new Graph(this.#conns);
            console.assert(this.#graph.is_valid, `Recipe \"${this.name}\" created invalid graph!`, ...this.#conns);
            this.#changed_conns = false;
        }
        return this.#graph;
    }
}