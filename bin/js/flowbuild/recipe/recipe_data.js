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
        this.num_shares = 0;
        this.num_likes = 0;
        this.owners = new Set();
        this.visibiliy = 'public';
        this.tags = new Set();
    }
}
//# sourceMappingURL=recipe_data.js.map