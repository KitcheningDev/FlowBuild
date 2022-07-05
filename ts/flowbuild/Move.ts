import { Vec2, Arrow } from "./Grid.js";

class TextCoords {
    text: string;
    coords: Vec2;

    constructor(text: string, coords: Vec2) {
        this.text = text;
        this.coords = coords;
    }
}
class ArrowCoords {
    arrow: Arrow;
    coords: Vec2;

    constructor(arrow: Arrow, coords: Vec2) {
        this.arrow = arrow;
        this.coords = coords;
    }
}

export class Move {
    boxes: Array<TextCoords>;
    arrows: Array<ArrowCoords>;
}