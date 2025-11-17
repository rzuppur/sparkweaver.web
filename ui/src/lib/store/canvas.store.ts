import type { CanvasNode } from "$lib/model/canvasNode.model";
import { writable } from "svelte/store";

const canvasNodesStore = writable<Array<CanvasNode>>([]);
let canvasNodesValue: Array<CanvasNode> = [];

export const canvasStore = {
  subscribe: canvasNodesStore.subscribe,

  get value() { return canvasNodesValue; },

  add(canvasNode: CanvasNode): void {
    canvasNodesValue = canvasNodesValue.filter(n => n.nodeId !== canvasNode.nodeId);
    canvasNodesValue.push(canvasNode);
    canvasNodesStore.set(canvasNodesValue);
  },

  remove(nodeId: number): void {
    canvasNodesValue = canvasNodesValue.filter(n => n.nodeId !== nodeId);
    canvasNodesStore.set(canvasNodesValue);
  },
};
