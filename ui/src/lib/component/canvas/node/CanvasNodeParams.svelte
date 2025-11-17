<script lang="ts">
  import CanvasNodeParam from "$lib/component/canvas/node/CanvasNodeParam.svelte";
  import { editorService } from "$lib/service/editor.service";
  import { editorStore } from "$lib/store/editor.store";

  const activeId = editorStore.activeId;
  const editorNodes = editorStore.nodes;

  const node = $derived($activeId && $editorNodes.find(n => n.id === $activeId));

  let labelInputEl: HTMLInputElement;

  function duplicateNode(): void {
    setTimeout(() => {
      if (node) editorService.duplicateNode(node);
    }, 0); // Firefox sometimes sends double click events without the delay
  }

  function deleteNode(): void {
    setTimeout(() => {
      if (node) editorService.removeNode(node);
    }, 0); // Firefox sometimes sends double click events without the delay
  }

  function moveUp(): void {
    setTimeout(() => {
      if (node) editorService.reorderNode(node, -1);
    }, 0); // Firefox sometimes sends double click events without the delay
  }

  function moveDown(): void {
    setTimeout(() => {
      if (node) editorService.reorderNode(node, 1);
    }, 0); // Firefox sometimes sends double click events without the delay
  }
</script>

{#if node}
  <div class="node-params">
    <input
      bind:this={labelInputEl}
      value={node.label} onchange={() => editorService.setNodeLabel(node.id, labelInputEl.value)}
      type="text"
      placeholder="Label"
      maxlength="80"
    >
    {#each node.params as param, p_i (p_i)}
      <CanvasNodeParam nodeId={$activeId} {param} index={p_i}></CanvasNodeParam>
    {/each}
    <div class="bottom-toolbar">
      <button type="button" class="project-button delete" title="Delete" onclick={deleteNode}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
          <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
        </svg>
      </button>
      <button type="button" class="project-button" title="Duplicate" onclick={duplicateNode}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
          <path d="M320-80q-33 0-56.5-23.5T240-160v-80h-80q-33 0-56.5-23.5T80-320v-80h80v80h80v-320q0-33 23.5-56.5T320-720h320v-80h-80v-80h80q33 0 56.5 23.5T720-800v80h80q33 0 56.5 23.5T880-640v480q0 33-23.5 56.5T800-80H320Zm0-80h480v-480H320v480ZM80-480v-160h80v160H80Zm0-240v-80q0-33 23.5-56.5T160-880h80v80h-80v80H80Zm240-80v-80h160v80H320Zm0 640v-480 480Z"/>
        </svg>
      </button>
      <button type="button" class="project-button" title="Move up" onclick={moveUp}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
          <path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z"/>
        </svg>
      </button>
      <button type="button" class="project-button" title="Move down" onclick={moveDown}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
          <path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"/>
        </svg>
      </button>
    </div>
  </div>
{/if}

<style>
  .node-params {
    display: flex;
    flex-direction: column;
    gap: var(--s-sm);

    .bottom-toolbar {
      display: flex;
      padding: var(--s-sm) 0;
      gap: var(--s-sm);

      button {
        height: 36px;
        min-width: 36px;
        display: flex;
        align-items: center;
        gap: var(--s-xsp);
        justify-content: center;
        background: transparent;
        flex: 0 0 auto;
        outline: 1px solid #333;
        border-radius: var(--s-sm);

        &.delete svg {
          fill: #f88;
        }

        svg {
          width: 20px;
          height: 20px;
          display: block;
          fill: #fff;
          flex: 0 0 auto;
        }

        svg {
          opacity: 0.6;
        }

        &:hover {
          svg {
            opacity: 0.8;
          }
        }
      }
    }
  }
</style>
