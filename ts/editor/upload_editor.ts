import { task_editor } from "./task_editor.js";

const upload_btn = document.getElementById('upload-btn');
const submit_btn = document.getElementById('recipe-submit');
const upload_card = document.getElementById('upload-card');

function toggle_upload_card(): void {
    if (upload_card.style.display == 'none') {
        show_upload_card();
    }
    else {
        hide_upload_card();
    }
}
export function show_upload_card(): void {
    upload_card.style.display = '';
    task_editor.hide();
}
export function hide_upload_card(): void {
    upload_card.style.display = 'none';
}

upload_btn.addEventListener('click', (e: MouseEvent) => {
    toggle_upload_card();
});
submit_btn.addEventListener('click', (e: MouseEvent) => {
    toggle_upload_card();
});