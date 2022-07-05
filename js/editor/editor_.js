export const flowchart = document.getElementById("flowchart");
flowchart.addEventListener('click', flowchart_click);
let selected_box;
let arrow_pos;
export function box_click(e) {
    selected_box = this.innerHTML.trim();
    const rect = e.target.getBoundingClientRect();
    //let pos = [ this. as number, this.style.top as number ];
    //console.log(pos);
    console.log(rect);
    arrow_pos = [rect.left + rect.width / 2, rect.top + rect.height / 2];
    ShowArrow(arrow_pos);
}
export function flowchart_click(e) {
    console.log("flowchart_click", e.target);
}
function ShowInputField(pos) {
    input_field.style.display = "block";
    input_field.style.left = pos[0] + "px";
    input_field.style.top = pos[1] + "px";
    input_field.focus();
    input_field.select();
}
function ShowArrow(pos) {
    arrow.style.display = "block";
    arrow.style.left = pos[0] + "px";
    arrow.style.top = pos[1] + "px";
}
function Hide() {
    input_field.style.display = "none";
    input_field.value = "";
    arrow.style.display = "none";
}
function GetMousePos(e) {
    var rect = document.body.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
}
const input_field = document.getElementById("input-field");
const arrow = document.getElementById("arrow");
input_field.hidden = true;
document.addEventListener('mousemove', (e) => {
    if (!selected_box || !input_field.hidden)
        return;
    const t = e.target;
    console.log(t);
    if (t != flowchart && t.parentElement != flowchart) {
        selected_box = "";
        Hide();
        return;
    }
    console.log(e.target);
    const pos = GetMousePos(e);
    const diff = [pos[0] - arrow_pos[0], pos[1] - arrow_pos[1]];
    let rot = Math.atan(diff[1] / diff[0]) * 180 / Math.PI;
    if (diff[0] < 0)
        rot += 180;
    arrow.style.transform = "translate(-50%, -50%) rotate(" + rot + "deg) scale(3)";
    //arrow.style.left = pos[0] + "px";
    //arrow.style.top = pos[1] + "px";
});
document.addEventListener('mouseup', (e) => {
    if (!selected_box)
        return;
    console.log(selected_box);
    selected_box = "";
    ShowInputField(GetMousePos(e));
});
document.addEventListener('mousedown', (e) => {
    if (e.target == flowchart) {
        selected_box = "";
        Hide();
    }
    //if (!selected_box && e.target != document.getElementById("input-field")) {
    //    selected_box = "";
    //    Hide();
    //}
});
document.addEventListener('keydown', (e) => {
    if (selected_box && e.key == "Enter") {
        console.log(input_field.value);
        selected_box = "";
        Hide();
    }
});
//# sourceMappingURL=editor_.js.map