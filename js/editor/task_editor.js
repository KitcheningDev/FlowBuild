import { draw_recipe } from "../flowbuild/draw_recipe.js";
import { get_cook } from "../flowbuild/recipe/cook.js";
import { recipe } from "./editor.js";
import { hide_upload_card } from "./upload_editor.js";
const chart = document.getElementById('flowchart');
const task_card = document.getElementById('task-card');
const description_input = document.getElementById('description-input');
const duration_input = document.getElementById('duration-input');
const duration_list = document.getElementById('duration-list');
const cook_section = document.getElementById('cook-section');
const cook_list = document.getElementById('cook-list');
const cook1 = document.getElementById('cook-1');
const cook2 = document.getElementById('cook-2');
function is_num_seq(str) {
    if (str.length == 0) {
        return false;
    }
    for (let i = 0; i < str.length; ++i) {
        if (!('0' <= str[i] && str[i] <= '9')) {
            return false;
        }
    }
    return true;
}
class TaskEditor {
    constructor() {
        this.hide();
    }
    load_task_data() {
        description_input.value = this.task.description;
        if (this.task.cook.name == 'Küchenlehrling') {
            cook1.checked = true;
        }
        else if (this.task.cook.name == 'Küchenmeister') {
            cook2.checked = true;
        }
        else {
            cook1.checked = false;
            cook2.checked = false;
        }
        if (this.task.duration % 3600 == 0 && this.task.duration != 0) {
            duration_input.value = (this.task.duration / 3600).toString();
            document.getElementById('hour').checked = true;
        }
        else if (this.task.duration % 60 == 0 && this.task.duration != 0) {
            duration_input.value = (this.task.duration / 60).toString();
            document.getElementById('min').checked = true;
        }
        else {
            duration_input.value = this.task.duration.toString();
            document.getElementById('sec').checked = true;
        }
        for (const pair of cook_list.children) {
            if (pair.children[1].textContent == this.task.cook.name) {
                pair.children[1].checked = true;
            }
        }
        this.submit_duration();
    }
    // description
    submit_description() {
        this.task.description = description_input.value.trim();
        draw_recipe(recipe);
    }
    validate_description() {
        if (description_input.value != '') {
            return true;
        }
        else {
            return false;
        }
    }
    // cook
    submit_cook() {
        if (cook1.checked) {
            this.task.cook = get_cook('Küchenlehrling');
        }
        else if (cook2.checked) {
            this.task.cook = get_cook('Küchenmeister');
        }
        draw_recipe(recipe);
    }
    // duration
    submit_duration() {
        if (is_num_seq(duration_input.value)) {
            duration_input.style.borderColor = "";
            this.task.duration = parseInt(duration_input.value);
            if (document.getElementById('min').checked) {
                this.task.duration *= 60;
            }
            else if (document.getElementById('min').checked) {
                this.task.duration *= 3600;
            }
        }
        else {
            duration_input.style.borderColor = "red";
        }
    }
    // toggle
    show(task) {
        if (recipe.get_last_step() == task) {
            cook_section.style.display = 'none';
        }
        else {
            cook_section.style.display = '';
        }
        hide_upload_card();
        this.task = task;
        task_card.style.display = "";
        this.load_task_data();
    }
    hide() {
        task_card.style.display = "none";
        this.task = null;
    }
}
;
export const task_editor = new TaskEditor();
// toggle task editor
chart.addEventListener('click', (e) => {
    const el = e.target;
    if (el.classList.contains('flow-task')) {
        const task = recipe.get_task_by_id(parseInt(el.id));
        if (task_editor.task == task) {
            task_editor.hide();
        }
        else {
            task_editor.show(task);
        }
    }
});
// supress enter
document.addEventListener('keypress', (e) => {
    if (e.key == 'Enter') {
        e.preventDefault();
    }
});
// description
description_input.addEventListener('keyup', (e) => {
    if (e.key != "Enter") {
        task_editor.validate_description();
    }
});
description_input.addEventListener('keypress', (e) => {
    if (e.key == "Enter") {
        if (task_editor.validate_description()) {
            task_editor.submit_description();
        }
    }
});
// cook
cook_list.addEventListener('click', (e) => {
    task_editor.submit_cook();
});
// duration
duration_input.addEventListener('keyup', (e) => {
    task_editor.submit_duration();
});
duration_list.addEventListener('click', (e) => {
    task_editor.submit_duration();
});
//# sourceMappingURL=task_editor.js.map