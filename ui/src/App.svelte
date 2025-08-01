<script lang="ts">
  import RouteProject from "$lib/routes/RouteProject.svelte";
  import RouteProjects from "$lib/routes/RouteProjects.svelte";
  import RouteRemote from "$lib/routes/RouteRemote.svelte";
  import { currentRoute, projectService, routerService } from "$lib/services";
</script>

<div class="content">
  <div class="toolbar">
    <button type="button" onclick={() => routerService.navigate({ path: "projects" })} class="toolbar-button" class:active={$currentRoute.path === "projects" || $currentRoute.path === "project"}>
      <span class="toolbar-label">Projects</span>
    </button>
    <button type="button" onclick={() => routerService.navigate({ path: "remote" })} class="toolbar-button" class:active={$currentRoute.path === "remote"}>
      <span class="toolbar-label">Remote</span>
    </button>
    <div style="flex: 1 1 auto;"></div>
    <button type="button" onclick={() => projectService.newProject()} class="toolbar-button">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
        <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
      </svg>
      <span class="toolbar-label">New project</span>
    </button>
  </div>
  {#if $currentRoute.path === "project"}
    <RouteProject></RouteProject>
  {:else if $currentRoute.path === "projects"}
    <RouteProjects></RouteProjects>
  {:else if $currentRoute.path === "remote"}
    <RouteRemote></RouteRemote>
  {/if}
</div>


<style>
  .content {
    height: 100dvh;
    display: grid;
    grid-template-rows: 40px 1fr;
    gap: 2px;
    background: #333;
  }

  .toolbar {
    background: #111;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    height: 100%;
    overflow-x: auto;
    padding: 0 var(--s-md);
    gap: var(--s-md);
    display: flex;
    align-items: center;

    & > :global(*) {
      flex: 0 0 auto;
    }

    .toolbar-label {
      font-family: monospace;
      white-space: nowrap;
      text-transform: uppercase;
      font-size: 13px;
      opacity: 0.4;
      letter-spacing: 0.1em;
    }

    .toolbar-button {
      height: 100%;
      display: flex;
      align-items: center;
      gap: var(--s-xsp);
      justify-content: center;
      background: transparent;

      svg {
        width: 20px;
        height: 20px;
        display: block;
        fill: #fff;
        flex: 0 0 auto;
      }

      .toolbar-label,
      svg {
        opacity: 0.6;
      }

      &:hover {
        .toolbar-label,
        svg {
          opacity: 0.8;
        }
      }

      &.active {
        box-shadow: inset 0 -3px oklch(0.6 0.1 60);

        .toolbar-label {
          opacity: 0.8;
          font-weight: 700;
          color: oklch(0.8 0.1 60);
        }
      }
    }
  }
</style>
