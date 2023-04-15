import { RecipeModifier } from "../editor/recipe_modifier.js";
import { draw_recipe } from "../flowbuild/draw_recipe.js";
import { get_cook } from "../flowbuild/recipe/cook.js";
import { Recipe } from "../flowbuild/recipe/recipe.js";
import { Task } from "../flowbuild/recipe/task.js";

const chart = document.getElementById("chart");
let shift_pressed = false;
let num_pressed = 0;
let connector = null as HTMLElement;
let from_task = null as Task;
let to_task = null as Task | 'trash';
const modifier = new RecipeModifier(new Recipe());
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
    chart.style.setProperty('--connector-opacity', '');
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
        chart.style.setProperty('--add-opacity', '0');
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
        chart.style.setProperty('--add-opacity', '');
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
    if ((e.target as HTMLElement).parentElement === null) {
        return;
    }
    if ((e.target as HTMLElement).parentElement.classList.contains("flow-task")) {
        connector = e.target as HTMLElement;
        chart.style.setProperty('--connector-opacity', '0');
        from_task = modifier.recipe.get_task_by_id(parseInt(connector.parentElement.id));
    }
    else if ((e.target as HTMLElement).classList.contains("flow-start")) {
        chart.style.setProperty('--connector-opacity', '0');
        from_task = modifier.recipe.get_task_by_id(parseInt((e.target as HTMLElement).id));
    }
});
document.addEventListener('mouseup', (e: Event) => {
    if ((e.target as HTMLElement).parentElement === null) {
        return;
    }
    if ((e.target as HTMLElement).parentElement.classList.contains("flow-task")) {
        to_task = modifier.recipe.get_task_by_id(parseInt((e.target as HTMLElement).parentElement.id));
    }
    else if ((e.target as HTMLElement).id == "remove-task") {
        to_task = 'trash';
    }
    handle_edit();
});
draw_recipe(modifier.recipe);


// WEBSITE SPECIFIC
const task_table = document.getElementById("tasktable");
const task_description_input = document.getElementById("task-1-text");
const task_cook_input = document.getElementById("cook-cell");
const task_duration_input = document.getElementById("duration-input");

let selected_task = null as Task;
chart.addEventListener('click', (e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("flow-task")) {
        selected_task = modifier.recipe.get_task_by_id(parseInt((e.target as HTMLElement).id));
        task_description_input.innerText = selected_task.description;
        task_cook_input.innerText = selected_task.cook.is_empty() ? '-' : selected_task.cook.name;
        task_duration_input.innerText = selected_task.duration.toString() + " min";
        task_table.style.display = "flex";
    }
    else {
        selected_task = null;
        task_table.style.display = "none";
    } 
});
task_description_input.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key == "Enter") {
        selected_task.description = task_description_input.innerText;
        draw_recipe(modifier.recipe);
    }
});
task_cook_input.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key == "Enter") {
        if (!selected_task.cook.is_empty()) {
            selected_task.cook = get_cook(task_cook_input.innerText);
            draw_recipe(modifier.recipe);
        }
    }
});
task_duration_input.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key == "Enter") {
        if (!selected_task.cook.is_empty()) {
            selected_task.duration = parseInt(task_duration_input.innerText);
            draw_recipe(modifier.recipe);
        }
    }
});