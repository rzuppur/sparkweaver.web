<script lang="ts">
  import BluetoothLink from "$lib/components/BluetoothLink.svelte";
  import EditorCanvas from "$lib/components/EditorCanvas.svelte";
  import EditorParams from "$lib/components/EditorParams.svelte";
  import GlobalNavigation from "$lib/components/GlobalNavigation.svelte";
  import NodeTreeDebug from "$lib/components/NodeTreeDebug.svelte";
  import ProjectToolbar from "$lib/components/ProjectToolbar.svelte";
  import SimulationToolbar from "$lib/components/SimulationToolbar.svelte";
  import { uiTab } from "$lib/services";
</script>

<main>
  <div class="area-span-row">
    <ProjectToolbar></ProjectToolbar>
  </div>
  <div class="area-span-row">
    <SimulationToolbar></SimulationToolbar>
  </div>
  <div class="area-span-row">
    <EditorCanvas></EditorCanvas>
  </div>
  <div class="area-toolbar">
    <GlobalNavigation></GlobalNavigation>
  </div>
  <div class="area-regular">
    {#if $uiTab === "nodes"}
      <EditorParams></EditorParams>
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
    grid-template-rows: 64px 48px 1fr 192px;
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