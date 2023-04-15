import { draw_recipe } from "../flowbuild/draw_recipe.js";
import { Cook } from "../flowbuild/recipe/cook.js";
import { Recipe } from "../flowbuild/recipe/recipe.js";
import { Task } from "../flowbuild/recipe/task.js";

// states
export let recipe = null as Recipe;

// recipe creation / loading
window["create_new_recipe"] = function(): void {
    console.log("create_new_recipe");
    recipe = new Recipe();
    const start = new Task("START", new Cook(""));
    const task1 = new Task("NEW TASK", new Cook(""));
    const last_step = new Task("LAST STEP", new Cook(""));
    const end = new Task("END", new Cook(""));
    recipe.add_connection(start, task1);
    recipe.add_connection(task1, last_step);
    recipe.add_connection(last_step, end);
    draw_recipe(recipe);
}
window["load_recipe_from_database"] = function(title: string): boolean {
    console.log("load_recipe_from_database", title);
    // IMPLEMENT
    return false;
}

// recipe uploading
window["upload_recipe"] = function(username: string, visibility: string): void {
    console.log("upload_recipe", username, visibility);
    // IMPLEMENT
}

// recipe data(operates on current recipe, either a new recipe or a loaded recipe)
window["set_recipe_title"] = function(title: string): void {
    console.log("set_recipe_title", title);
    recipe.title = title;
}
window["get_recipe_title"] = function(): string {
    console.log("get_recipe_title");
    return recipe.title;
}

window["get_recipe_ingredients"] = function(): { grocerie: string, quantity: string, unit: string }[] {
    console.log("get_recipe_ingredients");
    // IMPLEMENT
    return [];
}
window["set_recipe_ingredients"] = function(ingredients: { grocerie: string, quantity: string, unit: string }[]): void {
    console.log("get_recipe_ingredients", ingredients);
    // IMPLEMENT
}

window["set_recipe_images"] = function(url_list: string[]): void {
    console.log("set_recipe_images", url_list);
    // IMPLEMENT
}
window["get_recipe_images"] = function(): string[] {
    console.log("get_recipe_images");
    // IMPLEMENT
    return [];
}

window["set_recipe_duration"] = function(duration: number): void {
    console.log("set_recipe_duration", duration);
    recipe.duration = duration;
}
window["get_recipe_duration"] = function(): number {
    console.log("get_recipe_duration");
    return recipe.duration;
}

window["set_recipe_prep_time"] = function(prep_time: number): void {
    console.log("set_recipe_prep_time", prep_time);
    recipe.prep_time = prep_time;
}
window["get_recipe_prep_time"] = function(): number {
    console.log("get_recipe_prep_time");
    return recipe.prep_time;
}

window["set_recipe_difficulty"] = function(difficulty: string): void {
    console.log("set_recipe_difficulty", difficulty);
    recipe.difficulty = difficulty;
}
window["get_recipe_difficulty"] = function(): string {
    console.log("get_recipe_difficulty");
    return recipe.difficulty;
}

window["get_recipe_num_shares"] = function(): number {
    console.log("get_recipe_num_shares");
    // IMPLEMENT
    return NaN;
}
window["get_recipe_num_likes"] = function(): number {
    console.log("get_recipe_num_likes");
    // IMPLEMENT
    return NaN;
}

// task data(operates on task with id "task_id")
window["get_task_id"] = function(html_el: HTMLElement): number | null {
    console.log("get_task_id", html_el);
    if (!html_el.classList.contains('task')) {
        return null;
    }
    return parseInt(html_el.id);
}

window["set_task_description"] = function(task_id: number, description: string): void {
    console.log("set_task_description", task_id, description);
    recipe.get_task_by_id(task_id).description = description;
    draw_recipe(recipe);
}
window["get_task_description"] = function(task_id: number): string {
    console.log("get_task_description", task_id);
    return recipe.get_task_by_id(task_id).description;
}

window["get_task_ingredients"] = function(): { grocerie: string, quantity: string, unit: string }[] {
    console.log("get_task_ingredients");
    // IMPLEMENT
    return [];
}
window["set_task_ingredients"] = function(ingredients: { grocerie: string, quantity: string, unit: string }[]): void {
    console.log("set_task_ingredients", ingredients);
    // IMPLEMENT
}

window["get_task_cook"] = function(task_id: number): string {
    console.log("get_task_cook", task_id);
    return recipe.get_task_by_id(task_id).cook.name;
}
window["set_task_cook"] = function(task_id: number, cook: string): void {
    console.log("set_task_cook", task_id, cook);
    recipe.get_task_by_id(task_id).cook.name = cook;
    draw_recipe(recipe);
}

window["set_task_duration"] = function(task_id: number, duration: number): void {
    console.log("set_task_duration", task_id, duration);

    recipe.get_task_by_id(task_id).duration = duration;
}
window["get_task_duration"] = function(task_id: number): number {
    console.log("get_task_duration", task_id);

    return recipe.get_task_by_id(task_id).duration;
}

// modify flowchart(operates on current recipe)
window["add_task"] = function(previous_task_id: number): void {
    console.log("add_task", previous_task_id);
    const previous_task = recipe.get_task_by_id(previous_task_id);
    recipe.add_task(previous_task, new Task("new task", previous_task.cook));
    draw_recipe(recipe);
}
window["add_task_from_start"] = function(): void { // changed name !!!
    console.log("add_task_from_start");
    recipe.add_task_from_start(new Task("new task", new Cook("1")));
    draw_recipe(recipe);
}
window["add_task_between"] = function(previous_task_id: number, next_task_id: number): void {
    console.log("add_task_between", previous_task_id, next_task_id);
    const previous_task = recipe.get_task_by_id(previous_task_id);
    const task = new Task("new task", previous_task.cook);
    const next_task = recipe.get_task_by_id(next_task_id);
    recipe.add_task_between(previous_task, task, next_task);
    draw_recipe(recipe);
}

window["remove_task"] = function(task_id: number): void {
    console.log("remove_task", task_id);
    recipe.remove_task(recipe.get_task_by_id(task_id));
    draw_recipe(recipe);
}

window["add_connection"] = function(from_task_id: number, to_task_id: number): void {
    console.log("add_connection", from_task_id, to_task_id);
    recipe.add_connection(recipe.get_task_by_id(from_task_id), recipe.get_task_by_id(to_task_id));
    draw_recipe(recipe);
}
window["remove_connection"] = function(from_task_id: number, to_task_id: number): void {
    console.log("remove_connection", from_task_id, to_task_id);
    recipe.remove_connection(recipe.get_task_by_id(from_task_id), recipe.get_task_by_id(to_task_id));
    draw_recipe(recipe);
}