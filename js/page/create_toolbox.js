import { load_recipe, recipe, undo_last_mod } from "./load_recipe.js";
import { display_recipe } from "./display_recipe.js";
import { start_upload_form } from "./upload_recipe.js";
function clear_btn_callback() {
    display_recipe(load_recipe("Empty"));
}
function undo_btn_callback() {
    undo_last_mod();
    display_recipe(recipe);
}
function upload_btn_callback() {
    start_upload_form();
}
document.getElementById("clear-btn").onclick = clear_btn_callback;
document.getElementById("undo-btn").onclick = undo_btn_callback;
document.getElementById("upload-btn").onclick = upload_btn_callback;
document.body.addEventListener('keypress', (e) => {
    let icon;
    if (e.key == 'u') {
        icon = document.getElementById("undo-btn");
        undo_btn_callback();
    }
    else {
        return;
    }
    icon.style.opacity = "0.7";
    setTimeout(() => { icon.style.opacity = ""; }, 200);
});
//# sourceMappingURL=create_toolbox.js.map