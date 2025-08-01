<script lang="ts">
  import { editorTree, projectCurrent } from "$lib/services";

  const treeBytes = $derived($editorTree.get());
</script>

<div class="debug-toolbar">
  <div class="info">{$editorTree.length} bytes &middot; v{treeBytes[0].toString()}</div>
  <div class="hex">
    {#each treeBytes as byte, i (i)}
      <div class="byte">{byte.toString(16).padStart(2, "0")}</div>
    {/each}
  </div>

  {#if $projectCurrent}
    <div class="labels">{JSON.stringify($projectCurrent.labels)}</div>
  {/if}
</div>

<style>
  .debug-toolbar {
    height: 100%;
    overflow-x: auto;
    padding: var(--s-md);

    .info {
      font-family: monospace;
      white-space: nowrap;
      text-transform: uppercase;
      font-size: 13px;
      opacity: 0.4;
      letter-spacing: 0.1em;
    }

    .hex {
      font-family: monospace;
      background: #222;
      color: #bbb;
      padding: var(--s-sm);
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-sm);
      margin-top: var(--s-sm);

      & > * {
        flex: 0 0 auto;
      }
    }

    .labels {
      font-family: monospace;
      background: #222;
      color: #bbb;
      padding: var(--s-sm);
      margin-top: var(--s-md);
    }
  }
</style>