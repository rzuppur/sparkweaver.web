<script lang="ts">
  import { store } from "./store";
  import { type AnchorType, SWNode } from "./SWNode.svelte";

  interface Props {
    node: SWNode;
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
    !other && $store.selectionType === type && (isInput ? node === $store.selectedTo : node === $store.selectedFrom),
  );

  function onClick() {
    if (connectionFrom && connectionTo) {
      if (type === "color") {
        SWNode.disconnectColor(connectionFrom, connectionTo);
      } else {
        SWNode.disconnectTrigger(connectionFrom, connectionTo);
      }
    } else {
      try {
        if (isInput) {
          store.selectTo(node, type);
        } else {
          store.selectFrom(node, type);
        }
      } catch (e) {
        console.warn(e);
        store.deselect();
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
