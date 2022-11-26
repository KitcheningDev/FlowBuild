import { connection_t } from "../flowbuild/connection.js";
import { recipe_t } from "../flowbuild/recipe.js";
import { task_t } from "../flowbuild/task.js";
import { last_elem } from "../utils/funcs.js";
import { display_recipe } from "./display_recipe.js";
import { load_recipe, log_recipe_mod, recipe } from "./load_recipe.js";

let selected_html: HTMLElement = null;

const chart_html = document.getElementById("chart");
const chart_container_html = document.getElementById("chart-container");
const form_html = document.getElementById("form");
const text_input_html = document.getElementById("text-input") as HTMLInputElement;
const time_input_html = document.getElementById("time-input") as HTMLInputElement;

const cook_btns_html = document.getElementsByClassName("cook-btn");
let selected_cook_btn = cook_btns_html[0] as HTMLElement;
function select_cook(cook_btn: HTMLElement): void {
    if (selected_cook_btn !== null) {
        selected_cook_btn.style.fontWeight = "100";
    }
    if (cook_btn === null) {
        selected_cook_btn = null;
        return;
    }
    cook_btn.style.fontWeight = "bolder";
    selected_cook_btn = cook_btn;
}
for (const cook_btn of cook_btns_html) {
    cook_btn.addEventListener('mousedown', (e: MouseEvent) => select_cook(e.target as HTMLElement));
}

const time_btns_html = document.getElementsByClassName("time-btn");
let selected_time_btn = time_btns_html[0] as HTMLElement;
function select_time(time_btn: HTMLElement): void {
    selected_time_btn.style.fontWeight = "";
    time_btn.style.fontWeight = "bolder";
    selected_time_btn = time_btn;
}
for (const time_btn of time_btns_html) {
    time_btn.addEventListener('mousedown', (e: MouseEvent) => select_time(e.target as HTMLElement));
}

function stop_form() {
    form_html.style.visibility = "hidden";
    selected_html = null;
}
function start_form(el: HTMLElement) {
    const task = recipe.get_task(parseInt(el.id));
    form_html.style.visibility = "visible";
    select_cook(cook_btns_html.item(task.cook_id) as HTMLElement);
    if (task.duration != 0 && task.duration / 3600 == Math.floor(task.duration / 3600)) {
        time_input_html.value = (task.duration / 3600).toString();
        select_time(time_btns_html.item(2) as HTMLElement);
    }
    else if (task.duration != 0 && task.duration / 60 == Math.floor(task.duration / 60)) {
        time_input_html.value = (task.duration / 60).toString();
        select_time(time_btns_html.item(1) as HTMLElement);
    }
    else {
        time_input_html.value = task.duration.toString();
        select_time(time_btns_html.item(0) as HTMLElement);
    }
    // text_input_html.select();
    // text_input_html.focus();
    text_input_html.value = el.innerHTML.trim();
}

chart_html.addEventListener('mousedown', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("box")) {
        selected_html = target;
    }
    else {
        stop_form();
    }
});
chart_html.addEventListener('mouseup', (e: MouseEvent) => {
    if (selected_html === null) {
        return;
    }
    const target = e.target as HTMLElement;
    if (selected_html === target) {
        const task = recipe.get_task(parseInt(selected_html.id));
        if (task != recipe.graph.start.head && task != last_elem(recipe.graph.end.tasks)) {
            start_form(target);
        }
        return;
    }
    const from = recipe.get_task(parseInt(selected_html.id));
    const task = new task_t(get_random_text(), from.cook_id == -1 ? 0 : from.cook_id);
    if (target.classList.contains("box")) {
        const last_step = recipe.graph.end.head;
        const to = recipe.get_task(parseInt(target.id));
        if (recipe.has_conn(new connection_t(from, last_step))) {
            recipe.rm_conn(new connection_t(from, last_step));
        }
        recipe.add_conn(new connection_t(from, to));
    }
    else {
        const last_step = recipe.graph.end.head;
        if (recipe.has_conn(new connection_t(from, last_step))) {
            recipe.rm_conn(new connection_t(from, last_step));
        }
        recipe.add_conn(new connection_t(from, task));
        recipe.add_conn(new connection_t(task, last_step));    
    }
    display_recipe(recipe);
    log_recipe_mod();
    for (const el of chart_container_html.children) {
        if (el.id == task.id.toString()) {
            selected_html = el as HTMLElement;
            start_form(el as HTMLElement);
            text_input_html.select();
            break;
        }
    }
});
document.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key == "Enter" && selected_html !== null) {
        const task = recipe.get_task(parseInt(selected_html.id));
        const new_task = new task_t(text_input_html.value.trim(), 
         (selected_cook_btn === null) ? -1 : selected_cook_btn.innerHTML.charCodeAt(selected_cook_btn.innerHTML.length - 1) - '1'.charCodeAt(0),
         parseInt(time_input_html.value) * (selected_time_btn.innerHTML == "min" ? 60 : (selected_time_btn.innerHTML == "hrs" ? 3600 : 1)));

        if (task != new_task) {
            let changed = true;
            while (changed) {
                changed = false;
                for (const [id, conn] of recipe.conns) {
                    if (conn.from == task || conn.to == task) {
                        recipe.conns.delete(id);
                        if (conn.from == task) {
                            recipe.add_conn(new connection_t(new_task, conn.to));
                        }
                        else {
                            recipe.add_conn(new connection_t(conn.from, new_task));
                        }
                        changed = true;
                        break;
                    }
                }
            }
        }
        display_recipe(recipe);
        log_recipe_mod();
        stop_form();
    }
    console.log(e.key);
    if (e.key == "r" && selected_html !== null) {
        console.log("DEL");
        const start = recipe.graph.start.head;
        const end = recipe.graph.end.head;
        const task = recipe.get_task(parseInt(selected_html.id));
        const from_tasks = new Set<task_t>();
        const to_tasks = new Set<task_t>();

        for (const conn of recipe.conns.values()) {
            if (conn.from.id == task.id) {
                to_tasks.add(conn.to);
            }
            else if (conn.to.id == task.id) {
                from_tasks.add(conn.from);
            }
            else {
                continue;
            }
            recipe.rm_conn(conn);
        }
        for (const from of from_tasks) {
            for (const to of to_tasks) {
                recipe.add_conn(new connection_t(from, to));
            }
        }
        console.log(recipe.conns);
        display_recipe(recipe);
        log_recipe_mod();
        stop_form();
    }
});

function get_random_text(): string {
    return random_text[Math.floor(Math.random() * random_text.length)];
}
const random_text = ["Tomaten schneiden", "2/3 der Zwiebeln schneiden", "2/3 der Zwiebeln anbraten",
"Mit Gewürzen 10min schmoren", "Chilibohnen unterrühren", "Chili auf Kartoffelspalten verteilen", "Mit Avocado &amp; Sour cream garnieren",
"START", "Ofen auf 180°C vorheizen", "Süßkartoffel in Spalten schneiden", "In Öl, Paprika &amp; Salz schwenken",
"Avocado zerdrücken", "1/3 der Zwiebel schneiden", "Zitronensaft hinzufügen", "Mit Kreuzkümmel &amp; Salz würzen", "Mit Avocado &amp; Sour cream garnieren",
"In Öl, Paprika &amp; Salz schwenken", "35min im Ofen backen", "Chili auf Kartoffelspalten verteilen",
"Zwiebel schneiden", "Knoblauch pressen", "5 min in Butter anbraten", "Tomatenmark &amp; Chili hinzufügen", "Alles anbraten bis dunkel gebräunt", "Mit Vodka ablöschen", "Sahne &amp; Parmesan einrühren", "Mit Petersilie anrichten",
"Wasser zum kochen bringen", "Nudeln kochen", "1/2 Tasse Pasta-Wasser einschöpfen", "Sahne &amp; Parmesan einrühren",
"Nudeln kochen", "Nudeln kochen bis al dente", "Wasser abgießen", "Mit Petersilie anrichten"];

// let from: string = null;
// let to: string = null;
// let in_form = false;

// function stop_form() {
//     in_form = false;
//     from = null;
//     to = null;
//     form_html.style.visibility = "hidden";
// }
// function start_form() {
//     in_form = true;
//     form_html.style.visibility = "visible";
//     //from_html.innerHTML = from;
//     text_input_html.select();
//     text_input_html.focus();
// }

// chart_html.addEventListener('mousedown', (e: MouseEvent) => {
//     const target = e.target as HTMLElement;
//     if (target.classList.contains("box")) {
//         from = target.innerHTML.trim();
//     }
// });
// chart_html.addEventListener('mouseup', (e: MouseEvent) => {
//     if (from === null) {
//         return;
//     }
//     const target = e.target as HTMLElement;
//     if (target.classList.contains("box")) {
//         to = target.innerHTML.trim();
//         stop_form();
//     }
//     else {
//         start_form();
//     }
// });
// document.addEventListener('keydown', (e: KeyboardEvent) => {
//     if (!in_form) {
//         return;
//     }
//     if (e.key == "Enter") {
//         stop_form();
//     }
// });