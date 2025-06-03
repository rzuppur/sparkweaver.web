<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import BluetoothLink from "./lib/BluetoothLink.svelte";
  import NodeCanvas from "./lib/NodeCanvas.svelte";
  import NodeEdit from "./lib/NodeEdit.svelte";
  import { store } from "./lib/store";
  import TreeDebug from "./lib/TreeDebug.svelte";
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

  type ToolbarTab = "nodes" | "simulation" | "bluetooth" | "debug";
  let toolbarTab = $state<ToolbarTab | undefined>(undefined);
  $effect(() => {
    if (toolbarTab) localStorage.setItem("SW_APP_TAB", toolbarTab);
  });
  onMount(() => {
    const savedTab = localStorage.getItem("SW_APP_TAB");
    if (savedTab) toolbarTab = savedTab as ToolbarTab;
  });
</script>

<main>
  <div class="area-span-row">
    <NodeCanvas></NodeCanvas>
  </div>
  <div class="area-toolbar">
    <button type="button" aria-label="Edit node tree" title="Edit nodes" class:active={toolbarTab === "nodes" || toolbarTab === undefined} onclick={() => toolbarTab = "nodes"}>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
        <path d="M280-80q-50 0-85-35t-35-85q0-39 22.5-70t57.5-43v-334q-35-12-57.5-43T160-760q0-50 35-85t85-35q50 0 85 35t35 85q0 39-22.5 70T320-647v7q0 50 35 85t85 35h80q83 0 141.5 58.5T720-320v7q35 12 57.5 43t22.5 70q0 50-35 85t-85 35q-50 0-85-35t-35-85q0-39 22.5-70t57.5-43v-7q0-50-35-85t-85-35h-80q-34 0-64.5-10.5T320-480v167q35 12 57.5 43t22.5 70q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T320-200q0-17-11.5-28.5T280-240q-17 0-28.5 11.5T240-200q0 17 11.5 28.5T280-160Zm400 0q17 0 28.5-11.5T720-200q0-17-11.5-28.5T680-240q-17 0-28.5 11.5T640-200q0 17 11.5 28.5T680-160ZM280-720q17 0 28.5-11.5T320-760q0-17-11.5-28.5T280-800q-17 0-28.5 11.5T240-760q0 17 11.5 28.5T280-720Z"/>
      </svg>
      <span class="label">Edit</span>
    </button>
    <button type="button" aria-label="Run DMX simulation" title="Simulation" class:active={toolbarTab === "simulation"} onclick={() => toolbarTab = "simulation"}>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
        <path d="M440-80v-120h80v120h-80ZM80-440v-80h120v80H80Zm680 0v-80h120v80H760Zm-40 276-84-84 56-56 84 84-56 56Zm-480 0-56-56 84-84 56 56-84 84Zm240-116q-83 0-141.5-58.5T280-480q0-48 21.5-89.5T360-640v-200h240v200q37 29 58.5 70.5T680-480q0 83-58.5 141.5T480-280Zm-40-396q10-2 20-3t20-1q10 0 20 1t20 3v-84h-80v84Zm40 316q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm0-120Z"/>
      </svg>
      <span class="label">Sim</span>
    </button>
    <button type="button" aria-label="Bluetooth link" title="Bluetooth link" class:active={toolbarTab === "bluetooth"} onclick={() => toolbarTab = "bluetooth"}>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
        <path d="M440-80v-304L256-200l-56-56 224-224-224-224 56-56 184 184v-304h40l228 228-172 172 172 172L480-80h-40Zm80-496 76-76-76-74v150Zm0 342 76-74-76-76v150Z"/>
      </svg>
      <span class="label">Link</span>
    </button>
    <button type="button" aria-label="Show debug data" title="Debug" class:active={toolbarTab === "debug"} onclick={() => toolbarTab = "debug"}>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
        <path d="m384-336 56-58-86-86 86-86-56-58-144 144 144 144Zm192 0 144-144-144-144-56 58 86 86-86 86 56 58ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm280-590q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM200-200v-560 560Z"/>
      </svg>
      <span class="label">Debug</span>
    </button>
  </div>
  <div class="area-regular">
    {#if toolbarTab === "nodes" || toolbarTab === undefined}
      <NodeEdit></NodeEdit>
    {:else if toolbarTab === "simulation"}
      <TreeSimulation></TreeSimulation>
    {:else if toolbarTab === "bluetooth"}
      <BluetoothLink></BluetoothLink>
    {:else if toolbarTab === "debug"}
      <TreeDebug></TreeDebug>
    {/if}
  </div>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 52px 1fr;
    grid-template-rows: 1fr 260px;
    height: 100dvh;
    background: #333;
    gap: 2px;

    & > .area-span-row,
    & > .area-regular,
    & > .area-toolbar {
      background: #111;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
    }

    & > .area-regular {
      overflow-y: auto;
    }

    & > .area-span-row {
      grid-column: span 2;
    }

    & > .area-toolbar {
      button {
        width: 52px;
        height: 52px;
        display: block;

        &:not(.active):not(:hover) {
          background: transparent;
        }

        &.active {
          box-shadow: inset -4px 0 #ca8;

          svg {
            fill: #fca;
          }
        }

        svg {
          margin: 0 auto;
          fill: #aaa;
        }

        .label {
          display: block;
          opacity: 0.6;
          margin-top: 2px;
          font-size: 0.9em;
        }
      }
    }
  }
</style>
