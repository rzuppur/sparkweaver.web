<script lang="ts">
  import { type AnchorType, Node } from "$lib/Node.svelte.js";
  import { editorSelection, editorService, uiService } from "$lib/services";

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
    !other && $editorSelection.type === type && (isInput ? node === $editorSelection.to : node === $editorSelection.from),
  );

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
  aria-label="{node.name} {location} number {index + 1}"
>
  {#if type === "trigger"}
    T
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

    @media (pointer: fine) {
      width: var(--s-md);
      height: var(--s-md);
    }

    &.color {
      background: #654;

      &.connected {
        background: #b84;
      }
    }

    &.trigger {
      background: #444;
      color: #888;

      &.connected {
        background: #888;
        color: #111;
      }
    }

    &.selected {
      background: #fff;
    }
  }
</style>
