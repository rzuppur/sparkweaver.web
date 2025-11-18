<script lang="ts">
  import { NodeLinkLocation, NodeLinkType } from "$lib/model/node.model";
  import { editorService } from "$lib/service/editor.service";
  import { editorStore } from "$lib/store/editor.store";

  interface Props {
    nodeId: number;
    location: NodeLinkLocation;
    type: NodeLinkType;
    index: number;
  }

  let { nodeId, location, type, index }: Props = $props();

  const editorNodes = editorStore.nodes;
  const editorActiveId = editorStore.activeId;
  const editorSelection = editorStore.selection;
  const editorColorLinks = editorStore.colorLinks;
  const editorTriggerLinks = editorStore.triggerLinks;

  const isActive = $derived($editorActiveId === nodeId);
  const link = $derived.by(() => {
    if (type === NodeLinkType.COLOR && location === NodeLinkLocation.INPUT) return $editorColorLinks.find(l => l.inputId === nodeId && l.inputIndex === index);
    if (type === NodeLinkType.COLOR && location === NodeLinkLocation.OUTPUT) return $editorColorLinks.find(l => l.outputId === nodeId && l.outputIndex === index);
    if (type === NodeLinkType.TRIGGER && location === NodeLinkLocation.INPUT) return $editorTriggerLinks.find(l => l.inputId === nodeId && l.inputIndex === index);
    if (type === NodeLinkType.TRIGGER && location === NodeLinkLocation.OUTPUT) return $editorTriggerLinks.find(l => l.outputId === nodeId && l.outputIndex === index);
  });
  const otherNodeId = $derived.by(() => {
    if (link && location === NodeLinkLocation.INPUT) return link.outputId;
    else if (link) return link.inputId;
  });
  const otherNode = $derived(otherNodeId ? $editorNodes.find(n => n.id === otherNodeId) : undefined);
  const otherNodeActive = $derived(otherNodeId !== nodeId && otherNodeId && ($editorActiveId === otherNodeId));
  const isSelected = $derived.by(() => {
    if (link) return false;
    if ($editorSelection.type !== type) return false;
    if (location === NodeLinkLocation.INPUT) return nodeId === $editorSelection.inputId;
    return nodeId === $editorSelection.outputId;
  });

  function onClick() {
    if (link) {
      editorService.disconnectLink(link, type);
    } else {
      if (location === NodeLinkLocation.INPUT) {
        editorService.selectInput(nodeId, type);
      } else {
        editorService.selectOutput(nodeId, type);
      }
    }
  }
</script>

<button
  type="button"
  class="anchor"
  class:active={isActive}
  class:connected={link}
  class:color={type === NodeLinkType.COLOR}
  class:trigger={type === NodeLinkType.TRIGGER}
  class:input={location === NodeLinkLocation.INPUT}
  class:output={location === NodeLinkLocation.OUTPUT}
  class:highlight={otherNodeActive}
  class:selected={isSelected}
  style:cursor={link ? "crosshair" : "pointer"}
  onclick={onClick}
>
  {#if otherNode}
    <div class="label">{otherNode.label || otherNode.config.name}</div>
  {/if}
</button>

<style>
  .anchor {
    display: block;
    width: var(--s-mdp);
    height: var(--s-mdp);
    border-radius: 50%;
    appearance: none;
    border: none;
    user-select: none;
    position: relative;

    .label {
      font-size: 11px;
      color: #fff;
      opacity: 0.6;
      display: none;
      position: absolute;
      top: 5px;
      line-height: 1;
      text-shadow: 0 2px #111, 0 -2px #111, -2px 0 #111, 2px 0 #111;

      .input & {
        text-align: right;
        right: 7px;
      }

      .output & {
        text-align: left;
        left: 7px;
      }

      .active & {
        display: block;
      }
    }

    &.color {
      background: oklch(0.6 0 0);

      &.connected.active {
        background: oklch(0.35 0 0);
      }

      &.highlight {
        background: oklch(0.7 0 0);
      }
    }

    &.trigger {
      background: oklch(0.6 0.1 60);

      &.connected.active {
        background: oklch(0.35 0.05 60);
      }

      &.highlight {
        background: oklch(0.7 0.1 60);
      }
    }

    &.selected {
      background: #fff;
    }
  }
</style>
