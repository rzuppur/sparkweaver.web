<script lang="ts">
  import SimulationLight from "$lib/component/toolbar/SimulationLight.svelte";
  import { CoreState } from "$lib/model/core.model";
  import { coreService } from "$lib/service/core.service";
  import { coreReady, coreStore } from "$lib/store/core.store";

  const coreState = coreStore.state;
  const coreData = coreStore.data;
</script>

<div class="project-toolbar">
  {#if $coreReady}
    <div class="toolbar-buttons">
      <button type="button" onclick={() => coreService.buildTree()} title="Rebuild">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill={$coreState === CoreState.ERROR ? "#f52" : "#888"}>
          <path d="M686-132 444-376q-20 8-40.5 12t-43.5 4q-100 0-170-70t-70-170q0-36 10-68.5t28-61.5l146 146 72-72-146-146q29-18 61.5-28t68.5-10q100 0 170 70t70 170q0 23-4 43.5T584-516l244 242q12 12 12 29t-12 29l-84 84q-12 12-29 12t-29-12Z"/>
        </svg>
      </button>
      {#if $coreState === CoreState.PAUSED}
        <button type="button" onclick={() => coreService.runSimulation()} title="Run">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#6d6">
            <path d="M320-200v-560l440 280-440 280Z"/>
          </svg>
        </button>
      {:else if $coreState === CoreState.RUNNING}
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
      {#if $coreState === CoreState.PAUSED}
        <button type="button" onclick={() => coreService.stepSimulation()} title="Step">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#aaf">
            <path d="M760-360q-51 0-85.5-34.5T640-480q0-51 34.5-85.5T760-600q51 0 85.5 34.5T880-480q0 51-34.5 85.5T760-360Zm-400 80-56-57 103-103H80v-80h327L304-624l56-56 200 200-200 200Z"/>
          </svg>
        </button>
      {:else}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button type="button" disabled>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#444">
            <path d="M760-360q-51 0-85.5-34.5T640-480q0-51 34.5-85.5T760-600q51 0 85.5 34.5T880-480q0 51-34.5 85.5T760-360Zm-400 80-56-57 103-103H80v-80h327L304-624l56-56 200 200-200 200Z"/>
          </svg>
        </button>
      {/if}
      {#each $coreData.triggers as trigger, t_i (t_i)}
        <button type="button" onclick={() => coreService.triggerExternalTrigger(trigger)} style="width: auto; padding: 0 var(--s-sm);" title="External trigger">
          <span class="toolbar-label">
            {trigger.toFixed(0).padStart(3, "0")}
          </span>
        </button>
      {/each}
    </div>
    <div style="flex: 1 1 auto;"></div>
    {#if $coreData.outputs.length}
      <div class="tick-counter">
        <div class="toolbar-label">{$coreData.tick}</div>
      </div>
      <div></div>
    {/if}
    {#each $coreData.outputs as output, i (i)}
      <SimulationLight dmxData={$coreData.dmxData} output={output} size={12}></SimulationLight>
    {/each}
  {:else if $coreState === CoreState.ERROR}
    <div class="toolbar-label error">Core error</div>
  {:else if $coreState === CoreState.LOADING}
    <div class="toolbar-label">Loading&hellip;</div>
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

      &.error {
        color: #f99;
        opacity: 0.6;
      }
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

      .toolbar-label {
        opacity: 0.6;
      }
    }
  }
</style>