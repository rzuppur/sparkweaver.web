<script lang="ts">
  import { store } from "$lib/store";

  function addNode(nodeType: string): void {
    store.createNode(nodeType);
  }

  const sourceTypes = $derived($store.nodeTypes.filter(n => n.name.startsWith("Sr")).sort((a, b) => a.title.localeCompare(b.title)));
  const triggerTypes = $derived($store.nodeTypes.filter(n => n.name.startsWith("Tr")).sort((a, b) => a.title.localeCompare(b.title)));
  const effectTypes = $derived($store.nodeTypes.filter(n => n.name.startsWith("Fx")).sort((a, b) => a.title.localeCompare(b.title)));
  const mixTypes = $derived($store.nodeTypes.filter(n => n.name.startsWith("Mx")).sort((a, b) => a.title.localeCompare(b.title)));
  const destinationTypes = $derived($store.nodeTypes.filter(n => n.name.startsWith("Ds")).sort((a, b) => a.title.localeCompare(b.title)));
</script>

<div class="toolbar">
  {#each sourceTypes as nodeType (nodeType.name)}
    <button type="button" onclick={() => addNode(nodeType.name)}>✛ {nodeType.title}</button>
  {/each}
  <div class="separator"></div>
  {#each triggerTypes as nodeType (nodeType.name)}
    <button type="button" onclick={() => addNode(nodeType.name)}>✛ {nodeType.title}</button>
  {/each}
  <div class="separator"></div>
  {#each effectTypes as nodeType (nodeType.name)}
    <button type="button" onclick={() => addNode(nodeType.name)}>✛ {nodeType.title}</button>
  {/each}
  <div class="separator"></div>
  {#each mixTypes as nodeType (nodeType.name)}
    <button type="button" onclick={() => addNode(nodeType.name)}>✛ {nodeType.title}</button>
  {/each}
  <div class="separator"></div>
  {#each destinationTypes as nodeType (nodeType.name)}
    <button type="button" onclick={() => addNode(nodeType.name)}>✛ {nodeType.title}</button>
  {/each}
</div>

<style>
  .toolbar {
    padding: 0 var(--s-md);

    button {
      padding: var(--s-smp);
      min-width: var(--s-xl);
      flex: 0 0 auto;
      background: transparent;
      color: #bbb;

      &:hover {
        background: #222;
      }
    }

    .separator {
      display: block;
      height: 2px;
      background: #222;
    }
  }
</style>
