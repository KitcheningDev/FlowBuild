import { vec2_t, vec2 } from "../utils/vec2.js";
import { rect_t } from "../utils/rect.js";
import { first_elem, last_elem } from "../utils/funcs.js";
import { global_config } from "./config.js";
import { task_t } from "./task.js";

export class path_bounds_t {
    in: vec2_t;
    out: vec2_t;
    size: vec2_t;
    task_rects: rect_t[];

    constructor(tasks: task_t[]) {
        this.task_rects = [];

        for (const task of tasks) {
            const size = global_config.get_box_size(task);
            this.task_rects.push(new rect_t(undefined, size)); 
        }

        let dirs :string[];
        if (last_elem(tasks).str == "END") {
            dirs = [ "right"];
        }
        else if (tasks.length >= global_config.path_fold_threshold)
            dirs = [ "right", "down", "left", "down" ];
        else
            dirs = [ "down" ];

        const same_x_map = new Map<number, rect_t[]>();
        const same_y_map = new Map<number, rect_t[]>();
        let dir_index = 0;
        let curr_x = 0;
        let curr_y = 0;
        for (const rect of this.task_rects) {
            if (!same_x_map.has(curr_x))
                same_x_map.set(curr_x, []);
            if (!same_y_map.has(curr_y))
                same_y_map.set(curr_y, []);
            
            same_x_map.get(curr_x).push(rect);
            same_y_map.get(curr_y).push(rect);

            if (dirs[dir_index] == "right")
                curr_x++;
            else if (dirs[dir_index] == "left")
                curr_x--;
            else if (dirs[dir_index] == "down")
                curr_y++;
            dir_index = (dir_index + 1) % dirs.length;
        }

        // calc max size x and y's for origins
        const max_size_x_map = new Map<number, number>();
        const max_size_y_map = new Map<number, number>();
        for (const [x, rect_arr] of same_x_map.entries())
            max_size_x_map.set(x, (() => { let max_x = 0; for (const rect of rect_arr) { max_x = Math.max(rect.size.x, max_x); } return max_x; })() );
        for (const [y, rect_arr] of same_y_map.entries())
            max_size_y_map.set(y, (() => { let max_y = 0; for (const rect of rect_arr) { max_y = Math.max(rect.size.y, max_y); } return max_y; })() );
        let last :rect_t;
        dir_index = 0;
        curr_x = 0;
        curr_y = 0;
        for (const curr of this.task_rects) {
            if (last !== undefined) {
                if (dirs[dir_index] == "right") {
                    curr.origin.x = last.origin.x + (max_size_x_map.get(curr_x) + max_size_x_map.get(curr_x + 1)) / 2;
                    curr.origin.y = last.origin.y;
                    curr_x++; 
                }
                else if (dirs[dir_index] == "left") {
                    curr.origin.x = last.origin.x - (max_size_x_map.get(curr_x) + max_size_x_map.get(curr_x - 1)) / 2;
                    curr.origin.y = last.origin.y;
                    curr_x--; 
                }
                else if (dirs[dir_index] == "down") {
                    curr.origin.x = last.origin.x;
                    curr.origin.y = last.origin.y + (max_size_y_map.get(curr_y) + max_size_y_map.get(curr_y + 1)) / 2;
                    curr_y++; 
                }
                dir_index = (dir_index + 1) % dirs.length;
            }
            last = curr;
        }

        // size
        let min_x = first_elem(this.task_rects).left;
        let max_x = first_elem(this.task_rects).right;
        let min_y = first_elem(this.task_rects).top;
        let max_y = first_elem(this.task_rects).bottom;
        for (const rect of this.task_rects) {
            min_x = Math.min(rect.left, min_x);
            max_x = Math.max(rect.right, max_x);
            min_y = Math.min(rect.top, min_y);
            max_y = Math.max(rect.bottom, max_y);
        }
        this.size = new vec2_t(max_x - min_x, max_y - min_y);

        const center_x = (max_x + min_x) / 2;
        for (const rect of this.task_rects) {
            rect.origin.x -= center_x;
            rect.origin.y += first_elem(this.task_rects).size.y / 2;
        }

        this.in = new vec2_t(first_elem(this.task_rects).origin.x, first_elem(this.task_rects).top);
        this.out = new vec2_t(last_elem(this.task_rects).origin.x, last_elem(this.task_rects).bottom);
    }
}