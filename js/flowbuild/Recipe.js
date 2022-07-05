class RecipePath {
    constructor(name) {
        this.boxes = [name];
        this.prev = [];
        this.next = [];
    }
}
export class Recipe {
    constructor(json) {
        this.name = json["name"];
        this.paths = new Map();
        const boxes = new Map();
        for (let path of json["paths"]) {
            let prev = "";
            for (let text of path) {
                if (!boxes.has(text))
                    boxes.set(text, new RecipePath(text));
                if (prev) {
                    boxes.get(prev).next.push(text);
                    boxes.get(text).prev.push(prev);
                }
                prev = text;
            }
        }
        this.RecursiveAdd("START", boxes);
    }
    RecursiveAdd(head, boxes) {
        // stop loop
        if (this.paths.has(head))
            return;
        this.paths.set(head, new RecipePath(head));
        let curr_text = head;
        while (boxes.get(curr_text).next.length == 1) {
            curr_text = boxes.get(curr_text).next[0];
            if (boxes.get(curr_text).prev.length != 1) {
                this.RecursiveAdd(curr_text, boxes);
                this.paths.get(head).next.push(curr_text);
                this.paths.get(curr_text).prev.push(head);
                return;
            }
            this.paths.get(head).boxes.push(curr_text);
        }
        for (let child of boxes.get(curr_text).next) {
            this.RecursiveAdd(child, boxes);
            this.paths.get(head).next.push(child);
            this.paths.get(child).prev.push(head);
        }
    }
}
//# sourceMappingURL=Recipe.js.map