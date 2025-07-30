<script lang="ts">
  import SimulationLight from "$lib/components/SimulationLight.svelte";
  import { coreReady, coreService, coreSimulationDmxData, coreSimulationOutputs, coreSimulationState, coreSimulationTick, editorTree } from "$lib/services";
  import { CoreSimulationState } from "$lib/services/coreService";
  import { onMount } from "svelte";

  let autoRun = $state(true);
  let updateTimer: number | undefined = undefined;

  function toggleAutoRun(): void {
    if (autoRun) {
      coreService.stopSimulation();
      autoRun = false;
    } else {
      coreService.buildTree($editorTree);
      coreService.runSimulation();
      autoRun = true;
    }
  }

  onMount(() => {
    const treeUnSub = editorTree.subscribe(() => {
      if (autoRun) {
        if (updateTimer !== undefined) return;
        updateTimer = window.setTimeout(() => {
          coreService.buildTree($editorTree);
          coreService.runSimulation();
          updateTimer = undefined;
          autoRun = true;
        }, 100);
      }
    });
    const stateUnSub = coreSimulationState.subscribe((state) => {
      if (state !== CoreSimulationState.RUNNING) {
        autoRun = false;
      }
    });
    return () => {
      treeUnSub();
      stateUnSub();
    };
  });
</script>

<div class="project-toolbar">
  {#if $coreReady}
    <div class="toolbar-buttons">
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button type="button" onclick={toggleAutoRun} title="Autorun">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill={autoRun ? "#3a6" : "#888"}>
          <path d="M380-300v-360l280 180-280 180ZM480-40q-108 0-202.5-49.5T120-228v108H40v-240h240v80h-98q51 75 129.5 117.5T480-120q115 0 208.5-66T820-361l78 18q-45 136-160 219.5T480-40ZM42-520q7-67 32-128.5T143-762l57 57q-32 41-52 87.5T123-520H42Zm214-241-57-57q53-44 114-69.5T440-918v80q-51 5-97 25t-87 52Zm449 0q-41-32-87.5-52T520-838v-80q67 6 128.5 31T762-818l-57 57Zm133 241q-5-51-25-97.5T761-705l57-57q44 52 69 113.5T918-520h-80Z"/>
        </svg>
      </button>
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button type="button" onclick={() => coreService.buildTree($editorTree)} title="Build">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill={$coreSimulationState === CoreSimulationState.ERROR ? "#f52" : "#888"}>
          <path d="M686-132 444-376q-20 8-40.5 12t-43.5 4q-100 0-170-70t-70-170q0-36 10-68.5t28-61.5l146 146 72-72-146-146q29-18 61.5-28t68.5-10q100 0 170 70t70 170q0 23-4 43.5T584-516l244 242q12 12 12 29t-12 29l-84 84q-12 12-29 12t-29-12Z"/>
        </svg>
      </button>
      {#if $coreSimulationState === CoreSimulationState.PAUSED}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button type="button" onclick={() => coreService.runSimulation()} title="Run">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#888">
            <path d="M320-200v-560l440 280-440 280Z"/>
          </svg>
        </button>
      {:else if $coreSimulationState === CoreSimulationState.RUNNING}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button type="button" onclick={() => coreService.stopSimulation()} title="Pause">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#fa8">
            <path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/>
          </svg>
        </button>
      {:else}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button type="button" disabled>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#888">
            <path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/>
          </svg>
        </button>
      {/if}
      {#if $coreSimulationState === CoreSimulationState.PAUSED}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button type="button" onclick={() => coreService.stepSimulation()} title="Step">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#aaf">
            <path d="M760-360q-51 0-85.5-34.5T640-480q0-51 34.5-85.5T760-600q51 0 85.5 34.5T880-480q0 51-34.5 85.5T760-360Zm-400 80-56-57 103-103H80v-80h327L304-624l56-56 200 200-200 200Z"/>
          </svg>
        </button>
      {:else}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button type="button" disabled>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#888">
            <path d="M760-360q-51 0-85.5-34.5T640-480q0-51 34.5-85.5T760-600q51 0 85.5 34.5T880-480q0 51-34.5 85.5T760-360Zm-400 80-56-57 103-103H80v-80h327L304-624l56-56 200 200-200 200Z"/>
          </svg>
        </button>
      {/if}
    </div>
    <div style="flex: 1 1 auto;"></div>
    {#if $coreSimulationOutputs.length}
      <div class="tick-counter">
        <div class="toolbar-label">{$coreSimulationTick}</div>
      </div>
      <div></div>
    {/if}
    {#each $coreSimulationOutputs as output, i (i)}
      <SimulationLight dmxData={$coreSimulationDmxData} output={output} size={12}></SimulationLight>
    {/each}
  {/if}
</div>

<style>
  .project-toolbar {
    height: 100%;
    overflow-x: auto;
    padding: 0 var(--s-md);
    gap: var(--s-sm);
    display: flex;
    align-items: center;

    & > :global(*) {
      flex: 0 0 auto;
    }

    .tick-counter {
      padding: var(--s-xs) var(--s-xsp);
      background: #060606;
      border-radius: var(--s-xs);
    }

    .toolbar-label {
      font-family: monospace;
      white-space: nowrap;
      text-transform: uppercase;
      font-size: 13px;
      opacity: 0.4;
      letter-spacing: 0.1em;
    }

    .toolbar-buttons {
      flex: 0 0 auto;
      display: flex;
    }

    button {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;

      svg {
        width: 20px;
        height: 20px;
        display: block;
        flex: 0 0 auto;
      }
    }
  }
</style>