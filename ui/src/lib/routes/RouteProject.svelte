<script lang="ts">
  import BluetoothToolbar from "$lib/components/BluetoothToolbar.svelte";
  import DebugToolbar from "$lib/components/DebugToolbar.svelte";
  import EditorCanvas from "$lib/components/EditorCanvas.svelte";
  import ProjectToolbar from "$lib/components/ProjectToolbar.svelte";
  import SimulationToolbar from "$lib/components/SimulationToolbar.svelte";
  import { uiToolbarsVisible } from "$lib/services";
</script>

<main>
  <div class="toolbar-l">
    <ProjectToolbar></ProjectToolbar>
  </div>
  <div class="main">
    {#if $uiToolbarsVisible.has("bluetooth")}
      <div class="toolbar-m">
        <BluetoothToolbar></BluetoothToolbar>
      </div>
    {/if}
    {#if $uiToolbarsVisible.has("simulation")}
      <div class="toolbar-m">
        <SimulationToolbar></SimulationToolbar>
      </div>
    {/if}
    <div class="canvas">
      <EditorCanvas></EditorCanvas>
    </div>
    {#if $uiToolbarsVisible.has("debug")}
      <div class="toolbar-xl">
        <DebugToolbar></DebugToolbar>
      </div>
    {/if}
  </div>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    height: 100dvh;
    background: #333;
    gap: 2px;

    & > div {
      background: #111;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
    }

    .toolbar-l {
      height: 64px;
      grid-column: 1 / -1;
    }

    .main {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #333;
      gap: 2px;

      & > div {
        min-width: 0;
        min-height: 0;
        background: #111;
      }

      .toolbar-m {
        height: 48px;
        flex: 0 0 auto;
      }

      .canvas {
        flex: 1 1 1px;
      }

      .toolbar-xl {
        max-height: 160px;
        grid-column: 1 / -1;
        flex: 1 1 1px;
      }
    }
  }
</style>