import { RecipeModifier } from "../editor/recipe_modifier.js";
import { draw_recipe } from "../flowbuild/draw_recipe.js";
import { Recipe } from "../flowbuild/recipe/recipe.js";
import { Task } from "../flowbuild/recipe/task.js";
import { modifier, recipe } from "./editor.js";

const chart = document.getElementById("flowchart");
let shift_pressed = false;
let num_pressed = 0;
let connector = null as HTMLElement;
let from_task = null as Task;
let to_task = null as Task | 'trash';
function handle_edit(): void {
    let is_modified = false;
    if (to_task === 'trash') {
        is_modified = modifier.handle_edit(from_task, null, 'remove', '');
    }
    else {
        is_modified = modifier.handle_edit(from_task, to_task as Task, shift_pressed ? 'remove' : 'add', num_pressed.toString());
    }
    if (is_modified) {
        modifier.do_change();
        draw_recipe(modifier.recipe);
    }
    document.body.style.setProperty('--connector-opacity', '');
    reset();
}
function reset(): void {
    if (connector) {
        connector.style.opacity = '';
    }
    connector = null;
    from_task = null;
    to_task = null;
}

document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key == 'Shift') {
        shift_pressed = true;
        document.body.style.setProperty('--add-opacity', '0');
    }
    for (let i = 1; i < 10; ++i) {
        if (e.key == i.toString()) {
            num_pressed = i;
            return;
        }
    }
});
document.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.key == 'Shift') {
        shift_pressed = false;
        document.body.style.setProperty('--add-opacity', '');
    }
    if (e.key == num_pressed.toString()) {
        num_pressed = 0;
    }
});
document.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key == 'u') {
        console.log("Undo");
        modifier.undo_change();
        draw_recipe(modifier.recipe);
    }
});
chart.addEventListener('mousedown', (e: Event) => {
    reset();
    const el = e.target as HTMLElement;
    if (el.parentElement === null) {
        return;
    }
    if (el.parentElement.classList.contains("flow-task")) {
        document.body.style.setProperty('--connector-opacity', '0');
        from_task = modifier.recipe.get_task_by_id(parseInt(el.parentElement.id));
    }
    else if (el.classList.contains("flow-start")) {
        document.body.style.setProperty('--connector-opacity', '0');
        from_task = modifier.recipe.get_task_by_id(parseInt(el.id));
    }
});
document.addEventListener('mouseup', (e: Event) => {
    const el = e.target as HTMLElement;
    if (el.parentElement === null) {
        return;
    }
    if (el.parentElement.classList.contains("flow-task")) {
        to_task = modifier.recipe.get_task_by_id(parseInt(el.parentElement.id));
    }
    else if (el.parentElement.id == "remove-task") {
        to_task = 'trash';
    }
    handle_edit();
});