<script lang="ts">
  import { editorTree } from "$lib/services";

  const treeBytes = $derived($editorTree.get());
</script>

<div class="debug-toolbar">
  <div class="info">{$editorTree.length} bytes</div>
  <div class="hex">
    {#each treeBytes as byte, i (i)}
      <div class="byte">{byte.toString(16).padStart(2, "0")}</div>
    {/each}
  </div>
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
      margin-bottom: var(--s-sm);
    }

    .hex {
      font-family: monospace;
      background: #222;
      color: #bbb;
      padding: var(--s-sm);
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-sm);

      & > * {
        flex: 0 0 auto;
      }
    }
  }
</style>