import { Connection } from "../flowbuild/connection.js";
import { Task } from "../flowbuild/task.js";
import { can_reach } from "../flowbuild/path.js";
import { last_elem } from "../utils/funcs.js";
import { display_recipe } from "./display_recipe.js";
import { cache_recipe_mod, recipe } from "./load_recipe.js";
import { in_upload_form } from "./upload_recipe.js";
import { chart_form } from "./chart_form.js";
let selected_task = null;
const chart_html = document.getElementById("chart");
const chart_container_html = document.getElementById("chart-container");
chart_html.addEventListener('mousedown', (e) => {
    if (in_upload_form) {
        return;
    }
    if (chart_form.in_form) {
        chart_form.cancel_callback();
    }
    const target = e.target;
    if (target.classList.contains("box")) {
        selected_task = target;
    }
    else {
        selected_task = null;
    }
});
chart_html.addEventListener('mouseup', (e) => {
    if (selected_task === null) {
        return;
    }
    const target = e.target;
    // start form
    if (selected_task === target) {
        const task = recipe.get_task(parseInt(selected_task.id));
        if (task != recipe.graph.start.head && task != last_elem(recipe.graph.end.tasks)) {
            chart_form.start_form(target);
        }
        return;
    }
    // add task / connection
    const from = recipe.get_task(parseInt(selected_task.id));
    const new_task = new Task(get_new_task_text(), from.cook_id == 0 ? 1 : from.cook_id);
    const last_step = recipe.graph.end.head;
    if (target.classList.contains("box")) {
        const to = recipe.get_task(parseInt(target.id));
        const from_path = recipe.graph.by_task(from);
        const to_path = recipe.graph.by_task(to);
        // remove connection to end
        if (recipe.has_conn(new Connection(from, last_step)) && to_path != from_path && !can_reach(to_path, from_path) && !to_path.is_bw) {
            recipe.rm_conn(new Connection(from, last_step));
        }
        // add connections
        if (ctrl_down) {
            recipe.rm_conn(new Connection(from, to));
            recipe.add_conn(new Connection(from, new_task));
            recipe.add_conn(new Connection(new_task, to));
        }
        else {
            recipe.add_conn(new Connection(from, to));
        }
    }
    else {
        if (recipe.has_conn(new Connection(from, last_step))) {
            recipe.rm_conn(new Connection(from, last_step));
        }
        recipe.add_conn(new Connection(from, new_task));
        recipe.add_conn(new Connection(new_task, last_step));
    }
    // save changes
    cache_recipe_mod();
    display_recipe(recipe);
    // select new task
    for (const el of chart_container_html.children) {
        if (el.id == new_task.id.toString()) {
            chart_form.start_form(el);
            chart_form.text_input.select();
            break;
        }
    }
});
document.addEventListener('keypress', (e) => {
    if (chart_form.in_form && e.key == "Enter") {
        chart_form.submit_callback();
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
// #### dump #### 
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
//# sourceMappingURL=chart_editor.js.map