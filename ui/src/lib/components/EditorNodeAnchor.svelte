<script lang="ts">
  import { type AnchorType, Node } from "$lib/Node.svelte.js";
  import { editorSelected, editorSelection, editorService, uiService } from "$lib/services";

  interface Props {
    node: Node;
    location: "input" | "output";
    type: AnchorType;
    index: number;
  }

  let { node, location, type, index }: Props = $props();

  const isInput = $derived(location === "input");
  const inputConnections = $derived(type === "color" ? node.colorInputs : node.triggerInputs);
  const outputConnections = $derived(type === "color" ? node.colorOutputs : node.triggerOutputs);
  const connections = $derived(isInput ? inputConnections : outputConnections);
  const other = $derived(connections.find((_, i) => i === index));
  const cursor = $derived(other ? "crosshair" : "pointer");
  const connectionFrom = $derived(isInput ? other : node);
  const connectionTo = $derived(isInput ? node : other);
  const isSelected = $derived(
    !other && $editorSelection.type === type && (isInput ? node.uid === $editorSelection.to?.uid : node.uid === $editorSelection.from?.uid),
  );
  const isOtherSelected = $derived(other?.uid === $editorSelected?.uid);

  function onClick() {
    if (connectionFrom && connectionTo) {
      if (type === "color") {
        Node.disconnectColor(connectionFrom, connectionTo);
      } else {
        Node.disconnectTrigger(connectionFrom, connectionTo);
      }
    } else {
      try {
        if (isInput) {
          editorService.selectTo(node, type);
        } else {
          editorService.selectFrom(node, type);
        }
      } catch (e) {
        uiService.alertError(`${e}`);
        editorService.deselect();
      }
    }
  }
</script>

<button
  type="button"
  class="anchor"
  style:cursor={cursor}
  onclick={onClick}
  class:connected={other}
  class:selected={isSelected}
  class:color={type === "color"}
  class:trigger={type === "trigger"}
  class:highlight={isOtherSelected}
  aria-label="{node.name} {location} number {index + 1}"
>
  {#if !other}
    {#if type === "color"}C{/if}
    {#if type === "trigger"}T{/if}
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
    font-size: 13px;
    color: #111;
    font-weight: 700;
    user-select: none;

    &.color {
      background: oklch(0.6 0 0);

      &.connected {
        background: oklch(0.4 0 0);
      }
    }

    &.trigger {
      background: oklch(0.6 0.1 60);

      &.connected {
        background: oklch(0.4 0.1 60);
      }
    }

    &.selected {
      background: #fff;
    }
  }
</style>
