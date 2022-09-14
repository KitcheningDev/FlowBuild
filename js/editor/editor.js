import { Recipe } from "../flowbuild/Recipe.js";
import { DrawRecipe } from "../flowbuild/DrawRecipe.js";
export const flowchart = document.getElementById("flowchart");
export let curr_recipe = new Recipe("", []);
let in_movement = false;
const input_field = document.getElementById("input-field");
let from;
let to;
function GetMousePos(e) {
    const rect = document.body.getBoundingClientRect();
    return { 'x': e.clientX - rect.left, 'y': e.clientY - rect.top };
}
function SetPos(html_element, pos) {
    html_element.style.left = pos['x'].toString() + "px";
    html_element.style.top = pos['y'].toString() + "px";
}
function InFlowchartBounds(pos) {
    const rect = flowchart.getBoundingClientRect();
    return pos['x'] > rect.left && pos['x'] < rect.right &&
        pos['y'] > rect.top && pos['y'] < rect.bottom;
}
document.addEventListener('mousedown', (e) => {
    if (e.button != 0)
        return;
    const html_element = e.target;
    if (html_element != input_field && InFlowchartBounds(GetMousePos(e)))
        input_field.style.display = "none";
    if (html_element.classList.contains("box")) {
        from = html_element;
        in_movement = true;
        flowchart.style.cursor = "pointer";
    }
});
const random_text = [
    "Ofen auf 180°C vorheizen", "Süßkartoffel schneiden", "Süßkartoffel 30min im Ofen weich kochen", "Dressing auf Bowl verteilen",
    "Zwiebel schneiden", "Knoblauch schneiden", "Alles anbraten bis glasig", "2 min köcheln",
    "Hackfleisch hinzufügen", "Anbraten bis vollst. durch", "Restl. Zutaten hinzufügen", "30 min köcheln",
    "Zwiebel schneiden", "Knoblauch schneiden", "Alles anbraten bis glasig", "2 min köcheln", "Hackfleisch hinzufügen",
    "Anbraten bis vollst. durch", "Restl. Zutaten hinzufügen", "30 min köcheln", "Abschmecken & servieren",
    "Zwiebel schneiden", "Tomaten schneiden", "Zwiebel reinlegen", "Tomaten daraufschichten",
    "Restl. Gemüse stapeln", "Oliven darauf verteilen", "15min auf mittlerer Hitze köcheln", "1,5h garen", "In Tajineboden servieren",
    "Trockene Zutaten vermischen", "Alles verrühren", "Beeren unterheben", "In Form geben",
    "20min backen", "Probe", "Kurz abkühlen", "Aus Form lösen & servieren",
    "Ofen auf 250°C vorheizen", "Pizzateig ausrollen", "Erdbeeren halbieren", "Pesto auf Teig verteilen", "Erdbeeren auf Pesto verteilen", "15 min backen", "Mozzarella verteilen", "Auf vorgewärmten Teller servieren",
    "Pistazien in Mixer geben", "Spinat, Zitronensaft & Öl hinzu", "Honig & Salz dazu", "Zu Pesto pürieren", "Pesto auf Teig verteilen",
    "Teller vorwärmen", "Auf vorgewärmten Teller servieren"
];
document.addEventListener('mouseup', (e) => {
    if (e.button != 0 || !in_movement)
        return;
    const html_element = e.target;
    if (InFlowchartBounds(GetMousePos(e))) {
        if (html_element.classList.contains("box")) {
            to = html_element;
            CommitChange();
        }
        else {
            input_field.style.display = "inline";
            flowchart.style.cursor = "default";
            input_field.value = random_text[Math.round(Math.random() * (random_text.length - 1))];
            while (curr_recipe.Includes(input_field.value))
                input_field.value = random_text[Math.round(Math.random() * (random_text.length - 1))];
            input_field.focus();
            input_field.select();
            SetPos(input_field, GetMousePos(e));
        }
    }
    in_movement = false;
});
input_field.addEventListener('keydown', (e) => {
    if (e.key == "Enter" && from && !in_movement && input_field.value.length > 0)
        CommitChange();
});
document.addEventListener('keydown', (e) => {
    if (e.key == "u") {
        curr_recipe.UndoConn();
        DrawRecipe(curr_recipe);
    }
});
function CommitChange() {
    if (from != to) {
        if (to == null)
            curr_recipe.AddConn(from.innerHTML.trim(), input_field.value);
        else
            curr_recipe.AddConn(from.innerHTML.trim(), to.innerHTML.trim());
        if (curr_recipe.CreateGraph().is_valid)
            DrawRecipe(curr_recipe);
        else
            curr_recipe.UndoConn();
    }
    input_field.style.display = "none";
    flowchart.style.cursor = "default";
    input_field.value = "";
    from = null;
    to = null;
}
//# sourceMappingURL=Editor.js.map