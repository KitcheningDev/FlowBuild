import { Vec2 } from "../flowbuild/grid.js";
const flowchart = document.getElementById("flowchart");
export function DrawGrid(grid) {
    flowchart.innerHTML = "";
    const rect = flowchart.getBoundingClientRect();
    const grid_size_x = rect.width / grid.size.x;
    const grid_size_y = rect.height / grid.size.y;
    for (let y = 0; y < grid.size.y; y++) {
        for (let x = 0; x < grid.size.x; x++) {
            const tile = grid.Get(new Vec2(x, y));
            // create boxes
            if (tile.text) {
                console.log(tile.text, x, y);
                const task = document.createElement("span");
                task.classList.add("box");
                task.innerHTML = tile.text;
                task.style.left = (grid_size_x * (x + 0.5)).toString() + "px";
                task.style.top = (grid_size_y * (y + 0.5)).toString() + "px";
                flowchart.appendChild(task);
            }
            // create arrows
            if (tile.arrow.up) {
                const arrow = document.createElement("span");
                arrow.classList.add("arrow");
                arrow.style.width = "2px";
                arrow.style.height = (grid_size_y / 2).toString() + "px";
                arrow.style.left = (grid_size_x * (x + 0.5)).toString() + "px";
                arrow.style.top = (grid_size_y * (y + 0.25)).toString() + "px";
                flowchart.appendChild(arrow);
            }
            if (tile.arrow.right) {
                const arrow = document.createElement("span");
                arrow.classList.add("arrow");
                arrow.style.width = (grid_size_x / 2).toString() + "px";
                arrow.style.height = "2px";
                arrow.style.left = (grid_size_x * (x + 0.75)).toString() + "px";
                arrow.style.top = (grid_size_y * (y + 0.5)).toString() + "px";
                flowchart.appendChild(arrow);
            }
            if (tile.arrow.down) {
                const arrow = document.createElement("span");
                arrow.classList.add("arrow");
                arrow.style.width = "2px";
                arrow.style.height = (grid_size_y / 2).toString() + "px";
                arrow.style.left = (grid_size_x * (x + 0.5)).toString() + "px";
                arrow.style.top = (grid_size_y * (y + 0.75)).toString() + "px";
                flowchart.appendChild(arrow);
            }
            if (tile.arrow.left) {
                const arrow = document.createElement("span");
                arrow.classList.add("arrow");
                arrow.style.width = (grid_size_x / 2).toString() + "px";
                arrow.style.height = "2px";
                arrow.style.left = (grid_size_x * (x + 0.25)).toString() + "px";
                arrow.style.top = (grid_size_y * (y + 0.5)).toString() + "px";
                flowchart.appendChild(arrow);
            }
            // create sync_line
            if (tile.sync_line.up) {
                const sync_line = document.createElement("span");
                sync_line.classList.add("sync_line");
                sync_line.style.width = (grid_size_x / 2).toString() + "px";
                sync_line.style.height = "2px";
                sync_line.style.left = (grid_size_x * (x + 0.5)).toString() + "px";
                sync_line.style.top = (grid_size_y * (y + 0.25)).toString() + "px";
                flowchart.appendChild(sync_line);
            }
            if (tile.sync_line.down) {
                const sync_line = document.createElement("span");
                sync_line.classList.add("sync_line");
                sync_line.style.width = (grid_size_x / 2).toString() + "px";
                sync_line.style.height = "2px";
                sync_line.style.left = (grid_size_x * (x + 0.5)).toString() + "px";
                sync_line.style.top = (grid_size_y * (y + 0.75)).toString() + "px";
                flowchart.appendChild(sync_line);
            }
        }
    }
}
//# sourceMappingURL=DrawGrid.js.map