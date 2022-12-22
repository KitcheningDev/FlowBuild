export class vec2_t {
    constructor(...any) {
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
    copy() {
        return new vec2_t(this.x, this.y);
    }
    abs() {
        return new vec2_t(Math.abs(this.x), Math.abs(this.y));
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        const length = this.length();
        this.x /= length;
        this.y /= length;
        return this;
    }
}
export var vec2;
(function (vec2) {
    function equals(v1, v2) {
        return v1.x == v2.x && v1.y == v2.y;
    }
    vec2.equals = equals;
    function add(v1, v2) {
        return new vec2_t(v1.x + v2.x, v1.y + v2.y);
    }
    vec2.add = add;
    function sub(v1, v2) {
        return new vec2_t(v1.x - v2.x, v1.y - v2.y);
    }
    vec2.sub = sub;
    function mult_scal(v, scal) {
        return new vec2_t(v.x * scal, v.y * scal);
    }
    vec2.mult_scal = mult_scal;
    function div_scal(v, scal) {
        return new vec2_t(v.x / scal, v.y / scal);
    }
    vec2.div_scal = div_scal;
    function normalized(v) {
        return v.copy().normalize();
    }
    vec2.normalized = normalized;
})(vec2 || (vec2 = {}));
//# sourceMappingURL=vec2.js.map