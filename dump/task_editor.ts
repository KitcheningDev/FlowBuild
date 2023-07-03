import { drawRecipe } from "../flowbuild/draw_recipe.js";
import { Cook1, Cook2, Task } from "../flowbuild/recipe/task.js";
import { recipe } from "./editor.js";
import { hideUploadCard } from "./upload_editor.js";

const chart = document.getElementById('flowchart');
const task_card = document.getElementById('task-card');
const description_input = document.getElementById('description-input') as HTMLInputElement;
const duration_input = document.getElementById('duration-input') as HTMLInputElement;

const duration_list = document.getElementById('duration-list') as HTMLInputElement;

const cook_section = document.getElementById('cook-section');
const cook_list = document.getElementById('cook-list');
const cook1 = document.getElementById('cook-1') as HTMLInputElement;
const cook2 = document.getElementById('cook-2') as HTMLInputElement;

function isNumSeq(str: string): boolean {
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
    loadTaskData(): void {
        description_input.value = this.task.description;
        if (this.task.cook == Cook1) {
            cook1.checked = true;
        }
        else if (this.task.cook == Cook2) {
            cook2.checked = true;
        }
        else {
            cook1.checked = false;
            cook2.checked = false;
        }
        if (this.task.duration % 3600 == 0 && this.task.duration != 0) {
            duration_input.value = (this.task.duration / 3600).toString();
            (document.getElementById('hour') as HTMLInputElement).checked = true;
        }
        else if (this.task.duration % 60 == 0 && this.task.duration != 0) {
            duration_input.value = (this.task.duration / 60).toString();
            (document.getElementById('min') as HTMLInputElement).checked = true;
        }
        else {
            duration_input.value = this.task.duration.toString();
            (document.getElementById('sec') as HTMLInputElement).checked = true;
        }
        for (const pair of cook_list.children) {
            if (pair.children[1].textContent == this.task.cook.name) {
                (pair.children[1] as HTMLInputElement).checked = true;
            }
        }
        this.submitDuration();
    }
    // description
    submitDescription(): void {
        this.task.description = description_input.value.trim();
        drawRecipe(recipe);
    }
    validateDescription(): boolean {
        if (description_input.value != '') {
            return true;
        }
        else {
            return false;
        }
    }
    // cook
    submitCook(): void {
        if (cook1.checked) {
            this.task.cook = Cook1;
        }
        else if (cook2.checked) {
            this.task.cook = Cook2;
        }
        drawRecipe(recipe);
    }
    // duration
    submitDuration(): void {
        if (isNumSeq(duration_input.value)) {
            duration_input.style.borderColor = "";
            this.task.duration = parseInt(duration_input.value);
            if ((document.getElementById('min') as HTMLInputElement).checked) {
                this.task.duration *= 60;
            }
            else if ((document.getElementById('min') as HTMLInputElement).checked) {
                this.task.duration *= 3600;
            }
        }
        else {
            duration_input.style.borderColor = "red";
        }
    }
    // toggle
    show(task: Task): void {
        if (recipe.end == task) {
            cook_section.style.display = 'none';
        }
        else {
            cook_section.style.display = '';
        }

        hideUploadCard();
        this.task = task;
        task_card.style.display = "";
        this.loadTaskData();
    }
    hide(): void {
        task_card.style.display = "none";
        this.task = null;
    }
    // member
    task: Task;
};
export const task_editor = new TaskEditor();

// toggle task editor
chart.addEventListener('click', (e: MouseEvent) => {
    const el = e.target as HTMLElement;
    if (el.classList.contains('flow-task')) {
        const task = recipe.byID(parseInt(el.id));
        if (task_editor.task == task) {
            task_editor.hide();
        }
        else {
            task_editor.show(task);
        }
    }
});
// supress enter
document.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key == 'Enter') {
        e.preventDefault();
    }
});
// description
description_input.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.key != "Enter") {
        task_editor.validateDescription();
    }
});
description_input.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key == "Enter") {
        if (task_editor.validateDescription()) {
            task_editor.submitDescription();
        }
    }
});
// cook
cook_list.addEventListener('click', (e: MouseEvent) => {
    task_editor.submitCook();
});
// duration
duration_input.addEventListener('keyup', (e: KeyboardEvent) => {
    task_editor.submitDuration();
});
duration_list.addEventListener('click', (e: MouseEvent) => {
    task_editor.submitDuration();
});