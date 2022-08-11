export class TextCoords {
    constructor(text, coords) {
        this.text = text;
        this.coords = coords;
    }
}
export class ArrowCoords {
    constructor(arrow, coords) {
        this.arrow = arrow;
        this.coords = coords;
    }
}
export class SyncLineCoords {
    constructor(sync_line, coords) {
        this.sync_line = sync_line;
        this.coords = coords;
    }
}
export class Move {
    constructor() {
        this.boxes = new Array();
        this.arrows = new Array();
        this.sync_lines = new Array();
    }
}
//# sourceMappingURL=Move.js.map