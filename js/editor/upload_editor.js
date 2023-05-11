import { recipe } from "./editor.js";
import { upload_recipe } from "./server.js";
import { task_editor } from "./task_editor.js";
const upload_btn = document.getElementById('upload-btn');
const submit_btn = document.getElementById('recipe-submit');
const upload_card = document.getElementById('upload-card');
// form
const title_input = document.getElementById('title-input');
const duration_input = document.getElementById('recipe-duration-input');
const difficulty_list = document.getElementById('difficulty-list');
const diff1 = document.getElementById('diff-1');
const diff2 = document.getElementById('diff-2');
const diff3 = document.getElementById('diff-3');
const diff4 = document.getElementById('diff-4');
const diff5 = document.getElementById('diff-5');
const duration_list = document.getElementById('recipe-duration-list');
const sec_btn = document.getElementById('recipe-sec');
const min_btn = document.getElementById('recipe-min');
const hour_btn = document.getElementById('recipe-hour');
// load
export function load_upload() {
    title_input.value = recipe.title;
    document.getElementById('diff-' + recipe.difficulty).checked = true;
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
// title update
title_input.addEventListener('keypress', (e) => recipe.title = title_input.value.trim());
// difficulty update
difficulty_list.addEventListener('click', (e) => {
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
// duration update
function update_duration() {
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
duration_input.addEventListener('keypress', (e) => update_duration());
duration_list.addEventListener('click', (e) => update_duration());
// visibility
export function show_upload_card() {
    upload_card.style.display = '';
    task_editor.hide();
}
export function hide_upload_card() {
    upload_card.style.display = 'none';
}
function toggle_upload_card() {
    if (upload_card.style.display == 'none') {
        show_upload_card();
    }
    else {
        hide_upload_card();
    }
}
upload_btn.addEventListener('click', (e) => {
    toggle_upload_card();
});
submit_btn.addEventListener('click', (e) => {
    upload_recipe();
    toggle_upload_card();
});
//# sourceMappingURL=upload_editor.js.map