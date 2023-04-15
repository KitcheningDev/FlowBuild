import { get_cook } from "./flowbuild/recipe/cook.js";
import { Recipe } from "./flowbuild/recipe/recipe.js";
import { Task } from "./flowbuild/recipe/task.js";
function get_random_text() {
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
export const recipe = new Recipe();
const task_map = new Map();
export function add_connection(...tasks) {
    for (let i = 0; i < tasks.length - 1; ++i) {
        if (!task_map.has(tasks[i])) {
            task_map.set(tasks[i], new Task(get_random_text(), get_cook('')));
        }
        if (!task_map.has(tasks[i + 1])) {
            task_map.set(tasks[i + 1], new Task(get_random_text(), get_cook('')));
        }
        recipe.add_connection(task_map.get(tasks[i]), task_map.get(tasks[i + 1]));
    }
}
export function set_cook(cook, ...tasks) {
    for (const task of tasks) {
        task_map.get(task).cook.name = cook;
    }
}
//# sourceMappingURL=test_recipe.js.map