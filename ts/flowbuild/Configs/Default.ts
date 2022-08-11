import { FlowbuildConfig, BacktrackParams, PathLayout } from "../Config.js";

const layout_order = new Array<PathLayout>;
layout_order.push(PathLayout.Straight);
layout_order.push(PathLayout.Alternate);

const hor_spacing_order = new Array<number>();
hor_spacing_order.push(0.4);
hor_spacing_order.push(0.2);
hor_spacing_order.push(0);

const ver_padding_order = new Array<number>();
ver_padding_order.push(0);
ver_padding_order.push(0.05);
ver_padding_order.push(0.1);
ver_padding_order.push(0.15);

export const default_config = new FlowbuildConfig(layout_order, hor_spacing_order, ver_padding_order);