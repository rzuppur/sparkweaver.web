<script lang="ts">
  import { onMount } from "svelte";
  import Node from "./Node.svelte";
  import { store } from "./store";

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

    if (columnsEl) {
      resizeObserver.observe(columnsEl);
    }

    return () => {
      resizeObserver.disconnect();
    };
  });

  const sourceNodes = $derived($store.nodes.filter(n => n.name.startsWith("Sr")));
  const triggerNodes = $derived($store.nodes.filter(n => n.name.startsWith("Tr")));
  const effectNodes = $derived($store.nodes.filter(n => n.name.startsWith("Fx")));
  const mixNodes = $derived($store.nodes.filter(n => n.name.startsWith("Mx")));
  const destinationNodes = $derived($store.nodes.filter(n => n.name.startsWith("Ds")));

  const lineOpacity = $derived($store.editing ? 0.1 : 0.3);
  const selectedUid = $derived($store.editing?.uid);

  function isSelected(line: [number, number, string]): boolean {
    return line[0] === selectedUid || line[1] === selectedUid;
  }
</script>

<div class="canvas">
  <svg
    class="lines"
    viewBox="0 0 {columnsWidth} {columnsHeight}"
    width={columnsWidth}
    height={columnsHeight}
  >
    {#each $store.nodes as node (node.uid)}
      {#each node.colorLines as line, cl_i (cl_i)}
        <path
          d={line[2]}
          fill="transparent"
          stroke={isSelected(line) ? "#fb6" : "#b84"}
          stroke-width="4"
          stroke-linecap="round"
          opacity={isSelected(line) ? 0.9 : lineOpacity}
        ></path>
      {/each}
      {#each node.triggerLines as line, tl_i (tl_i)}
        <path
          d={line[2]}
          fill="transparent"
          stroke={isSelected(line) ? "#FFF" : "#888"}
          stroke-width="4"
          stroke-linecap="round"
          opacity={isSelected(line) ? 0.9 : lineOpacity}
        ></path>
      {/each}
    {/each}
  </svg>
  <div bind:this={columnsEl} class="columns">
    <div class="column">
      <div class="column-title">Source</div>
      {#each sourceNodes as node (node.uid)}
        <Node {node}></Node>
      {/each}
    </div>
    <div class="column">
      <div class="column-title">Trigger</div>
      {#each triggerNodes as node (node.uid)}
        <Node {node}></Node>
      {/each}
    </div>
    <div class="column">
      <div class="column-title">Effect</div>
      {#each effectNodes as node (node.uid)}
        <Node {node}></Node>
      {/each}
    </div>
    <div class="column">
      <div class="column-title">Mix</div>
      {#each mixNodes as node (node.uid)}
        <Node {node}></Node>
      {/each}
    </div>
    <div class="column">
      <div class="column-title">Destination</div>
      {#each destinationNodes as node (node.uid)}
        <Node {node}></Node>
      {/each}
    </div>
  </div>
</div>

<style>
  .canvas {
    padding: var(--s-md);
    overflow: auto;
    background: #080808;
    position: relative;
    height: 100%;

    .lines {
      position: absolute;
      z-index: 10;
      pointer-events: none;
      user-select: none;
    }

    .columns {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: 200px;
      gap: var(--s-xl);
      position: relative;

      .column {
        display: flex;
        flex-direction: column;
        gap: var(--s-sm);

        .column-title {
          font-size: 24px;
          line-height: 1;
          white-space: nowrap;
          letter-spacing: -0.04em;
          color: #555;
          margin-bottom: var(--s-sm);
        }
      }
    }
  }
</style>
