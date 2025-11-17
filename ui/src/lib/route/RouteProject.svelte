<script lang="ts">
  import EditorCanvas from "$lib/component/canvas/EditorCanvas.svelte";
  import BluetoothToolbar from "$lib/component/toolbar/BluetoothToolbar.svelte";
  import DebugToolbar from "$lib/component/toolbar/DebugToolbar.svelte";
  import ProjectToolbar from "$lib/component/toolbar/ProjectToolbar.svelte";
  import SimulationToolbar from "$lib/component/toolbar/SimulationToolbar.svelte";
  import { uiToolbars } from "$lib/store/ui.store";
</script>

<div class="project">
  <div class="toolbar-l">
    <ProjectToolbar></ProjectToolbar>
  </div>
  <div class="main">
    {#if $uiToolbars.has("bluetooth")}
      <div class="toolbar-m">
        <BluetoothToolbar></BluetoothToolbar>
      </div>
    {/if}
    {#if $uiToolbars.has("simulation")}
      <div class="toolbar-m">
        <SimulationToolbar></SimulationToolbar>
      </div>
    {/if}
    <div class="editor-canvas">
      <EditorCanvas></EditorCanvas>
    </div>
    {#if $uiToolbars.has("debug")}
      <div class="toolbar-xl">
        <DebugToolbar></DebugToolbar>
      </div>
    {/if}
  </div>
</div>

<style>
  .project {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    height: 100%;
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

      .editor-canvas {
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
