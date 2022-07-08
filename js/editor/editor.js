import { Recipe } from "../flowbuild/Recipe.js";
export const flowchart = document.getElementById("flowchart");
export const curr_recipe = new Recipe("Unnamed");
let in_movement = false;
const input_field = document.getElementById("input-field");
let selected_box;
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
        selected_box = html_element;
        in_movement = true;
        flowchart.style.cursor = "pointer";
    }
});
document.addEventListener('mouseup', (e) => {
    if (e.button != 0 || !in_movement)
        return;
    if (InFlowchartBounds(GetMousePos(e))) {
        input_field.style.display = "inline";
        flowchart.style.cursor = "default";
        input_field.focus();
        input_field.select();
        SetPos(input_field, GetMousePos(e));
    }
    in_movement = false;
});
input_field.addEventListener('keydown', (e) => {
    if (e.key == "Enter" && selected_box && !in_movement && input_field.value.length > 0) {
        curr_recipe.AddConnection(selected_box.innerHTML.trim(), input_field.value);
        //DrawGrid(Flo)
        console.log(selected_box.innerHTML.trim(), input_field.value);
        input_field.style.display = "none";
        flowchart.style.cursor = "default";
        input_field.value = "";
        selected_box = null;
    }
});
//# sourceMappingURL=Editor.js.map