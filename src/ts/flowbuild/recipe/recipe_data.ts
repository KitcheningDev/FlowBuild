import { ObjID } from "../../utils/obj_id.js";
import { Ingredient } from "./task.js";

export class Owner extends ObjID {
    constructor(name: string, avatar: string) {
        super();
        this.name = name;
        this.avatar = avatar;
    }
    // member
    name: string;
    avatar: string;
}
export class Tag extends ObjID {
    constructor(name: string) {
        super();
        this.name = name;
    }
    // member
    name: string;
}
export class RecipeData extends ObjID {
    constructor() {
        super();
        this.title = 'No Title';
        this.difficulty = 3;
        this.ingredients = new Set<Ingredient>();
        this.duration = 0;
        this.prep_time = 0;
        this.image_list = [];
        this.image_flowChart = "";
        this.num_shares = 0;
        this.num_likes = 0;
        this.owner = new Owner("", "https://cdn.pixabay.com/photo/2017/07/18/17/16/black-2516434_960_720.jpg");
        this.visibiliy = 'public';
        this.tags = new Set();
    }
    // member
    title: string;
    difficulty: number;
    ingredients: Set<Ingredient>;
    duration: number;
    prep_time: number;
    image_list: string[];
    image_flowChart: string;
    num_shares: number;
    num_likes: number;
    owner: Owner;
    visibiliy: string;
    tags: Set<Tag>;
}
