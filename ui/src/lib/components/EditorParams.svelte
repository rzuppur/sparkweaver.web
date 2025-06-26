<script lang="ts">
  import EditorToolbar from "$lib/components/EditorToolbar.svelte";
  import { coreNodeTypes, editorEditing, editorService } from "$lib/services";

  const nodeType = $derived($coreNodeTypes.find(nt => nt.name === $editorEditing?.name));

  function duplicateNode(): void {
    if ($editorEditing) {
      editorService.addNode($editorEditing.clone());
    }
  }

  function deleteNode(): void {
    if ($editorEditing) {
      editorService.removeNode($editorEditing);
    }
  }
</script>

<div class="node-edit" class:editing={$editorEditing}>
  <div class="node-toolbar-area">
    <EditorToolbar></EditorToolbar>
  </div>
  <div class="node-edit-area">
    <div class="node-params">
      {#if $editorEditing}
        <div class="header">
          <div class="node-name">{nodeType?.title}</div>
          <button type="button" onclick={duplicateNode}>Duplicate</button>
        </div>
        {#each $editorEditing.params as param, p_i (p_i)}
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
  </div>
</div>

<style>
  .node-edit {
    @media (max-width: 999px) {
      &.editing .node-toolbar-area,
      &:not(.editing) .node-edit-area {
        display: none;
      }
    }

    @media (min-width: 1000px) {
      display: grid;
      grid-template-columns: 1fr 500px;
    }

    .node-toolbar-area,
    .node-edit-area {
      min-width: 0;
    }
  }

  .node-params {
    display: flex;
    flex-direction: column;
    gap: var(--s-sm);
    padding: var(--s-md);

    .header,
    .bottom-toolbar {
      button {
        flex: 0 0 auto;
        padding: 0 var(--s-md);
        height: var(--s-lg);
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
