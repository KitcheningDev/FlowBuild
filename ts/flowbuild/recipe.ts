import { connection_t } from "./connection.js";
import { create_paths, graph_t } from "./graph.js";
import { ID, task_t } from "./task.js";

export class recipe_t {
    title: string;
    difficulty: string;
    duration: number;

    #conns: Map<ID, connection_t>;

    #has_changed: boolean;
    #graph: graph_t;

    constructor(json: any) {
        // load json
        this.title = json["name"];
        this.difficulty = "none";
        this.duration = 0;
        
        const task_map = new Map<string, task_t>();
        if (json['cooks'] != undefined) {
            let cook_id = 1;
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
                        task_map.set(from, new task_t(from, 0));
                    }
                    const from_task = task_map.get(from);
                    if (!task_map.has(to)) {
                        task_map.set(to, new task_t(to, 0));
                    }
                    const to_task = task_map.get(to);
                    const conn = new connection_t(from_task, to_task);
                    this.#conns.set(conn.id, conn);
                }
                from = to;
            }
        }
        this.#has_changed = true;
    }
    add_conn(conn: connection_t): void {
        if (!this.#conns.has(conn.id)) {
            this.#conns.set(conn.id, conn);
            this.#has_changed = true;
        }
    }
    rm_conn(conn: connection_t): void {
        if (this.#conns.has(conn.id)) {
            this.#conns.delete(conn.id);
            this.#has_changed = true;
        }
    }
    has_conn(conn: connection_t): boolean {
        return this.#conns.has(conn.id);
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
    has_description(str: string): boolean {
        for (const conn of this.#conns.values()) {
            if (conn.from.str == str) {
                return true;
            }
            else if (conn.to.str == str) {
                return true;
            }
        }
        return false;
    }

    copy(): recipe_t {
        const recipe = new recipe_t({ name: this.title, paths: [] });
        for (const conn of this.#conns.values()) {
            recipe.add_conn(conn);
        }
        return recipe;
    }

    get conns(): Map<ID, connection_t> {
        return this.#conns;
    }
    get cook_count(): number {
        return this.graph.cook_count;
    }
    get graph(): graph_t {
        if (this.#has_changed) {
            this.update();
        }
        return this.#graph;
    }

    update(): void {
        this.#graph = new graph_t(create_paths(this.#conns));
        this.#has_changed = false;
    }
}