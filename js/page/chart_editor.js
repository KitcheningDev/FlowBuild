import { connection_t } from "../flowbuild/connection.js";
import { task_t } from "../flowbuild/task.js";
import { has_path } from "../flowbuild/path.js";
import { last_elem } from "../utils/funcs.js";
import { display_recipe } from "./display_recipe.js";
import { cache_recipe_mod, recipe } from "./load_recipe.js";
import { get_selected_radio_btn, init_radio_btns, select_radio_btn } from "../utils/radio_btn.js";
import { in_upload_form } from "./upload_recipe.js";
export let in_task_form = false;
let selected_task_html = null;
const submit_btn_html = document.getElementById("submit-task-btn");
const cancel_btn_html = document.getElementById("cancel-task-btn");
const chart_html = document.getElementById("chart");
const chart_container_html = document.getElementById("chart-container");
// form
const task_form_html = document.getElementById("task-form");
const text_input_html = document.getElementById("text-input");
const duration_input_html = document.getElementById("task-duration-input");
const task_form_cook_html = document.getElementById("task-form-cook");
const cook_container_html = document.getElementById("cook-btn-container");
const unit_container_html = document.getElementById("task-duration-container");
init_radio_btns('min', ['sec', 'min', 'hrs'], unit_container_html);
export function start_task_form(el) {
    console.log("STARTED TASK");
    in_task_form = true;
    task_form_html.style.visibility = "visible";
    const task = recipe.get_task(parseInt(el.id));
    const cook_ids = [];
    for (let i = 1; i <= recipe.cook_count; ++i) {
        cook_ids.push(i.toString());
    }
    cook_ids.push('+');
    init_radio_btns(task.cook_id.toString(), cook_ids, cook_container_html);
    if (el.id != recipe.graph.end.head.id.toString()) {
        select_radio_btn(task.cook_id.toString(), cook_container_html);
        task_form_cook_html.style.display = "block";
    }
    else {
        task_form_cook_html.style.display = "none";
    }
    if (task.duration != 0 && task.duration / 3600 == Math.floor(task.duration / 3600)) {
        duration_input_html.value = (task.duration / 3600).toString();
        select_radio_btn('hrs', unit_container_html);
    }
    else if (task.duration != 0 && task.duration / 60 == Math.floor(task.duration / 60)) {
        duration_input_html.value = (task.duration / 60).toString();
        select_radio_btn('min', unit_container_html);
    }
    else {
        duration_input_html.value = task.duration.toString();
        select_radio_btn('sec', unit_container_html);
    }
    text_input_html.value = el.innerHTML.trim();
    selected_task_html = el;
}
export function stop_task_form(proceed) {
    console.log("STOPPED TASK");
    in_task_form = false;
    task_form_html.style.visibility = "hidden";
    if (proceed) {
        const task = recipe.get_task(parseInt(selected_task_html.id));
        task.str = text_input_html.value.trim();
        if (task.id != recipe.graph.end.head.id) {
            const selected_cook = get_selected_radio_btn(cook_container_html);
            if (selected_cook.innerHTML == '+') {
                task.cook_id = recipe.cook_count + 1;
            }
            else {
                task.cook_id = selected_cook.innerHTML.charCodeAt(0) - '0'.charCodeAt(0);
            }
        }
        switch (get_selected_radio_btn(unit_container_html).innerHTML) {
            case 'sec':
                task.duration = parseInt(duration_input_html.value) * 1;
            case 'min':
                task.duration = parseInt(duration_input_html.value) * 60;
                break;
            case 'hrs':
                task.duration = parseInt(duration_input_html.value) * 3600;
                break;
            default:
                break;
        }
        display_recipe(recipe);
        cache_recipe_mod();
        submit_btn_html.style.opacity = "0.7";
        setTimeout(() => { submit_btn_html.style.opacity = ""; task_form_html.style.visibility = "hidden"; }, 150);
    }
    selected_task_html = null;
}
chart_html.addEventListener('mousedown', (e) => {
    if (in_upload_form) {
        return;
    }
    const target = e.target;
    if (target.classList.contains("box")) {
        selected_task_html = target;
    }
    else if (selected_task_html !== null) {
        stop_task_form(false);
        cancel_btn_html.style.opacity = "0.7";
        setTimeout(() => { cancel_btn_html.style.opacity = ""; task_form_html.style.visibility = "hidden"; }, 150);
    }
});
chart_html.addEventListener('mouseup', (e) => {
    if (selected_task_html === null) {
        return;
    }
    const target = e.target;
    // start form
    if (selected_task_html === target) {
        const task = recipe.get_task(parseInt(selected_task_html.id));
        if (task != recipe.graph.start.head && task != last_elem(recipe.graph.end.tasks)) {
            start_task_form(target);
        }
        return;
    }
    // add task / connection
    const from = recipe.get_task(parseInt(selected_task_html.id));
    const task = new task_t(get_new_task_text(), from.cook_id == 0 ? 1 : from.cook_id);
    const last_step = recipe.graph.end.head;
    if (target.classList.contains("box")) {
        const to = recipe.get_task(parseInt(target.id));
        const from_path = recipe.graph.by_task(from);
        const to_path = recipe.graph.by_task(to);
        // remove connection to end
        if (recipe.has_conn(new connection_t(from, last_step)) && to_path != from_path && !has_path(to_path, from_path) && !to_path.is_bw) {
            recipe.rm_conn(new connection_t(from, last_step));
        }
        // add connections
        if (ctrl_down) {
            recipe.rm_conn(new connection_t(from, to));
            recipe.add_conn(new connection_t(from, task));
            recipe.add_conn(new connection_t(task, to));
        }
        else {
            recipe.add_conn(new connection_t(from, to));
        }
    }
    else {
        if (recipe.has_conn(new connection_t(from, last_step))) {
            recipe.rm_conn(new connection_t(from, last_step));
        }
        recipe.add_conn(new connection_t(from, task));
        recipe.add_conn(new connection_t(task, last_step));
    }
    display_recipe(recipe);
    cache_recipe_mod();
    // select new task
    for (const el of chart_container_html.children) {
        if (el.id == task.id.toString()) {
            selected_task_html = el;
            start_task_form(el);
            text_input_html.select();
            break;
        }
    }
});
document.addEventListener('keypress', (e) => {
    if (selected_task_html !== null) {
        if (false && ['1', '2', '3', '4', '5'].includes(e.key)) {
            select_radio_btn(e.key, cook_container_html);
        }
        else if (e.key == "Enter") {
            stop_task_form(true);
        }
    }
});
// task [number]
function get_new_task_text() {
    let name = "task 1";
    let number = 1;
    while (recipe.has_description(name)) {
        name = "task " + ++number;
    }
    return name;
}
// random text
function get_random_text() {
    return random_text[Math.floor(Math.random() * random_text.length)];
}
const random_text = ["Tomaten schneiden", "2/3 der Zwiebeln schneiden", "2/3 der Zwiebeln anbraten",
    "Mit Gewürzen 10min schmoren", "Chilibohnen unterrühren",
    "Chili auf Kartoffelspalten verteilen", "Mit Avocado &amp; Sour cream garnieren",
    "Ofen auf 180°C vorheizen", "Süßkartoffel in Spalten schneiden", "In Öl, Paprika &amp; Salz schwenken",
    "Avocado zerdrücken", "1/3 der Zwiebel schneiden", "Zitronensaft hinzufügen",
    "Mit Kreuzkümmel &amp; Salz würzen", "Mit Avocado &amp; Sour cream garnieren",
    "In Öl, Paprika &amp; Salz schwenken", "35min im Ofen backen", "Chili auf Kartoffelspalten verteilen",
    "Zwiebel schneiden", "Knoblauch pressen", "5 min in Butter anbraten", "Tomatenmark &amp; Chili hinzufügen",
    "Alles anbraten bis dunkel gebräunt", "Mit Vodka ablöschen", "Sahne &amp; Parmesan einrühren", "Mit Petersilie anrichten",
    "Wasser zum kochen bringen", "Nudeln kochen", "1/2 Tasse Pasta-Wasser einschöpfen", "Sahne &amp; Parmesan einrühren",
    "Nudeln kochen", "Nudeln kochen bis al dente", "Wasser abgießen", "Mit Petersilie anrichten",
    "Banane mit Gabel zerdrücken", "Mit restl. nassen Zutaten vermengen",
    "Teig glatt rühren", "Teig in Form geben", "50min backen",
    "Kurz abkühlen", "Schneiden &amp; servieren",
    "Backofen auf 180°C vorheizen", "Trockene Zutaten vermischen", "Teig glatt rühren",
    "Topping auswählen", "50min backen",
    "+5min backen", "Probe"];
// control
let ctrl_down = false;
document.addEventListener('keydown', (e) => {
    if (e.key == "Control") {
        ctrl_down = true;
    }
});
document.addEventListener('keyup', (e) => {
    if (e.key == "Control") {
        ctrl_down = false;
    }
});
submit_btn_html.onclick = () => stop_task_form(true);
cancel_btn_html.onclick = () => stop_task_form(false);
//# sourceMappingURL=chart_editor.js.map