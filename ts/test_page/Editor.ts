import { Recipe } from "../flowbuild/Recipe.js";
import { DrawRecipe } from "../flowbuild/DrawRecipe.js";
import { InterpretDragAndDrop, ShouldOpenInputField } from "../flowbuild/DragAndDrop.js";

export const flowchart = document.getElementById("flowchart");
export let curr_recipe = new Recipe("Unnamed", []);
const input_field = document.getElementById("input-field") as HTMLInputElement;

export function LoadRecipe(name: string) {
    const req = new XMLHttpRequest();
    req.onload = () => { 
        console.log("Loaded Recipe:", name);
        const json = JSON.parse(req.responseText);
        curr_recipe = new Recipe(json["name"], json["paths"]);
        document.getElementById("recipe-name").innerHTML = curr_recipe.name;
        DrawRecipe(curr_recipe);
    }
    req.open("GET", `${document.URL}/recipes/${name}.json`);
    req.send();
}

let in_drag_and_drop = false;
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

    // hide input field if pressed outside of field
    if (html_element != input_field && InFlowchartBounds(GetMousePos(e))) {
        input_field.style.display = "none";
        to = null;
    }
    
    // start drag and drop
    if (html_element.classList.contains("box")) {
        from = html_element;
        in_drag_and_drop = true;
        flowchart.style.cursor = "pointer";
    }
})

const random_text = [
    "Ofen auf 180°C vorheizen", "Süßkartoffel schneiden", "Süßkartoffel 30min im Ofen weich kochen", "Dressing auf Bowl verteilen",
    "Zwiebel schneiden", "Knoblauch schneiden", "Alles anbraten bis glasig", "2 min köcheln",
    "Hackfleisch hinzufügen", "Anbraten bis vollst. durch", "Restl. Zutaten hinzufügen", "30 min köcheln",
    "Zwiebel schneiden", "Knoblauch schneiden", "Alles anbraten bis glasig", "2 min köcheln", "Hackfleisch hinzufügen",
    "Anbraten bis vollst. durch", "Restl. Zutaten hinzufügen", "30 min köcheln", "Abschmecken &amp; servieren",
    "Zwiebel schneiden", "Tomaten schneiden", "Zwiebel reinlegen", "Tomaten daraufschichten",
    "Restl. Gemüse stapeln", "Oliven darauf verteilen", "15min auf mittlerer Hitze köcheln", "1,5h garen", "In Tajineboden servieren",
    "Trockene Zutaten vermischen", "Alles verrühren", "Beeren unterheben", "In Form geben",
    "20min backen", "Probe", "Kurz abkühlen", "Aus Form lösen &amp; servieren",
    "Ofen auf 250°C vorheizen", "Pizzateig ausrollen", "Erdbeeren halbieren", "Pesto auf Teig verteilen", "Erdbeeren auf Pesto verteilen", "15 min backen", "Mozzarella verteilen", "Auf vorgewärmten Teller servieren",
    "Pistazien in Mixer geben", "Spinat, Zitronensaft &amp; Öl hinzu", "Honig &amp; Salz dazu", "Zu Pesto pürieren", "Pesto auf Teig verteilen",
    "Teller vorwärmen", "Auf vorgewärmten Teller servieren"
];
document.addEventListener('mouseup', (e: MouseEvent) => {
    if (e.button != 0 || !in_drag_and_drop)
        return;

    // stop drag and drop
    const html_element = e.target as HTMLElement;
    if (InFlowchartBounds(GetMousePos(e))) {
        if (html_element.classList.contains("box"))
            to = html_element;
        
        const from_text = from.innerHTML.trim();
        const to_text = (to == null) ? "" : to.innerHTML.trim();
        console.log("DROP", from_text, to_text);

        // show input field
        if (ShouldOpenInputField(curr_recipe, from_text, to_text)) {
            input_field.style.display = "inline";
            flowchart.style.cursor = "default";

            // assign random text (!new text that isn't already in the recipe)
            input_field.value = random_text[Math.round(Math.random() * (random_text.length - 1))];
            while (curr_recipe.HasText(input_field.value))
                input_field.value = random_text[Math.round(Math.random() * (random_text.length - 1))];

            input_field.focus();
            input_field.select();
            SetPos(input_field, GetMousePos(e));
        }
        else
            CommitRecipeChange(from_text, to_text, "");
    }
    in_drag_and_drop = false;
})

input_field.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key == "Enter" && input_field.style.display == "inline" && input_field.value.length > 0)
        CommitRecipeChange(from.innerHTML.trim(), (to == null) ? "" : to.innerHTML.trim(), input_field.value.trim());
});
document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key == "u") {
        curr_recipe.UndoChange();
        DrawRecipe(curr_recipe);
    }
});

function CommitRecipeChange(from: string, to: string, input: string): void {
    console.log(from, to, input);
    InterpretDragAndDrop(curr_recipe, from, to, input);
    DrawRecipe(curr_recipe);
    input_field.style.display = "none";
    input_field.value = "";
    from = null;
    to = null;
}