export enum PathLayout {
    Straight, Alternate
}

export class BacktrackParams {
    layout: PathLayout;
    hor_spacing: number;
    ver_padding: number;

    constructor(layout: PathLayout, hor_spacing: number, ver_padding: number) {
        this.layout = layout;
        this.hor_spacing = hor_spacing;
        this.ver_padding = ver_padding;
    }
}

export class FlowbuildConfig {
    layout_order: Array<PathLayout>;
    hor_spacing_order: Array<number>;
    ver_padding_order: Array<number>;
    
    constructor(layout_order: Array<PathLayout>, hor_spacing_order: Array<number>, ver_padding_order: Array<number>) {
        this.layout_order = layout_order;
        this.hor_spacing_order = hor_spacing_order;
        this.ver_padding_order = ver_padding_order;
    }
}