import { Grid, Vec2 } from "./grid.js";
import { Recipe } from "./Recipe.js";

enum PathLayout {
    Straight, Alternate
}

export class Config {
    layout: PathLayout;

    constructor() {
        this.layout = PathLayout.Straight;
    }
}

export class Flowbuild {
    readonly grid: Grid;
    #recipe: Recipe;
    #config: Config;

    constructor(recipe: Recipe, config: Config) {
        this.grid = new Grid(7, 10);
        this.#recipe = recipe;
        
        if (config == undefined)
            this.#config = new Config();
        else 
            this.#config = config;
    }

    Backtrack(head: string): void {
        
    }

    ArithmAvg(text: string): number {
        let avg = 0;
        for (let parent of this.#recipe.paths.get(text).prev)
            avg += this.grid.GetPos(parent).x;
        return Math.round(avg / this.#recipe.paths.get(text).prev.length);
    }
    ChildOff(text: string): number {
        const parent = this.#recipe.paths.get(text).prev[0];
        const index = this.#recipe.paths.get(parent).next.indexOf(text);
        const length = this.#recipe.paths.get(parent).next.length;

        if (length % 2)
            return index - Math.floor(length / 2);
        else if (index < length / 2)
            return index - length / 2;
        else 
            return index + 1 - length / 2;
    }
    Max(text: string): number {
        let max = 0;
        for (let parent of this.#recipe.paths.get(text).prev) {
            if (max < this.grid.GetPos(parent).y)
                max = this.grid.GetPos(parent).y
        }
        return max;
    }

    BacktrackDefault(head: string): boolean {
        let head_pos = new Vec2(this.ArithmAvg(head) + this.ChildOff(head), this.Max(head) + 1);

        // derives path positions from head pos
        const positions = [];
        for (let i = 0; i < this.#recipe.paths.get(head).boxes.length; ++i) {
            // path goes straight down from head
            if (this.#config.layout = PathLayout.Straight)
                positions.push(new Vec2(0, i).AddVec(head_pos));
            // path alternates on x (+0 and +1 or -1)pos while going down from head
            else if (this.#config.layout = PathLayout.Alternate) {
                let ver = 0;
                if (i % 4 == 1 || i % 4 == 2)
                    ver = 1;
                positions.push(new Vec2(ver, Math.floor(i / 2)).AddVec(head_pos));
            }
        }
        return false;
    }
}