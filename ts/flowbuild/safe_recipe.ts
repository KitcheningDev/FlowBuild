import { recipe_t } from "./recipe.js";
import { task_t } from "./task.js";

export function recipe_to_json(recipe: recipe_t): object {
    const json = {};
    json["name"] = recipe.name;
    json["tasks"] = [];
    const tasks = new Set<task_t>();
    for (const conn of recipe.conns.values()) {
        tasks.add(conn.from);
        tasks.add(conn.to);
    }
    for (const task of tasks) {
        json["tasks"].push({ str: task.str, cook_id: task.cook_id, duration: task.duration });
    }
    json["conns"] = [];
    for (const conn of recipe.conns.values()) {
        json["conns"].push([conn.from.id, conn.to.id]);
    }
    return json;
}
export function safe_recipe(recipe: recipe_t) {
}