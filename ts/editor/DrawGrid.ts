import { Grid } from "../flowbuild/grid.js";
import { Vec2 } from "../flowbuild/grid.js";

const flowchart = document.getElementById("flowchart");

const arrow_width = "1px";
const syncline_width = "1px";
export function DrawGrid(grid: Grid): void {
    flowchart.innerHTML = "";

    const rect = flowchart.getBoundingClientRect();
    const grid_size_x = rect.width / grid.size.x;
    const grid_size_y = rect.height / grid.size.y;

    for (let y = 0; y < grid.size.y; y++) {
        for (let x = 0; x < grid.size.x; x++) {
            const tile = grid.Get(new Vec2(x, y));
            
            // create boxes
            if (tile.text) {
                // console.log(tile.text, x, y);
                const task = document.createElement("span");
                task.classList.add("box");
            
                task.innerHTML = tile.text;

                task.style.left = (grid_size_x * (x + 0.5 + tile.shift)).toString() + "px";
                task.style.top = (grid_size_y * (y + 0.5)).toString() + "px";
                
                flowchart.appendChild(task);
            }

            // create arrows
            if (tile.arrow.up) {
                const arrow = document.createElement("span");
                arrow.classList.add("arrow");

                arrow.style.width = arrow_width;
                arrow.style.height = (grid_size_y / 2).toString() + "px";

                arrow.style.left = (grid_size_x * (x + 0.5 + tile.shift)).toString() + "px";
                arrow.style.top = (grid_size_y * (y + 0.25)).toString() + "px";
                flowchart.appendChild(arrow);
            }
            if (tile.arrow.right) {
                const arrow = document.createElement("span");
                arrow.classList.add("arrow");

                arrow.style.width = (grid_size_x / 2).toString() + "px";
                arrow.style.height = arrow_width;
                
                arrow.style.left = (grid_size_x * (x + 0.75 + tile.shift)).toString() + "px";
                arrow.style.top = (grid_size_y * (y + 0.5)).toString() + "px";
                flowchart.appendChild(arrow);
            }
            if (tile.arrow.down) {
                const arrow = document.createElement("span");
                arrow.classList.add("arrow");

                arrow.style.width = arrow_width;
                arrow.style.height = (grid_size_y / 2).toString() + "px";

                arrow.style.left = (grid_size_x * (x + 0.5 + tile.shift)).toString() + "px";
                arrow.style.top = (grid_size_y * (y + 0.75)).toString() + "px";
                flowchart.appendChild(arrow);
            }
            if (tile.arrow.left) {
                const arrow = document.createElement("span");
                arrow.classList.add("arrow");

                arrow.style.width = (grid_size_x / 2).toString() + "px";
                arrow.style.height = arrow_width;

                arrow.style.left = (grid_size_x * (x + 0.25 + tile.shift)).toString() + "px";
                arrow.style.top = (grid_size_y * (y + 0.5)).toString() + "px";
                flowchart.appendChild(arrow);
            }
            // create connection_boxes
            if (tile.text == "") {
                let arrow_count = 0;
                if (tile.arrow.up)
                    arrow_count++;
                if (tile.arrow.right)
                    arrow_count++;
                if (tile.arrow.down)
                    arrow_count++;
                if (tile.arrow.left)
                    arrow_count++; 

                if (arrow_count > 2) {
                    const connection_box = document.createElement("span");
                    connection_box.classList.add("connection_box");

                    connection_box.style.left = (grid_size_x * (x + 0.5 + tile.shift)).toString() + "px";
                    connection_box.style.top = (grid_size_y * (y + 0.5)).toString() + "px";
                    flowchart.appendChild(connection_box);
                }   
            }
          
            // create sync_line
            if (tile.sync_line.up) { 
                const sync_line = document.createElement("span");
                sync_line.classList.add("sync_line");

                if (!grid.InBounds(new Vec2(x + 1, y)) || grid.Get(new Vec2(x + 1, y)).sync_line.IsEmpty()) {
                    sync_line.style.width = (grid_size_x * 0.75).toString() + "px";
                    sync_line.style.left = (grid_size_x * (x + 0.25 + tile.shift)).toString() + "px";
                }
                else if (!grid.InBounds(new Vec2(x - 1, y)) || grid.Get(new Vec2(x - 1, y)).sync_line.IsEmpty()) {
                    sync_line.style.width = (grid_size_x * 0.75).toString() + "px";
                    sync_line.style.left = (grid_size_x * (x + 0.75 + tile.shift)).toString() + "px";
                }
                else {
                    sync_line.style.width = grid_size_x.toString() + "px";
                    sync_line.style.left = (grid_size_x * (x + 0.5 + tile.shift)).toString() + "px";
                }
                sync_line.style.height = syncline_width;

                sync_line.style.top = (grid_size_y * (y - 0.2)).toString() + "px";
                flowchart.appendChild(sync_line);
            }
            if (tile.sync_line.down) {
                const sync_line = document.createElement("span");
                sync_line.classList.add("sync_line");

                if (!grid.InBounds(new Vec2(x + 1, y)) || grid.Get(new Vec2(x + 1, y)).sync_line.IsEmpty()) {
                    sync_line.style.width = (grid_size_x * 0.75).toString() + "px";
                    sync_line.style.left = (grid_size_x * (x + 0.25 + tile.shift)).toString() + "px";
                }
                else if (!grid.InBounds(new Vec2(x - 1, y)) || grid.Get(new Vec2(x - 1, y)).sync_line.IsEmpty()) {
                    sync_line.style.width = (grid_size_x * 0.75).toString() + "px";
                    sync_line.style.left = (grid_size_x * (x + 0.75 + tile.shift)).toString() + "px";
                }
                else {
                    sync_line.style.width = grid_size_x.toString() + "px";
                    sync_line.style.left = (grid_size_x * (x + 0.5 + tile.shift)).toString() + "px";
                }
                sync_line.style.color = "red";
                sync_line.style.height = syncline_width;

                sync_line.style.top = (grid_size_y * (y + 1.2)).toString() + "px";
                flowchart.appendChild(sync_line);
            }
        }
    }
}
