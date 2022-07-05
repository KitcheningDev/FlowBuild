var BoxType;
(function (BoxType) {
    BoxType[BoxType["task"] = 0] = "task";
    BoxType[BoxType["cond"] = 1] = "cond";
    BoxType[BoxType["start"] = 2] = "start";
    BoxType[BoxType["end"] = 3] = "end";
})(BoxType || (BoxType = {}));
class RecipeBox {
    constructor(name, type) {
    }
}
export class Recipe {
    constructor(json) {
        this.name = json["name"];
        this.paths = json["paths"];
    }
}
//# sourceMappingURL=Recipe.js.map