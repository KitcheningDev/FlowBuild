import { TileType } from "../flowbuild/grid.js";
const flowchart = document.getElementById("flowchart");
export function draw_grid(grid) {
    flowchart.innerHTML = "";
    const rect = flowchart.getBoundingClientRect();
    const grid_size_x = rect.width / grid.size.x;
    const grid_size_y = rect.height / grid.size.y;
    for (let y = 0; y < grid.size.y; y++) {
        for (let x = 0; x < grid.size.x; x++) {
            const tile = grid.At(x, y);
            if (tile.type == TileType.Empty)
                continue;
            // create boxes
            if (tile.type == TileType.Task || tile.type == TileType.Cond ||
                tile.type == TileType.Start || tile.type == TileType.End) {
                const task = document.createElement("span");
                task.classList.add("box");
                if (tile.type == TileType.Task)
                    task.classList.add("task");
                else if (tile.type == TileType.Cond)
                    task.classList.add("cond");
                else if (tile.type == TileType.Start)
                    task.classList.add("start");
                else if (tile.type == TileType.End)
                    task.classList.add("end");
                task.innerHTML = tile.text;
                task.style.left = (grid_size_x * (x + 0.5)).toString() + "px";
                task.style.top = (grid_size_y * (y + 0.5)).toString() + "px";
                flowchart.appendChild(task);
            }
        }
    }
}
//# sourceMappingURL=draw_grid.js.map