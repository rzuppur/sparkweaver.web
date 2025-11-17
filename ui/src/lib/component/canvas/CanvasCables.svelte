<script lang="ts">
  import { NodeCategory } from "$lib/model/nodeConfig.model";
  import { canvasStore } from "$lib/store/canvas.store";
  import { editorStore } from "$lib/store/editor.store";
  import { onMount } from "svelte";

  interface Path {
    path: string;
    color: string;
    width: number;
    opacity: number;
  }

  interface Props {
    width: number;
    height: number;
  }

  let { width, height }: Props = $props();

  const editorNodes = editorStore.nodes;
  const editorActiveId = editorStore.activeId;
  const editorColorLinks = editorStore.colorLinks;
  const editorTriggerLinks = editorStore.triggerLinks;

  let animationFrameId: ReturnType<typeof requestAnimationFrame> | undefined = undefined;
  let paths: Array<Path> = $state([]);

  onMount(() => {
    calculatePaths();
    return () => { if (animationFrameId !== undefined) cancelAnimationFrame(animationFrameId); };
  });

  function calculatePaths(): void {
    const newPaths: Array<Path> = [];

    for (const output of $canvasStore) {
      const outNode = $editorNodes.find(n => n.id === output.nodeId);
      if (!outNode) continue;

      for (const link of $editorColorLinks.filter(l => l.outputId === output.nodeId)) {
        const input = $canvasStore.find(c => c.nodeId === link.inputId);
        if (!input) continue;
        const outAnchorEl = output.element.querySelector<HTMLElement>(`.output .anchor.color:nth-child(${link.outputIndex + 1})`);
        if (!outAnchorEl) continue;
        const inAnchorEl = input.element.querySelector<HTMLElement>(`.input .anchor.color:nth-child(${link.inputIndex + 1})`);
        if (!inAnchorEl) continue;
        newPaths.push({
          path: getPath(
            outAnchorEl.offsetLeft + outAnchorEl.offsetWidth, outAnchorEl.offsetTop + outAnchorEl.offsetHeight / 2,
            inAnchorEl.offsetLeft, inAnchorEl.offsetTop + inAnchorEl.offsetHeight / 2,
          ),
          color: getPathColor(outNode.category),
          width: $editorActiveId ? (($editorActiveId === output.nodeId || $editorActiveId === input.nodeId) ? 4 : 2) : 3,
          opacity: $editorActiveId ? (($editorActiveId === output.nodeId || $editorActiveId === input.nodeId) ? 0.9 : 0.07) : 0.3,
        });
      }

      for (const link of $editorTriggerLinks.filter(l => l.outputId === output.nodeId)) {
        const input = $canvasStore.find(c => c.nodeId === link.inputId);
        if (!input) continue;
        const outAnchorEl = output.element.querySelector<HTMLElement>(`.output .anchor.trigger:nth-child(${link.outputIndex + 1})`);
        if (!outAnchorEl) continue;
        const inAnchorEl = input.element.querySelector<HTMLElement>(`.input .anchor.trigger:nth-child(${link.inputIndex + 1})`);
        if (!inAnchorEl) continue;
        newPaths.push({
          path: getPath(
            outAnchorEl.offsetLeft + outAnchorEl.offsetWidth, outAnchorEl.offsetTop + outAnchorEl.offsetHeight / 2,
            inAnchorEl.offsetLeft, inAnchorEl.offsetTop + inAnchorEl.offsetHeight / 2,
          ),
          color: getPathColor(NodeCategory.TR),
          width: $editorActiveId ? (($editorActiveId === output.nodeId || $editorActiveId === input.nodeId) ? 3 : 1.5) : 2,
          opacity: $editorActiveId ? (($editorActiveId === output.nodeId || $editorActiveId === input.nodeId) ? 0.9 : 0.07) : 0.25,
        });
      }
    }

    if (newPaths.length !== paths.length) {
      paths = newPaths;
    } else {
      for (let i = 0; i < paths.length; i++) {
        const a = newPaths[i];
        const b = paths[i];
        if (a.path !== b.path || a.color !== b.color || a.opacity !== b.opacity || a.width !== b.width) {
          paths = newPaths;
          break;
        }
      }
    }

    animationFrameId = requestAnimationFrame(calculatePaths);
  }

  function getPathColor(category: NodeCategory): string {
    if (category === NodeCategory.SR) return "oklch(0.6 0.1 260)";
    if (category === NodeCategory.TR) return "oklch(0.6 0.1 60)";
    if (category === NodeCategory.FX) return "oklch(0.6 0.1 120)";
    if (category === NodeCategory.MX) return "oklch(0.6 0.1 300)";
    return "#444";
  }

  function getPath(x1: number, y1: number, x2: number, y2: number): string {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const tension = Math.min(distance * 0.2, 100);
    const angle = Math.atan2(deltaY, deltaX);
    const cp1OffsetX = tension * Math.cos(angle);
    const cp1OffsetY = tension * Math.sin(angle);
    const gravity = Math.min(distance * 0.2, 20);
    const cp1x = x1 + cp1OffsetX;
    const cp1y = y1 + cp1OffsetY + gravity;
    const cp2x = x2 - cp1OffsetX;
    const cp2y = y2 - cp1OffsetY + gravity;
    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  }
</script>

<svg
  class="cables"
  viewBox="0 0 {width} {height}"
  width={width}
  height={height}
>
  {#each paths as path, p_i (p_i)}
    <path
      d={path.path}
      fill="transparent"
      stroke={path.color}
      stroke-width={path.width}
      stroke-linecap="round"
      opacity={path.opacity}
    ></path>
  {/each}
</svg>

<style>
  .cables {
    position: absolute;
    z-index: 1;
    pointer-events: none;
    user-select: none;
  }
</style>