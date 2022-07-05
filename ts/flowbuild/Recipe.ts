class RecipePath {
    boxes: Array<string>;

    prev: Array<string>;
    next: Array<string>;
    
    constructor(name: string)
    {
        this.boxes = [name]
        this.prev = [];
        this.next = [];
    }
}
export class Recipe {
    readonly name: string;
    paths: Map<string, RecipePath>;

    constructor(json: object)
    {
        this.name = json["name"];
        this.paths = new Map<string, RecipePath>();

        const boxes = new Map<String, RecipePath>();
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

    private RecursiveAdd(head: string, boxes: Map<String, RecipePath>): void {
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