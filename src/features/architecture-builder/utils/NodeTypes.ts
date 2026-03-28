import { ComponentNode } from "../components";

// Custom node types mapping
export const nodeTypes = {
  component: ComponentNode,
  module: ComponentNode,
  state: ComponentNode,
  effect: ComponentNode,
  api: ComponentNode,
  hook: ComponentNode,
  context: ComponentNode,
  util: ComponentNode,
};
