import { get_size } from "../../position/get_grid_size.js";
export function account_dim(grid) {
    for (const node of grid.get_nodes()) {
        const coords = grid.get_node_coords(node);
        if (0 < coords.x && coords.x < grid.get_size().x - 1) {
            if (grid.is_empty(coords.left()) && grid.is_empty(coords.right())) {
                const size = get_size(coords, grid);
                if (size.x / 2 < get_size(coords.left(), grid).x && size.x / 2 < get_size(coords.right(), grid).x) {
                    grid.get(coords).account_x = false;
                }
            }
        }
        // if (!node.is_start() && grid.is_ver_path_empty(1, coords.y - 1, coords.x, 'nodes')) {
        //     grid.get(coords).account_x = false;
        // }
    }
}
//# sourceMappingURL=account_dim.js.map