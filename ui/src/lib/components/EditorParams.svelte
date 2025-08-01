<script lang="ts">
  import { editorSelected, editorService } from "$lib/services";
  import { onDestroy } from "svelte";

  function duplicateNode(): void {
    setTimeout(() => {
      if ($editorSelected) {
        editorService.addNode($editorSelected.clone());
      }
    }, 0); // Firefox sometimes sends double click events without the delay
  }

  function deleteNode(): void {
    setTimeout(() => {
      if ($editorSelected) {
        editorService.removeNode($editorSelected);
      }
    }, 0); // Firefox sometimes sends double click events without the delay
  }

  function moveUp(): void {
    setTimeout(() => {
      if ($editorSelected) {
        editorService.reorderNode($editorSelected, -1);
      }
    }, 0); // Firefox sometimes sends double click events without the delay
  }

  function moveDown(): void {
    setTimeout(() => {
      if ($editorSelected) {
        editorService.reorderNode($editorSelected, 1);
      }
    }, 0); // Firefox sometimes sends double click events without the delay
  }

  // Restore parameter real numerical value when node editor closed
  onDestroy(() => {
    if (!$editorSelected) return;
    for (const param of $editorSelected.params) {
      param.valueBind = param.value;
    }
  });
</script>

{#if $editorSelected}
  <div class="node-params">
    <input
      type="text"
      placeholder="Label"
      bind:value={$editorSelected.label}
      maxlength="80"
    >
    {#each $editorSelected.params as param, p_i (p_i)}
      <div class="param">
        <div class="param-name">{param.name}</div>
        <div class="param-value">
          <input
            type="range"
            bind:value={param.value}
            min={param.min}
            max={param.max}
            step="1"
          />
          <input
            type="number"
            bind:value={param.valueBind}
            min={param.min}
            max={param.max}
            step="1"
          />
        </div>
      </div>
    {/each}
    <div class="bottom-toolbar">
      <!--svelte-ignore a11y_consider_explicit_label-->
      <button type="button" class="project-button delete" title="Delete" onclick={deleteNode}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
          <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
        </svg>
      </button>
      <!--svelte-ignore a11y_consider_explicit_label-->
      <button type="button" class="project-button" title="Duplicate" onclick={duplicateNode}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
          <path d="M320-80q-33 0-56.5-23.5T240-160v-80h-80q-33 0-56.5-23.5T80-320v-80h80v80h80v-320q0-33 23.5-56.5T320-720h320v-80h-80v-80h80q33 0 56.5 23.5T720-800v80h80q33 0 56.5 23.5T880-640v480q0 33-23.5 56.5T800-80H320Zm0-80h480v-480H320v480ZM80-480v-160h80v160H80Zm0-240v-80q0-33 23.5-56.5T160-880h80v80h-80v80H80Zm240-80v-80h160v80H320Zm0 640v-480 480Z"/>
        </svg>
      </button>
      <!--svelte-ignore a11y_consider_explicit_label-->
      <button type="button" class="project-button" title="Move up" onclick={moveUp}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
          <path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z"/>
        </svg>
      </button>
      <!--svelte-ignore a11y_consider_explicit_label-->
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

    .param {
      display: flex;
      flex-direction: column;
      gap: var(--s-xsp);

      .param-name {
        font-size: 11px;
        opacity: 0.6;
        line-height: 1;
        letter-spacing: 0.01em;
        min-width: 0;
        display: block;
        white-space: nowrap;
        flex: 0 0 auto;
        margin-bottom: -3px;
      }

      .param-value {
        display: grid;
        gap: var(--s-md);
        grid-template-columns: 1fr 58px;

        input {
          min-width: 0;
          width: 100%;
          display: block;
        }
      }
    }
  }
</style>
