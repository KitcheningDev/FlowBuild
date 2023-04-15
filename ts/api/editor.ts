import { RecipeModifier } from "../editor/recipe_modifier.js";
import { draw_recipe } from "../flowbuild/draw_recipe.js";
import { Task } from "../flowbuild/recipe/task.js";
import { recipe } from "./api.js";

function get_random_text(): string {
    // return task_map.size.toString();
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
"Nudeln kochen", "Nudeln kochen bis al dente", "Wasser abgießen", "Mit Petersilie anrichten"];


const chart = document.getElementById("chart");
let from_connector = null as HTMLElement;
let to_connector = null as HTMLElement;
let from_task = null as Task;
let to_task = null as Task;

function handle_edit(): void {
    if (from_task !== null) {
        if (to_task === null) {
            recipe.add_task(from_task, new Task(get_random_text(), from_task.cook));
        }
        else {
            if (recipe.has_conn(from_task, to_task)) {
                recipe.add_task_between(from_task, new Task(get_random_text(), from_task.cook), to_task);
            }
            else {
                recipe.add_connection(from_task, to_task);
            }
        }
        // const graph = recipe.create_graph();
        // graph.flatten();
        // if (recipe.has_conn(from_task, graph.last_step.task) && graph.get_node_by_task(from_task).childs.size > 1) {
        //     recipe.remove_connection(from_task, graph.last_step.task);
        // }
        // if (recipe.has_conn(graph.start.task, to_task) && graph.get_node_by_task(to_task).parents.size > 1) {
        //     recipe.remove_connection(graph.start.task, to_task);
        // }
        draw_recipe(recipe);
    }
    root.style.setProperty('--editor-opacity', '1');
}
function reset(): void {
    if (from_connector) {
        from_connector.style.opacity = '';
    }
    if (to_connector) {
        to_connector.style.opacity = '';
    }
    from_connector = null;
    to_connector = null;
    from_task = null;
    to_task = null;
}

// Get the root element
const root = document.querySelector(':root') as HTMLElement;

chart.addEventListener('mousedown', (e: Event) => {
    reset();
    console.log(e.target);
    if ((e.target as HTMLElement).classList.contains("editor-connector-from")) {
        from_connector = e.target as HTMLElement;
        from_connector.style.opacity = '1';
        root.style.setProperty('--editor-opacity', '0');
        from_task = recipe.get_task_by_id(parseInt(from_connector.parentElement.id));
        console.log("mousedown", from_task);
    }
    else if ((e.target as HTMLElement).classList.contains("flow-start")) {
        root.style.setProperty('--editor-opacity', '0');
        from_task = recipe.get_task_by_id(parseInt((e.target as HTMLElement).id));
        console.log("mousedown", from_task);
    }
});
document.addEventListener('mouseup', (e: Event) => {
    console.log(e.target);
    if ((e.target as HTMLElement).classList.contains("editor-connector-to")) {
        to_connector = e.target as HTMLElement;
        to_connector.style.opacity = '1';
        to_task = recipe.get_task_by_id(parseInt(to_connector.parentElement.id));
        console.log("mouseup", to_task);
    }
    handle_edit();
});

window["create_new_recipe"]();