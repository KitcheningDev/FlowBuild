import { connection_t } from "./connection.js";
import { create_path_map, graph_t } from "./graph.js";
import { Hash, ID } from "./hash_str.js";
import { task_t } from "./task.js";

export class recipe_t {
    name: string;

    #conns: Map<Hash, connection_t>;

    #has_changed: boolean;
    #graph: graph_t;
    #cook_count: number;

    constructor(json: any) {
        this.name = json["name"];

        const task_map = new Map<string, task_t>();
        if (json['cooks'] != undefined) {
            let cook_id = 0;
            for (const cook_arr of json["cooks"]) {
                for (const str of cook_arr) {
                    if (!task_map.has(str)) {
                        task_map.set(str, new task_t(str, cook_id));
                    }
                }
                cook_id++;
            }
        }

        this.#conns = new Map<ID, connection_t>();
        for (const path of json["paths"]) {
            let from: string;
            for (const to of path) {
                if (from !== undefined) {
                    if (!task_map.has(from)) {
                        task_map.set(from, new task_t(from, -1));
                    }
                    const from_task = task_map.get(from);
                    if (!task_map.has(to)) {
                        task_map.set(to, new task_t(to, -1));
                    }
                    const to_task = task_map.get(to);
                    const conn = new connection_t(from_task, to_task);
                    this.#conns.set(conn.hash, conn);
                }
                from = to;
            }
        }
        this.#has_changed = true;
    }
    add_conn(conn: connection_t): void {
        this.#conns.set(conn.hash, conn);
        this.#has_changed = true;
    }
    rm_conn(conn: connection_t): void {
        this.#conns.delete(conn.hash);
        this.#has_changed = true;
    }
    has_conn(conn: connection_t): boolean {
        return this.#conns.has(conn.hash);
    }
    get_task(id: ID): task_t {
        for (const conn of this.#conns.values()) {
            if (conn.from.id == id) {
                return conn.from;
            }
            else if (conn.to.id == id) {
                return conn.to;
            }
        }
        return null;
    }

    get graph(): graph_t {
        if (this.#has_changed) {
            this.update();
        }
        return this.#graph;
    }
    get cook_count(): number {
        if (this.#has_changed) {
            this.update();
        }
        return this.#cook_count;
    }
    get conns(): Map<ID, connection_t> {
        return this.#conns;
    }

    update(): void {
        this.#graph = new graph_t(create_path_map(this.#conns));
        const cook_set = new Set<number>();
        this.#conns.forEach((conn: connection_t) => { cook_set.add(conn.from.cook_id); cook_set.add(conn.to.cook_id); });
        this.#cook_count = cook_set.size > 1 ? cook_set.size - 1 : 1;
        this.#has_changed = false;
    }
}