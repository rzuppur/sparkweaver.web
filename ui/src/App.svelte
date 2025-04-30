<script lang="ts">
  import { onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import NodeCanvas from "./lib/NodeCanvas.svelte";
  import NodeEdit from "./lib/NodeEdit.svelte";
  import NodeToolbar from "./lib/NodeToolbar.svelte";
  import { store } from "./lib/store";
  import TreeSimulation from "./lib/TreeSimulation.svelte";

  let treeString = $state(localStorage.getItem("tree"));

  let storeUnsubscribe: Unsubscriber;
  storeUnsubscribe = store.subscribe((s) => {
    if (!treeString) {
      setTimeout(() => storeUnsubscribe(), 0);
    } else if (s.wasm) {
      try {
        store.fromTreeString(treeString);
      } catch (e) {
        console.warn("Failed to load from localstorage", e, treeString);
      } finally {
        treeString = null;
        setTimeout(() => storeUnsubscribe(), 0);
      }
    }
  });

  onDestroy(() => {
    storeUnsubscribe();
  });

  store.treeString.subscribe(treeString => {
    if (treeString) localStorage.setItem("tree", treeString);
  });
</script>

<main>
  <div class="area-span-row">
    <NodeCanvas></NodeCanvas>
  </div>
  <div class="area-span-row">
    <NodeToolbar></NodeToolbar>
  </div>
  <div class="area-regular">
    <NodeEdit></NodeEdit>
  </div>
  <div class="area-regular">
    <TreeSimulation></TreeSimulation>
  </div>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: minmax(0, min(350px, 50%)) 1fr;
    grid-template-rows: 3fr auto 190px;
    height: 100dvh;
    background: #333;
    gap: 2px;

    & > .area-span-row,
    & > .area-regular {
      background: #111;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
    }

    & > .area-span-row {
      grid-column: span 2;
    }
  }
</style>
