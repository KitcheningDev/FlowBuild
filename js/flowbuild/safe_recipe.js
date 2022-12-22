export function recipe_to_json(recipe) {
    const json = {};
    json["name"] = recipe.name;
    json["tasks"] = [];
    const tasks = new Set();
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
export function safe_recipe(recipe) {
}
//# sourceMappingURL=safe_recipe.js.map