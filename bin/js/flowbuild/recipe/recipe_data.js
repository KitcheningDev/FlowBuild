import { ObjID } from "../../utils/obj_id.js";
export class Owner extends ObjID {
    constructor(name, avatar) {
        super();
        this.name = name;
        this.avatar = avatar;
    }
}
export class Tag extends ObjID {
    constructor(name) {
        super();
        this.name = name;
    }
}
export class RecipeData extends ObjID {
    constructor() {
        super();
        this.title = 'No Title';
        this.difficulty = 3;
        this.ingredients = new Set();
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
}
//# sourceMappingURL=recipe_data.js.map