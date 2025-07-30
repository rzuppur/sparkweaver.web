<script lang="ts">
  import { editorSelected, editorService } from "$lib/services";

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
</script>

{#if $editorSelected}
  <div class="node-params">
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
            bind:value={param.value}
            min={param.min}
            max={param.max}
            step="1"
          />
        </div>
      </div>
    {/each}
    <div class="bottom-toolbar">
      <button type="button" onclick={deleteNode}>Delete</button>
      <button type="button" onclick={duplicateNode}>Duplicate</button>
    </div>
  </div>
{/if}

<style>
  .node-params {
    display: flex;
    flex-direction: column;
    gap: var(--s-sm);

    .bottom-toolbar {
      padding: var(--s-md) 0 var(--s-sm);

      button {
        flex: 0 0 auto;
        padding: 0 var(--s-md);
        height: 24px;

        &:first-child {
          color: #f88;
        }
      }
    }

    .param {
      display: flex;
      flex-direction: column;
      gap: var(--s-xsp);

      .param-name {
        font-family: monospace;
        font-size: 13px;
        color: #bbb;
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
