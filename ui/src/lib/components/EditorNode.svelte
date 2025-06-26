<script lang="ts">
  import EditorNodeAnchor from "$lib/components/EditorNodeAnchor.svelte";
  import { Node } from "$lib/Node.svelte.js";
  import { coreNodeTypes, editorEditing } from "$lib/services";

  interface Props {
    node: Node;
  }

  let { node }: Props = $props();

  const nodeType = $derived($coreNodeTypes.find(nt => nt.name === node.name));
  const isSelected = $derived($editorEditing === node);

  function select(event: MouseEvent | KeyboardEvent): void {
    if ("key" in event && event.key !== "Enter") return;
    if ($editorEditing === node) {
      $editorEditing = undefined;
    } else {
      $editorEditing = node;
    }
  }

  $effect(() => {
    if (isSelected) {
      node.element?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  });
</script>

<div class="node" bind:this={node.element} class:selected={isSelected}>
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