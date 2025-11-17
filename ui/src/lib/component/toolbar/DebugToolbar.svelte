<script lang="ts">
  import { coreStore } from "$lib/store/core.store";
  import { editorStore } from "$lib/store/editor.store";

  const project = editorStore.project;
  const dmxData = coreStore.data;

  const treeBytes = $derived($project?.tree.get() ?? []);
  const dmxBytes = $derived($dmxData.dmxData);
</script>

<div class="debug-toolbar">
  {#if $project}
    <div class="info">NODES ({$project.tree.length} bytes)</div>
    <div class="hex">
      {#each treeBytes as byte, i (i)}
        <div class="byte">{byte.toString(16).padStart(2, "0")}</div>
      {/each}
    </div>
    <div class="info">DMX data</div>
    <div class="hex">
      {#each dmxBytes as byte, i (i)}
        <div class="byte">{byte.toString(16).padStart(2, "0")}</div>
      {/each}
    </div>
    <div class="info">Node labels</div>
    <div class="labels">{JSON.stringify($project.labels)}</div>
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

      &:not(:first-child) {
        margin-top: var(--s-md);
      }
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
      margin-top: var(--s-sm);
    }
  }
</style>