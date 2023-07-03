import { recipe } from "./editor.js";
import { task_editor } from "./task_editor.js";

const upload_btn = document.getElementById('upload-btn');
const submit_btn = document.getElementById('recipe-submit');
const upload_card = document.getElementById('upload-card');

// form
const title_input = document.getElementById('title-input') as HTMLInputElement;
const duration_input = document.getElementById('recipe-duration-input') as HTMLInputElement;

const difficulty_list = document.getElementById('difficulty-list'); 
const diff1 = document.getElementById('diff-1') as HTMLInputElement;
const diff2 = document.getElementById('diff-2') as HTMLInputElement;
const diff3 = document.getElementById('diff-3') as HTMLInputElement;
const diff4 = document.getElementById('diff-4') as HTMLInputElement;
const diff5 = document.getElementById('diff-5') as HTMLInputElement;

const duration_list = document.getElementById('recipe-duration-list');
const sec_btn = document.getElementById('recipe-sec') as HTMLInputElement;
const min_btn = document.getElementById('recipe-min') as HTMLInputElement;
const hour_btn = document.getElementById('recipe-hour') as HTMLInputElement;

// load
export function loadUploadCard(): void {
    title_input.value = recipe.title;
    (document.getElementById('diff-' + recipe.difficulty) as HTMLInputElement).checked = true;
    if (recipe.duration != 0) {
        if (recipe.duration % 3600 == 0) {
            duration_input.value = (recipe.duration / 3600).toString();
            sec_btn.checked = true;
        }
        else if (recipe.duration % 60 == 0) {
            duration_input.value = (recipe.duration / 60).toString();
            min_btn.checked = true;
        }
        else {
            duration_input.value = recipe.duration.toString();
            hour_btn.checked = true;
        }    
    }
    else {
        duration_input.value = recipe.duration.toString();
        hour_btn.checked = true;
    }
}
// title
title_input.addEventListener('keypress', () => recipe.title = title_input.value.trim());
// difficulty
difficulty_list.addEventListener('click', () => {
    if (diff1.checked) {
        recipe.difficulty = 1;
    }
    else if (diff2.checked) {
        recipe.difficulty = 2;
    }
    else if (diff3.checked) {
        recipe.difficulty = 3;
    }
    else if (diff4.checked) {
        recipe.difficulty = 4;
    }
    else if (diff5.checked) {
        recipe.difficulty = 5;
    }
});
// duration
function updateDuration(): void {
    if (sec_btn.checked) {
        recipe.duration = parseInt(duration_input.value);
    }
    else if (min_btn.checked) {
        recipe.duration = parseInt(duration_input.value) * 60;
    }
    else if (hour_btn.checked) {
        recipe.duration = parseInt(duration_input.value) * 3600;
    }
}
duration_input.addEventListener('keypress', () => updateDuration());
duration_list.addEventListener('click', () => updateDuration());
// visibility
export function showUploadCard(): void {
    upload_card.style.display = '';
    task_editor.hide();
}
export function hideUploadCard(): void {
    upload_card.style.display = 'none';
}

function toggleUploadCard(): void {
    if (upload_card.style.display == 'none') {
        showUploadCard();
    }
    else {
        hideUploadCard();
    }
}
upload_btn.addEventListener('click', () => toggleUploadCard());
submit_btn.addEventListener('click', () => {
    // upload_recipe();
    toggleUploadCard();
});