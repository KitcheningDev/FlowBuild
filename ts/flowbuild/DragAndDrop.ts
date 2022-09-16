import { Recipe } from "./Recipe.js";
import { DrawRecipe } from "./DrawRecipe.js";

export function ShouldOpenInputField(recipe: Recipe, from: string, to: string): boolean {
    return to == "" || recipe.HasConn(from, to);
}
export function InterpretDragAndDrop(recipe: Recipe, from: string, to: string, input: string): void {
    if (recipe.HasText(input))
        return InterpretDragAndDrop(recipe, from, to, input + "_");

    recipe.StartChange();
    if (to == "") {
        recipe.AddConn(from, input);
        
        if (from != "START" && !recipe.HasParent(from))
            recipe.AddConn("START", from);
        if (recipe.HasConn(from, "END"))
            recipe.RemoveConn(from, "END");
        recipe.AddConn(input, "END");
    }
    else if (recipe.HasConn(from, to)) {
        recipe.AddConn(from, input);
        recipe.AddConn(input, to);
        recipe.RemoveConn(from, to);
    }
    else {
        recipe.AddConn(from, to);

        if (from != "START" && !recipe.HasParent(from))
            recipe.AddConn("START", from);
        if (recipe.HasConn(from, "END"))
            recipe.RemoveConn(from, "END");
    }
    recipe.CommitChange();
}