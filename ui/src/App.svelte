<script lang="ts">
  import BluetoothLink from "$lib/components/BluetoothLink.svelte";
  import CoreSimulationToolbar from "$lib/components/CoreSimulationToolbar.svelte";
  import Editor from "$lib/components/EditorParams.svelte";
  import NodeTreeDebug from "$lib/components/NodeTreeDebug.svelte";
  import Canvas from "$lib/components/EditorCanvas.svelte";
  import GlobalNavigation from "$lib/components/GlobalNavigation.svelte";
  import StorageToolbar from "$lib/components/ProjectToolbar.svelte";
  import { uiTab } from "$lib/services/uiService";
</script>

<main>
  <div class="area-span-row">
    <StorageToolbar></StorageToolbar>
  </div>
  <div class="area-span-row">
    <CoreSimulationToolbar></CoreSimulationToolbar>
  </div>
  <div class="area-span-row">
    <Canvas></Canvas>
  </div>
  <div class="area-toolbar">
    <GlobalNavigation></GlobalNavigation>
  </div>
  <div class="area-regular">
    {#if $uiTab === "nodes"}
      <Editor></Editor>
    {:else if $uiTab === "bluetooth"}
      <BluetoothLink></BluetoothLink>
    {:else if $uiTab === "debug"}
      <NodeTreeDebug></NodeTreeDebug>
    {/if}
  </div>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 52px 1fr;
    grid-template-rows: 48px 48px 1fr 260px;
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
  }
</style>
