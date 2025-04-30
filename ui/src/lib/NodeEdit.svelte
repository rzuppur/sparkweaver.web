<script lang="ts">
  import { store } from "./store";

  const nodeType = $derived($store.nodeTypes.find(nt => nt.name === $store.editing?.name));

  function duplicateNode(): void {
    if ($store.editing) {
      store.addNode($store.editing.clone());
    }
  }

  function deleteNode(): void {
    if ($store.editing) {
      store.removeNode($store.editing);
    }
  }
</script>

<div class="node-edit">
  {#if $store.editing}
    <div class="header">
      <div class="node-name">{nodeType?.title}</div>
      <button type="button" onclick={duplicateNode}>Duplicate</button>
    </div>
    {#each $store.editing.params as param, p_i (p_i)}
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
    </div>
  {:else}
    <div>Select a node to edit parameters</div>
  {/if}
</div>

<style>
  .node-edit {
    display: flex;
    flex-direction: column;
    gap: var(--s-md);
    padding: var(--s-md);
    overflow-y: auto;
    height: 100%;

    .header,
    .bottom-toolbar {
      button {
        flex: 0 0 auto;
        padding: 0 var(--s-md);
        height: var(--s-lg);
        font-size: 13px;
        border: none;
        cursor: pointer;
        color: #fff;
        background: #222;

        &:hover {
          background: #333;
        }
      }
    }

    .header {
      display: flex;
      align-items: center;
      gap: var(--s-md);

      .node-name {
        font-size: 24px;
        line-height: 1.2;
        white-space: nowrap;
        letter-spacing: -0.04em;
        flex: 1 1 auto;
      }
    }

    .bottom-toolbar {
      padding: var(--s-md) 0;

      button {
        color: #f88;
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
