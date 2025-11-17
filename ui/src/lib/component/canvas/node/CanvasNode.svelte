<script lang="ts">
  import CanvasNodeAnchor from "$lib/component/canvas/node/CanvasNodeAnchor.svelte";
  import CanvasNodeHeader from "$lib/component/canvas/node/CanvasNodeHeader.svelte";
  import CanvasNodeParams from "$lib/component/canvas/node/CanvasNodeParams.svelte";
  import { Node, NodeLinkLocation, NodeLinkType } from "$lib/model/node.model";
  import { canvasStore } from "$lib/store/canvas.store";
  import { editorStore } from "$lib/store/editor.store";
  import { clamp } from "$lib/util/math.util";
  import { onMount } from "svelte";

  interface Props {
    node: Node;
  }

  let { node }: Props = $props();

  let element = $state<HTMLElement>();

  onMount(() => {
    if (element) canvasStore.add({ element, nodeId: node.id });
    return () => { canvasStore.remove(node.id); };
  });

  const editorActiveId = editorStore.activeId;
  const editorSelection = editorStore.selection;
  const editorColorLinks = editorStore.colorLinks;
  const editorTriggerLinks = editorStore.triggerLinks;

  const colorInputLinks = $derived($editorColorLinks.filter(l => l.inputId === node.id));
  const colorOutputLinks = $derived($editorColorLinks.filter(l => l.outputId === node.id));
  const triggerInputLinks = $derived($editorTriggerLinks.filter(l => l.inputId === node.id));
  const triggerOutputLinks = $derived($editorTriggerLinks.filter(l => l.outputId === node.id));

  const hasFreeColorInputs = $derived(colorInputLinks.length < node.config.colorInputsMax);
  const hasFreeColorOutputs = $derived(colorOutputLinks.length < node.config.colorOutputsMax);
  const hasFreeTriggerInputs = $derived(triggerInputLinks.length < node.config.triggerInputsMax);
  const hasFreeTriggerOutputs = $derived(triggerOutputLinks.length < node.config.triggerOutputsMax);

  const colorInputAnchorsCount = $derived(clamp(0, colorInputLinks.length + 1, node.config.colorInputsMax));
  const colorOutputAnchorsCount = $derived(clamp(0, colorOutputLinks.length + 1, node.config.colorOutputsMax));
  const triggerInputAnchorsCount = $derived(clamp(0, triggerInputLinks.length + 1, node.config.triggerInputsMax));
  const triggerOutputAnchorsCount = $derived(clamp(0, triggerOutputLinks.length + 1, node.config.triggerOutputsMax));

  const isActive = $derived($editorActiveId === node.id);
  const otherActive = $derived.by(() => {
    return colorInputLinks.some(l => l.outputId === $editorActiveId) ||
      colorOutputLinks.some(l => l.inputId === $editorActiveId) ||
      triggerInputLinks.some(l => l.outputId === $editorActiveId) ||
      triggerOutputLinks.some(l => l.inputId === $editorActiveId);
  });

  const hideFromSelection = $derived.by(() => {
    if (isActive) return false;
    if ($editorSelection.outputId || $editorSelection.inputId) {
      if ($editorSelection.outputId && $editorSelection.type === NodeLinkType.COLOR) return !hasFreeColorInputs;
      if ($editorSelection.inputId && $editorSelection.type === NodeLinkType.COLOR) return !hasFreeColorOutputs;
      if ($editorSelection.outputId && $editorSelection.type === NodeLinkType.TRIGGER) return !hasFreeTriggerInputs;
      if ($editorSelection.inputId && $editorSelection.type === NodeLinkType.TRIGGER) return !hasFreeTriggerOutputs;
    }
    return false;
  });
</script>

<div
  class="node"
  bind:this={element}
  class:selected={isActive}
  class:hide={hideFromSelection}
  class:other-selected={otherActive}
>
  <div class="input anchors">
    <div>
      {#each Array(colorInputAnchorsCount).keys() as index (index)}
        <CanvasNodeAnchor {index} nodeId={node.id} location={NodeLinkLocation.INPUT} type={NodeLinkType.COLOR}></CanvasNodeAnchor>
      {/each}
    </div>
    <div>
      {#each Array(triggerInputAnchorsCount).keys() as index (index)}
        <CanvasNodeAnchor {index} nodeId={node.id} location={NodeLinkLocation.INPUT} type={NodeLinkType.TRIGGER}></CanvasNodeAnchor>
      {/each}
    </div>
  </div>
  <div class="content">
    <CanvasNodeHeader nodeId={node.id}></CanvasNodeHeader>
    {#if isActive}
      <div class="params">
        <CanvasNodeParams></CanvasNodeParams>
      </div>
    {/if}
  </div>
  <div class="output anchors">
    <div>
      {#each Array(colorOutputAnchorsCount).keys() as index (index)}
        <CanvasNodeAnchor {index} nodeId={node.id} location={NodeLinkLocation.OUTPUT} type={NodeLinkType.COLOR}></CanvasNodeAnchor>
      {/each}
    </div>
    <div>
      {#each Array(triggerOutputAnchorsCount).keys() as index (index)}
        <CanvasNodeAnchor {index} nodeId={node.id} location={NodeLinkLocation.OUTPUT} type={NodeLinkType.TRIGGER}></CanvasNodeAnchor>
      {/each}
    </div>
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
        width: var(--s-sm);
        height: var(--s-sm);
        pointer-events: none;
        margin: -7px 8px 3px;
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
