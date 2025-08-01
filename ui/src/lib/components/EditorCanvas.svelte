<script lang="ts">
  import EditorNode from "$lib/components/EditorNode.svelte";
  import { coreNodeTypes, editorNodes, editorSelected, editorSelection, editorService } from "$lib/services";
  import { onMount } from "svelte";

  function addNode(typeId: number): void {
    setTimeout(() => {
      editorService.addNewNode(typeId);
    }, 0); // Firefox sometimes sends double click events without the delay
  }

  const sourceTypes = $derived($coreNodeTypes.filter(n => n.category === "SR"));
  const triggerTypes = $derived($coreNodeTypes.filter(n => n.category === "TR"));
  const effectTypes = $derived($coreNodeTypes.filter(n => n.category === "FX"));
  const mixTypes = $derived($coreNodeTypes.filter(n => n.category === "MX"));
  const destinationTypes = $derived($coreNodeTypes.filter(n => n.category === "DS"));

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

  const sourceNodes = $derived($editorNodes.filter(n => n.nodeType.category === "SR"));
  const triggerNodes = $derived($editorNodes.filter(n => n.nodeType.category === "TR"));
  const effectNodes = $derived($editorNodes.filter(n => n.nodeType.category === "FX"));
  const mixNodes = $derived($editorNodes.filter(n => n.nodeType.category === "MX"));
  const destinationNodes = $derived($editorNodes.filter(n => n.nodeType.category === "DS"));

  const lineOpacity = $derived($editorSelected ? 0.07 : 0.4);
  const selectedUid = $derived($editorSelected?.uid);

  function isSelected(line: [number, number, string]): boolean {
    const [toUid, fromUid] = line;
    return toUid === selectedUid || fromUid === selectedUid;
  }

  function getLineColor(line: [number, number, string]) {
    const [, fromUid] = line;
    if (sourceNodes.some(n => n.uid === fromUid)) return "oklch(0.6 0.1 260)";
    if (triggerNodes.some(n => n.uid === fromUid)) return "oklch(0.6 0.1 60)";
    if (effectNodes.some(n => n.uid === fromUid)) return "oklch(0.6 0.1 120)";
    if (mixNodes.some(n => n.uid === fromUid)) return "oklch(0.6 0.1 300)";
    return "#444";
  }
</script>

<div class="canvas">
  <svg
    class="lines"
    viewBox="0 0 {columnsWidth} {columnsHeight}"
    width={columnsWidth}
    height={columnsHeight}
  >
    {#each $editorNodes as node (node.uid)}
      {#each node.colorLines as line, cl_i (cl_i)}
        <path
          d={line[2]}
          fill="transparent"
          stroke={getLineColor(line)}
          stroke-width={isSelected(line) ? 4 : 2}
          stroke-linecap="round"
          opacity={isSelected(line) ? 0.7 : lineOpacity}
        ></path>
      {/each}
      {#each node.triggerLines as line, tl_i (tl_i)}
        <path
          d={line[2]}
          fill="transparent"
          stroke={getLineColor(line)}
          stroke-width={isSelected(line) ? 4 : 2}
          stroke-linecap="round"
          opacity={isSelected(line) ? 0.7 : lineOpacity}
        ></path>
      {/each}
    {/each}
  </svg>
  <div bind:this={columnsEl} class="columns">
    <div class="column type-source">
      <div class="column-title">Source</div>
      {#each sourceNodes as node (node.uid)}
        <EditorNode {node}></EditorNode>
      {/each}
      <div>
        {#each sourceTypes as nodeType (nodeType.type_id)}
          <button type="button" onclick={() => addNode(nodeType.type_id)} class="add-button" disabled={!!($editorSelection.from || $editorSelection.to)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
              <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
            </svg>
            <span class="button-label">{nodeType.name}</span>
          </button>
        {/each}
      </div>
      <div class="column-footer"></div>
    </div>
    <div class="column type-trigger">
      <div class="column-title">Trigger</div>
      {#each triggerNodes as node (node.uid)}
        <EditorNode {node}></EditorNode>
      {/each}
      <div>
        {#each triggerTypes as nodeType (nodeType.type_id)}
          <button type="button" onclick={() => addNode(nodeType.type_id)} class="add-button" disabled={!!($editorSelection.from || $editorSelection.to)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
              <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
            </svg>
            <span class="button-label">{nodeType.name}</span>
          </button>
        {/each}
      </div>
      <div class="column-footer"></div>
    </div>
    <div class="column type-effect">
      <div class="column-title">Effect</div>
      {#each effectNodes as node (node.uid)}
        <EditorNode {node}></EditorNode>
      {/each}
      <div>
        {#each effectTypes as nodeType (nodeType.type_id)}
          <button type="button" onclick={() => addNode(nodeType.type_id)} class="add-button" disabled={!!($editorSelection.from || $editorSelection.to)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
              <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
            </svg>
            <span class="button-label">{nodeType.name}</span>
          </button>
        {/each}
      </div>
      <div class="column-footer"></div>
    </div>
    <div class="column type-mix">
      <div class="column-title">Mix</div>
      {#each mixNodes as node (node.uid)}
        <EditorNode {node}></EditorNode>
      {/each}
      <div>
        {#each mixTypes as nodeType (nodeType.type_id)}
          <button type="button" onclick={() => addNode(nodeType.type_id)} class="add-button" disabled={!!($editorSelection.from || $editorSelection.to)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
              <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
            </svg>
            <span class="button-label">{nodeType.name}</span>
          </button>
        {/each}
      </div>
      <div class="column-footer"></div>
    </div>
    <div class="column type-destination">
      <div class="column-title">Destination</div>
      {#each destinationNodes as node (node.uid)}
        <EditorNode {node}></EditorNode>
      {/each}
      <div>
        {#each destinationTypes as nodeType (nodeType.type_id)}
          <button type="button" onclick={() => addNode(nodeType.type_id)} class="add-button" disabled={!!($editorSelection.from || $editorSelection.to)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
              <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
            </svg>
            <span class="button-label">{nodeType.name}</span>
          </button>
        {/each}
      </div>
      <div class="column-footer"></div>
    </div>
  </div>
</div>

<style>
  .add-button {
    height: 32px;
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--s-xsp);
    justify-content: start;
    text-align: start;
    background: transparent;
    border-radius: var(--s-sm);

    svg {
      width: 20px;
      height: 20px;
      display: block;
      fill: #fff;
      flex: 0 0 auto;
    }

    .button-label,
    svg {
      opacity: 0.6;
    }

    &:hover {
      background: #fff1;

      .button-label,
      svg {
        opacity: 0.8;
      }
    }
  }

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
          flex: 1 1 auto;
          font-size: 24px;
          line-height: 1;
          white-space: nowrap;
          letter-spacing: -0.04em;
          color: #555;
          margin-bottom: var(--s-sm);
        }

        .column-footer {
          flex: 2 1 auto;
        }
      }
    }
  }
</style>
