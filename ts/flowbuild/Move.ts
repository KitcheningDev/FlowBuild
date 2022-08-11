import { Vec2, Arrow, SyncLine } from "./Grid.js";

export class TextCoords {
    text: string;
    coords: Vec2;

    constructor(text: string, coords: Vec2) {
        this.text = text;
        this.coords = coords;
    }
}
export class ArrowCoords {
    arrow: Arrow;
    coords: Vec2;

    constructor(arrow: Arrow, coords: Vec2) {
        this.arrow = arrow;
        this.coords = coords;
    }
}
export class SyncLineCoords {
    sync_line: SyncLine;
    coords: Vec2;

    constructor(sync_line: SyncLine, coords: Vec2) {
        this.sync_line = sync_line;
        this.coords = coords;
    }
}

export class Move {
    boxes: Array<TextCoords>;
    arrows: Array<ArrowCoords>;
    sync_lines: Array<SyncLineCoords>;

    constructor() {
        this.boxes = new Array<TextCoords>();
        this.arrows = new Array<ArrowCoords>();
        this.sync_lines = new Array<SyncLineCoords>();
    }
}