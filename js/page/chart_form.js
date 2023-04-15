import { display_recipe } from "./display_recipe.js";
import { cache_recipe_mod, recipe } from "./load_recipe.js";
import { get_selected_radio_btn, init_radio_btns, select_radio_btn } from "../utils/radio_btn.js";
import { create_icon_callback } from "./icon.js";
export var chart_form;
(function (chart_form) {
    // states
    chart_form.in_form = false;
    let selected_task = null;
    // icons
    const submit_btn = document.getElementById("submit-task-btn");
    const cancel_btn = document.getElementById("cancel-task-btn");
    chart_form.submit_callback = create_icon_callback(submit_btn, () => { stop_form(true); });
    chart_form.cancel_callback = create_icon_callback(cancel_btn, () => { stop_form(false); });
    submit_btn.onclick = chart_form.submit_callback;
    cancel_btn.onclick = chart_form.cancel_callback;
    // form
    const task_form = document.getElementById("task-form");
    chart_form.text_input = document.getElementById("text-input");
    const duration_input = document.getElementById("task-duration-input");
    const task_form_cook = document.getElementById("task-form-cook");
    // radio btn container
    chart_form.cook_container = document.getElementById("cook-btn-container");
    const unit_container = document.getElementById("task-unit-container");
    init_radio_btns("+", ["+"], chart_form.cook_container);
    init_radio_btns('min', ['sec', 'min', 'hrs'], unit_container);
    function start_form(el) {
        chart_form.in_form = true;
        // start form
        selected_task = el;
        task_form.style.display = "";
        // fill form
        const task = recipe.get_task(parseInt(el.id));
        // str
        chart_form.text_input.value = el.innerHTML.trim();
        // cook
        if (parseInt(el.id) == recipe.graph.last_step.id) {
            task_form_cook.style.display = "none";
        }
        else {
            const cook_ids = [];
            for (let i = 1; i <= recipe.cook_count; ++i) {
                cook_ids.push(i.toString());
            }
            cook_ids.push('+');
            init_radio_btns(task.cook_id.toString(), cook_ids, chart_form.cook_container);
            select_radio_btn(task.cook_id.toString(), chart_form.cook_container);
            task_form_cook.style.display = "";
        }
        // duration
        if (task.duration == 0) {
            duration_input.value = "1";
            select_radio_btn('min', unit_container);
        }
        else {
            for (let [unit, sec] of [["hrs", 3600], ["min", 60], ["sec", 1]]) {
                if (typeof unit == "string" && typeof sec == "number") {
                    const fraction = task.duration / sec;
                    if (fraction == Math.floor(fraction)) {
                        duration_input.value = fraction.toString();
                        select_radio_btn(unit, unit_container);
                        break;
                    }
                }
            }
        }
    }
    chart_form.start_form = start_form;
    function stop_form(proceed) {
        chart_form.in_form = false;
        // commit form
        if (proceed) {
            const task = recipe.get_task(parseInt(selected_task.id));
            // str
            task.str = chart_form.text_input.value.trim();
            // cook
            if (task.id != recipe.graph.last_step.id) {
                const selected_cook = get_selected_radio_btn(chart_form.cook_container);
                if (selected_cook.innerHTML == '+') {
                    task.cook_id = recipe.cook_count + 1;
                }
                else {
                    task.cook_id = selected_cook.innerHTML.charCodeAt(0) - '0'.charCodeAt(0);
                }
            }
            // duration
            switch (get_selected_radio_btn(unit_container).innerHTML) {
                case 'sec':
                    task.duration = parseFloat(duration_input.value) * 1;
                    break;
                case 'min':
                    task.duration = parseFloat(duration_input.value) * 60;
                    break;
                case 'hrs':
                    task.duration = parseFloat(duration_input.value) * 3600;
                    break;
                default:
                    break;
            }
            // save change
            display_recipe(recipe);
            cache_recipe_mod();
        }
        // stop form
        task_form.style.display = "none";
        selected_task = null;
    }
    chart_form.stop_form = stop_form;
})(chart_form || (chart_form = {}));
//# sourceMappingURL=chart_form.js.map