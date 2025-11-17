<script lang="ts">
  import CanvasCables from "$lib/component/canvas/CanvasCables.svelte";
  import CanvasColumn from "$lib/component/canvas/CanvasColumn.svelte";
  import { NodeCategory } from "$lib/model/nodeConfig.model";
  import { onMount } from "svelte";

  let columnsEl = $state<HTMLElement>();
  let columnsWidth = $state(0);
  let columnsHeight = $state(0);

  onMount(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (columnsEl) {
        columnsWidth = columnsEl.scrollWidth;
        columnsHeight = columnsEl.scrollHeight;
      }
    });
    if (columnsEl) { resizeObserver.observe(columnsEl); }
    return () => { resizeObserver.disconnect(); };
  });
</script>

<div class="canvas">
  <CanvasCables height={columnsHeight} width={columnsWidth}></CanvasCables>
  <div bind:this={columnsEl} class="columns">
    <CanvasColumn category={NodeCategory.SR} title="Source"></CanvasColumn>
    <CanvasColumn category={NodeCategory.TR} title="Trigger"></CanvasColumn>
    <CanvasColumn category={NodeCategory.FX} title="Effect"></CanvasColumn>
    <CanvasColumn category={NodeCategory.MX} title="Mix"></CanvasColumn>
    <CanvasColumn category={NodeCategory.DS} title="Destination"></CanvasColumn>
  </div>
</div>

<style>
  .canvas {
    padding: var(--s-md);
    overflow: auto;
    background: #080808;
    position: relative;
    height: 100%;

    .columns {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 200px;
      gap: var(--s-xl);
      position: relative;
    }
  }
</style>
