export class vec2_t {
    x: number;
    y: number;

    constructor(...any: number[]) {
        if (any.length == 0) {
            this.x = 0;
            this.y = 0;
        }
        else if (any.length == 1) {
            this.x = any[0];
            this.y = any[0];
        }
        else if (any.length == 2) {
            this.x = any[0];
            this.y = any[1];
        }
        else {
            this.x = NaN;
            this.y = NaN;
        }
    }

    copy(): vec2_t {
        return new vec2_t(this.x, this.y);
    }
    abs(): vec2_t {
        return new vec2_t(Math.abs(this.x), Math.abs(this.y));
    }
}
export namespace vec2 {
    export function equals(v1: vec2_t, v2: vec2_t): boolean {
        return v1.x == v2.x && v1.y == v2.y;
    }
    export function add(v1: vec2_t, v2: vec2_t): vec2_t {
        return new vec2_t(v1.x + v2.x, v1.y + v2.y);
    }
    export function sub(v1: vec2_t, v2: vec2_t): vec2_t {
        return new vec2_t(v1.x - v2.x, v1.y - v2.y);
    }
    export function mult_scal(v: vec2_t, scal: number): vec2_t {
        return new vec2_t(v.x * scal, v.y * scal);
    }
    export function div_scal(v: vec2_t, scal: number): vec2_t {
        return new vec2_t(v.x / scal, v.y / scal);
    }
}