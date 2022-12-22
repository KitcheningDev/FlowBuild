import { recipe } from "./load_recipe.js";
import { upload_recipe } from "./server_communication.js";
import { get_selected_radio_btn, init_radio_btns, select_radio_btn } from "../utils/radio_btn.js";
import { in_task_form, stop_task_form } from "./chart_editor.js";

export let in_upload_form = false;
const upload_form_html = document.getElementById("upload-form");
const title_input_html = document.getElementById("title-input") as HTMLInputElement;
const duration_input_html = document.getElementById("recipe-duration-input") as HTMLInputElement;

const difficulty_container_html = document.getElementById("difficulty-container");
const unit_container_html = document.getElementById("recipe-unit-container");
init_radio_btns('med', ['lemon squeezy', 'easy', 'med', 'hard', 'expert', 'gordon ramsey'], difficulty_container_html);
init_radio_btns('min', ['min', 'hrs'], unit_container_html);

export function start_upload_form(): void {
    if (in_task_form) {
        stop_task_form(false);
    }
    in_upload_form = true;
    upload_form_html.style.visibility = "visible";
}
export function stop_upload_form(proceed: boolean): void {
    in_upload_form = false;
    upload_form_html.style.visibility = "hidden";
    if (proceed) {
        recipe.title = title_input_html.value.trim();
        recipe.difficulty = get_selected_radio_btn(difficulty_container_html).innerHTML;
        switch(get_selected_radio_btn(unit_container_html).innerHTML) {
            case 'min':
                recipe.duration = parseInt(duration_input_html.value) * 1;
                break;
            case 'hrs':
                recipe.duration = parseInt(duration_input_html.value) * 60;
                break;
            default:
                break;
        } 
        upload_recipe(recipe);
    }
}

// document.addEventListener('keypress', (e: KeyboardEvent) => {
//     if (in_upload_form) {
//         if (e.key == "Enter") {
//             stop_upload_form(true);
//         }
//         else if (e.key == "Escape") {
//             stop_upload_form(false);
//         }
//     }
// });
document.getElementById("submit-upload-btn").onclick = () => stop_upload_form(true);
document.getElementById("cancel-upload-btn").onclick = () => stop_upload_form(false);