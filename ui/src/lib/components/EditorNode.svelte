<script lang="ts">
  import EditorNodeAnchor from "$lib/components/EditorNodeAnchor.svelte";
  import EditorParams from "$lib/components/EditorParams.svelte";
  import { Node } from "$lib/Node.svelte.js";
  import { coreNodeTypes, coreSimulationDmxData, editorSelected, editorSelection, editorService } from "$lib/services";

  interface Props {
    node: Node;
  }

  function estimateTime(ticks: number): string {
    const seconds = ticks / 41.67;
    const minutes = seconds / 60;
    if (minutes > 2) {
      return `${minutes.toFixed(2)}m`;
    }
    return `${seconds.toFixed(2)}s`;
  }

  let { node }: Props = $props();

  const nodeType = $derived($coreNodeTypes.find(nt => nt.name === node.name));
  const isSelected = $derived($editorSelected?.uid === node.uid);
  const otherSelected = $derived(
    node.colorInputs.some(n => n.uid === $editorSelected?.uid) ||
    node.triggerInputs.some(n => n.uid === $editorSelected?.uid) ||
    node.colorOutputs.some(n => n.uid === $editorSelected?.uid) ||
    node.triggerOutputs.some(n => n.uid === $editorSelected?.uid),
  );

  const nodeSummary = $derived.by(() => {
    switch (nodeType?.type_id) {
      case 0x00:
        if (node.colorInputs.length > 1) {
          return `${node.params[0].value.toString(10).padStart(3, "0")}-${Math.min(512, (node.params[0].value + 2) + (node.colorInputs.length - 1) * 3).toString(10).padStart(3, "0")}`;
        }
        return `${node.params[0].value.toString(10).padStart(3, "0")}-${Math.min(512, node.params[0].value + 2).toString(10).padStart(3, "0")}`;
      case 0x20:
        return `${estimateTime(node.params[0].value)} +${Math.round(360 * (node.params[1].value % node.params[0].value) / node.params[0].value)}° ${Math.round((node.params[2].value / 255) * 100)}%`;
      case 0x21:
        return `${estimateTime(node.params[0].value)} - ${estimateTime(node.params[1].value)} - ${estimateTime(node.params[2].value)}`;
      case 0x22:
        return `${estimateTime(node.params[0].value)}`;
      case 0x60:
        return `${node.params[0].value}, ${node.params[1].value}, ${node.params[2].value}`;
      case 0x80:
        return `${Math.round(100 * node.params[0].value / 65535)}%`;
      case 0x81:
        return `${estimateTime(node.params[0].value)}`;
      case 0x82:
        return `${estimateTime(node.params[0].value)}`;
      case 0x83:
        return `${estimateTime(node.params[0].value)}-${estimateTime(node.params[1].value)}`;
      case 0x84:
        return `${node.params[0].value ? "random" : "sequential"}`;
      default:
        return null;
    }
  });

  function select(event: MouseEvent | KeyboardEvent): void {
    if ("key" in event && event.key !== "Enter") return;
    setTimeout(() => {
      editorService.selectNode(node);
    }, 0); // Firefox sometimes sends double click events without the delay
  }

  const hideFromSelection = $derived.by(() => {
    if (isSelected) return false;
    if ($editorSelection.from || $editorSelection.to) {
      if ($editorSelection.from && $editorSelection.type === "color") return !node.hasFreeColorInputs;
      if ($editorSelection.to && $editorSelection.type === "color") return !node.hasFreeColorOutputs;
      if ($editorSelection.from && $editorSelection.type === "trigger") return !node.hasFreeTriggerInputs;
      if ($editorSelection.to && $editorSelection.type === "trigger") return !node.hasFreeTriggerOutputs;
    }
    return false;
  });
</script>

<div
  bind:this={node.element}
  class="node"
  class:selected={isSelected}
  class:hide={hideFromSelection}
  class:other-selected={otherSelected}
>
  <div class="input anchors">
    {#each Array(node.colorInputAnchorsCount).keys() as ca_i (ca_i)}
      <EditorNodeAnchor index={ca_i} {node} location="input" type="color"></EditorNodeAnchor>
    {/each}
    {#each Array(node.triggerInputAnchorsCount).keys() as ta_i (ta_i)}
      <EditorNodeAnchor index={ta_i} {node} location="input" type="trigger"></EditorNodeAnchor>
    {/each}
  </div>
  <div class="content">
    <div class="header" onclick={select} role="button" tabindex="0" onkeydown={select}>
      {#if node.typeId === 0x60}
        {@const red = node.params.find(p => p.name === "red")?.value}
        {@const green = node.params.find(p => p.name === "green")?.value}
        {@const blue = node.params.find(p => p.name === "blue")?.value}
        <div class="color-preview" style:background-color={`rgb(${red ?? 0}, ${green ?? 0}, ${blue ?? 0})`}></div>
      {/if}
      {#if node.typeId === 0x00}
        {@const address = node.params.find(p => p.name === "address")?.value}
        {@const red = $coreSimulationDmxData.at(address ?? 0)}
        {@const green = $coreSimulationDmxData.at((address ?? 0) + 1)}
        {@const blue = $coreSimulationDmxData.at((address ?? 0) + 2)}
        <div class="color-preview" style:background-color={`rgb(${red ?? 0}, ${green ?? 0}, ${blue ?? 0})`}></div>
      {/if}
      <div class="name">{node.name}</div>
      {#if nodeSummary}
        <div class="summary">{nodeSummary}</div>
      {/if}
    </div>
    {#if isSelected}
      <div class="params">
        <EditorParams></EditorParams>
      </div>
    {/if}
  </div>
  <div class="output anchors">
    {#each Array(node.colorOutputAnchorsCount).keys() as ca_i (ca_i)}
      <EditorNodeAnchor index={ca_i} {node} location="output" type="color"></EditorNodeAnchor>
    {/each}
    {#each Array(node.triggerOutputAnchorsCount).keys() as ta_i (ta_i)}
      <EditorNodeAnchor index={ta_i} {node} location="output" type="trigger"></EditorNodeAnchor>
    {/each}
  </div>
</div>

<style>
  .node {
    border-radius: var(--s-sm);
    border-top: 1px solid #555;
    border-bottom: 1px solid #000;
    background: #171717;
    display: grid;
    grid-template-columns: auto 1fr auto;

    --header-color: oklch(0.25 0 0);
    --header-color-focus: oklch(0.3 0 0);

    :global(.type-source) & {
      --header-color: oklch(0.3 0.05 260);
      --header-color-focus: oklch(0.35 0.05 260);
    }

    :global(.type-trigger) & {
      --header-color: oklch(0.3 0.05 60);
      --header-color-focus: oklch(0.35 0.05 60);
    }

    :global(.type-effect) & {
      --header-color: oklch(0.3 0.05 120);
      --header-color-focus: oklch(0.35 0.05 120);
    }

    :global(.type-mix) & {
      --header-color: oklch(0.3 0.05 300);
      --header-color-focus: oklch(0.35 0.05 300);
    }

    :global(.type-destination) & {
      --header-color: oklch(0.3 0.05 190);
      --header-color-focus: oklch(0.35 0.05 260);
    }

    &.selected {
      outline: 2px solid #fff;
    }

    &.other-selected {
      outline: 2px solid #fff8;
    }

    &.hide {
      opacity: 0.2;
      pointer-events: none;
    }

    &:not(.selected) .anchors {
      padding: var(--s-sm) 0;
      padding-bottom: 0;

      :global(.anchor) {
        transform: scale(0.4);
        pointer-events: none;
        margin: -15px 0 -5px;
      }
    }

    &:not(.selected) :global(.anchor:not(.highlight)) {
      opacity: 0.4;
    }

    &:not(.selected) :global(.anchor:not(.connected)) {
      display: none;
    }

    .content {
      border-radius: var(--s-sm);
      overflow: hidden;

      .header {
        padding: 0 var(--s-md);
        display: flex;
        align-items: center;
        cursor: pointer;
        user-select: none;
        background: var(--header-color);
        height: var(--s-lg);
        gap: var(--s-sm);

        &:hover,
        &:focus-visible {
          background: var(--header-color-focus);
        }

        .color-preview {
          flex: 0 0 auto;
          width: var(--s-smp);
          height: var(--s-smp);
          border-radius: 50%;
          outline: 1px solid #fff1;
          margin-top: -1px;
        }

        .name {
          font-size: 13px;
          line-height: 1.2;
          letter-spacing: 0.01em;
          min-width: 0;
          display: block;
          white-space: nowrap;
          flex: 1 1 auto;
          margin-top: -3px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .summary {
          text-align: right;
          font-size: 11px;
          opacity: 0.6;
          line-height: 1.2;
          letter-spacing: 0.01em;
          min-width: 0;
          display: block;
          white-space: nowrap;
          flex: 0 0 auto;
          margin-top: -3px;
        }
      }

      .params {
        padding: var(--s-sm) var(--s-md);
      }
    }

    .anchors {
      display: flex;
      flex-direction: column;
      padding: var(--s-xsp) 0;
      gap: var(--s-xs);
      z-index: 1;
      margin-left: calc(-1 * var(--s-smp));
      margin-right: calc(-1 * var(--s-smp));
    }
  }
</style>