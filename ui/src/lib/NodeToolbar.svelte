<script lang="ts">
  import { store } from "./store";

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
    display: flex;
    flex-direction: row;
    align-items: center;
    overflow-x: auto;

    .label {
      flex: 0 0 auto;
      margin-right: var(--s-sm);
      font-weight: bold;
    }

    button {
      padding: var(--s-smp);
      min-width: var(--s-xl);
      flex: 0 0 auto;
      border: none;
      background: transparent;
      color: #bbb;
      cursor: pointer;

      &:hover {
        background: #333;
      }
    }

    .separator {
      display: block;
      width: 2px;
      height: 20px;
      background: #444;
      margin: 0 var(--s-xs);
      flex: 0 0 auto;
    }
  }
</style>
