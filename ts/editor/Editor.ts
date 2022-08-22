import { Recipe } from "../flowbuild/Recipe.js";
import { DrawGrid } from "./DrawGrid.js";
import { Flowbuild } from "../flowbuild/Flowbuild.js";

export const flowchart = document.getElementById("flowchart");
export let curr_recipe = new Recipe("", []);

let in_movement = false;
const input_field = document.getElementById("input-field") as HTMLInputElement;
let from: HTMLElement;
let to: HTMLElement;

function GetMousePos(e: MouseEvent): Object {
    const rect = document.body.getBoundingClientRect();
    return { 'x': e.clientX - rect.left, 'y': e.clientY - rect.top };
}

function SetPos(html_element: HTMLElement, pos: Object): void {
    html_element.style.left = pos['x'].toString() + "px";
    html_element.style.top = pos['y'].toString() + "px";
}

function InFlowchartBounds(pos: Object): boolean {
    const rect = flowchart.getBoundingClientRect();
    return pos['x'] > rect.left && pos['x'] < rect.right &&
        pos['y'] > rect.top && pos['y'] < rect.bottom;
}

document.addEventListener('mousedown', (e: MouseEvent) => {
    if (e.button != 0)
        return;
    const html_element = e.target as HTMLElement;
    if (html_element != input_field && InFlowchartBounds(GetMousePos(e)))
        input_field.style.display = "none";
    if (html_element.classList.contains("box")) {
        from = html_element;
        in_movement = true;
        flowchart.style.cursor = "pointer";
    }
})

const random_text = [
    "Ofen auf 180°C vorheizen", "Süßkartoffel schneiden", "Süßkartoffel 30min im Ofen weich kochen", "Dressing auf Bowl verteilen",
    "Zwiebel schneiden", "Knoblauch schneiden", "Alles anbraten bis glasig", "2 min köcheln",
    "Hackfleisch hinzufügen", "Anbraten bis vollst. durch", "Restl. Zutaten hinzufügen", "30 min köcheln",
    "Zwiebel schneiden", "Knoblauch schneiden", "Alles anbraten bis glasig", "2 min köcheln", "Hackfleisch hinzufügen",
    "Anbraten bis vollst. durch", "Restl. Zutaten hinzufügen", "30 min köcheln", "Abschmecken & servieren",
    "Zwiebel schneiden", "Tomaten schneiden", "Zwiebel reinlegen", "Tomaten daraufschichten",
    "Restl. Gemüse stapeln", "Oliven darauf verteilen", "15min auf mittlerer Hitze köcheln", "1,5h garen", "In Tajineboden servieren",
    "Trockene Zutaten vermischen", "Alles verrühren", "Beeren unterheben", "In Form geben",
    "20min backen", "Probe", "Kurz abkühlen", "Aus Form lösen & servieren"
]
document.addEventListener('mouseup', (e: MouseEvent) => {
    if (e.button != 0 || !in_movement)
        return;

    const html_element = e.target as HTMLElement;
    if (InFlowchartBounds(GetMousePos(e))) {
        if (html_element.classList.contains("box")) {
            to = html_element;
            CommitChange();
        }
        else {
            input_field.style.display = "inline";
            flowchart.style.cursor = "default";
            input_field.value = random_text[Math.round(Math.random() * (random_text.length - 1))];
            input_field.focus();
            input_field.select();
            SetPos(input_field, GetMousePos(e));
        }
    }
    in_movement = false;
})

input_field.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key == "Enter" && from && !in_movement && input_field.value.length > 0)
        CommitChange();
});

function CommitChange(): void {
    if (to == null)
        curr_recipe.AddConnection(from.innerHTML.trim(), input_field.value);    
    else 
        curr_recipe.AddConnection(from.innerHTML.trim(), to.innerHTML.trim());    
    DrawGrid(new Flowbuild(curr_recipe).grid);
    
    input_field.style.display = "none";
    flowchart.style.cursor = "default";
    input_field.value = "";
    from = null;
    to = null;
}