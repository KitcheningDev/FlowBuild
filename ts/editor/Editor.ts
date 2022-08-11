import { Recipe } from "../flowbuild/Recipe.js";
import { DrawGrid } from "./DrawGrid.js";
import { Flowbuild } from "../flowbuild/Flowbuild.js";
import { default_config } from "../flowbuild/Configs/Default.js";

export const flowchart = document.getElementById("flowchart");
export const curr_recipe = new Recipe("Unnamed");

let in_movement = false;
const input_field = document.getElementById("input-field") as HTMLInputElement;
let selected_box: HTMLElement;

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
        selected_box = html_element;
        in_movement = true;
        flowchart.style.cursor = "pointer";
    }
})

document.addEventListener('mouseup', (e: MouseEvent) => {
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
})

input_field.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key == "Enter" && selected_box && !in_movement && input_field.value.length > 0)
    {
        curr_recipe.AddConnection(selected_box.innerHTML.trim(), input_field.value);
        DrawGrid(new Flowbuild(curr_recipe, default_config).grid);
        input_field.style.display = "none";
        flowchart.style.cursor = "default";
        input_field.value = "";
        selected_box = null;
    }
});