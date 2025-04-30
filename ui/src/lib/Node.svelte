<script lang="ts">
  import NodeAnchor from "./NodeAnchor.svelte";
  import { store } from "./store";
  import { SWNode } from "./SWNode.svelte";

  interface Props {
    node: SWNode;
  }

  let { node }: Props = $props();

  const nodeType = $derived($store.nodeTypes.find(nt => nt.name === node.name));
  const isSelected = $derived($store.editing === node);

  function select(event: MouseEvent | KeyboardEvent): void {
    if ("key" in event && event.key !== "Enter") return;
    if ($store.editing === node) {
      $store.editing = undefined;
    } else {
      $store.editing = node;
    }
  }
</script>

<div class="node" bind:this={node.element} class:selected={isSelected}>
  <div class="input anchors">
    {#each Array(node.colorInputAnchorsCount).keys() as ca_i (ca_i)}
      <NodeAnchor index={ca_i} {node} location="input" type="color"></NodeAnchor>
    {/each}
    {#each Array(node.triggerInputAnchorsCount).keys() as ta_i (ta_i)}
      <NodeAnchor index={ta_i} {node} location="input" type="trigger"></NodeAnchor>
    {/each}
  </div>
  <div class="content">
    <div class="header" onclick={select} role="button" tabindex="0" onkeydown={select}>
      <div class="name">{nodeType?.title}</div>
    </div>
    <div class="preview">
      {#if node.name === "SrColor"}
        {@const red = node.params.find(p => p.name === "red")?.value}
        {@const green = node.params.find(p => p.name === "green")?.value}
        {@const blue = node.params.find(p => p.name === "blue")?.value}
        <div class="color-preview">
          <div class="color" style:background-color={`rgb(${red ?? 0}, ${green ?? 0}, ${blue ?? 0})`}></div>
        </div>
      {:else}
        <div class="values">
          {#each node.params as param, p_i (p_i)}
            <div class="value-text">{param.name}: {param.value}</div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  <div class="output anchors">
    {#each Array(node.colorOutputAnchorsCount).keys() as ca_i (ca_i)}
      <NodeAnchor index={ca_i} {node} location="output" type="color"></NodeAnchor>
    {/each}
    {#each Array(node.triggerOutputAnchorsCount).keys() as ta_i (ta_i)}
      <NodeAnchor index={ta_i} {node} location="output" type="trigger"></NodeAnchor>
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

    &.selected {
      outline: 2px solid #fff;
    }

    .content {
      border-radius: var(--s-sm);
      overflow: hidden;

      .header {
        padding: var(--s-sm) var(--s-mdp);
        display: flex;
        align-items: center;
        cursor: pointer;
        user-select: none;
        background: #222;
        height: calc(var(--s-mdp) + 2 * var(--s-xsp));

        &:hover,
        &:focus-visible {
          background: #333;
        }

        .name {
          line-height: 1;
          white-space: nowrap;
          flex: 1 1 auto;
        }
      }

      .preview {
        height: 100%;

        .values {
          padding: var(--s-sm) var(--s-mdp);

          .value-text {
            font-size: 13px;
            line-height: 1.3;
            color: #bbb;
          }
        }

        .color-preview {
          height: 100%;
          padding: 0 var(--s-mdp);

          .color {
            height: 100%;
            min-height: var(--s-mdp);
          }
        }
      }
    }

    .anchors {
      display: flex;
      flex-direction: column;
      padding: var(--s-xsp) 0;
      gap: var(--s-sm);
      z-index: 1;
      margin-left: calc(-1 * var(--s-smp));
      margin-right: calc(-1 * var(--s-smp));

      @media (pointer: fine) {
        gap: var(--s-xsp);
        margin-left: calc(-1 * var(--s-sm));
        margin-right: calc(-1 * var(--s-sm));
      }
    }
  }
</style>