var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Flowbuild_recipe, _Flowbuild_config;
import { Grid, Vec2 } from "./grid.js";
var PathLayout;
(function (PathLayout) {
    PathLayout[PathLayout["Straight"] = 0] = "Straight";
    PathLayout[PathLayout["Alternate"] = 1] = "Alternate";
})(PathLayout || (PathLayout = {}));
export class Config {
    constructor() {
        this.layout = PathLayout.Straight;
    }
}
export class Flowbuild {
    constructor(recipe, config) {
        _Flowbuild_recipe.set(this, void 0);
        _Flowbuild_config.set(this, void 0);
        this.grid = new Grid(7, 10);
        __classPrivateFieldSet(this, _Flowbuild_recipe, recipe, "f");
        if (config == undefined)
            __classPrivateFieldSet(this, _Flowbuild_config, new Config(), "f");
        else
            __classPrivateFieldSet(this, _Flowbuild_config, config, "f");
    }
    Backtrack(head) {
    }
    ArithmAvg(text) {
        const avg = new Vec2();
        for (let parent of __classPrivateFieldGet(this, _Flowbuild_recipe, "f").paths.get(text).prev)
            avg.AddVec(this.grid.GetPos(parent));
        return avg.DivScal(__classPrivateFieldGet(this, _Flowbuild_recipe, "f").paths.get(text).prev.length);
    }
    BacktrackDefault(head) {
        let head_pos = this.ArithmAvg(head);
        const positions = [];
        for (let i = 0; i < __classPrivateFieldGet(this, _Flowbuild_recipe, "f").paths.get(head).boxes.length; ++i) {
            if (__classPrivateFieldGet(this, _Flowbuild_config, "f").layout = PathLayout.Straight)
                positions.push(new Vec2(0, i).AddVec(head_pos));
            else if (__classPrivateFieldGet(this, _Flowbuild_config, "f").layout = PathLayout.Alternate) {
                let ver = 0;
                if (i % 4 == 1 || i % 4 == 2)
                    ver = 1;
                positions.push(new Vec2(ver, Math.floor(i / 2)).AddVec(head_pos));
            }
        }
        return false;
    }
}
_Flowbuild_recipe = new WeakMap(), _Flowbuild_config = new WeakMap();
//# sourceMappingURL=Flowbuild.js.map