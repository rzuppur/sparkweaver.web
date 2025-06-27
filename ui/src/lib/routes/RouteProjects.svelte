<script lang="ts">
  import { projectService, projectsList, routerService } from "$lib/services";
  import { type Project } from "$lib/services/projectService";
  import { dateRelativeAutomatic } from "$lib/utils";

  function duplicateProject(project: Project): () => void {
    return () => {
      const id = projectService.newProject();
      projectService.setCurrentProjectName(`${project.name} (Copy)`);
      projectService.updateTree(project.tree);
      projectService.saveCurrentProject();
      projectService.loadProject(id);
    };
  }

  function deleteProject(project: Project): () => void {
    return () => {
      if (window.confirm(`Delete ${project.name}?`)) {
        projectService.deleteProject(project.id);
      }
    };
  }
</script>

<main>
  <div class="area-toolbar">
    <div class="toolbar">
      <div class="toolbar-label">Projects</div>
      <div style="flex: 1 1 auto;"></div>
      <button type="button" onclick={() => projectService.newProject()} class="toolbar-button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
          <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
        </svg>
        <span class="toolbar-label">New project</span>
      </button>
    </div>
  </div>
  <div class="area-regular projects">
    {#each $projectsList as project (project.id)}
      <div class="project-container">
        <button type="button" class="project" onclick={() => { projectService.loadProject(project.id); routerService.navigate({ path: "project", params: { id: project.id } }); }}>
          <span class="name">{project.name}</span>
          <span class="description">Modified {dateRelativeAutomatic(project.modified)} </span>
          <span class="description">Created {dateRelativeAutomatic(project.created)}</span>
        </button>
        <div style="margin-left: var(--s-smp);">
          <!--svelte-ignore a11y_consider_explicit_label-->
          <button type="button" class="project-button" title="Duplicate" onclick={duplicateProject(project)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
              <path d="M320-80q-33 0-56.5-23.5T240-160v-80h-80q-33 0-56.5-23.5T80-320v-80h80v80h80v-320q0-33 23.5-56.5T320-720h320v-80h-80v-80h80q33 0 56.5 23.5T720-800v80h80q33 0 56.5 23.5T880-640v480q0 33-23.5 56.5T800-80H320Zm0-80h480v-480H320v480ZM80-480v-160h80v160H80Zm0-240v-80q0-33 23.5-56.5T160-880h80v80h-80v80H80Zm240-80v-80h160v80H320Zm0 640v-480 480Z"/>
            </svg>
          </button>
          <!--svelte-ignore a11y_consider_explicit_label-->
          <button type="button" class="project-button" title="Delete" onclick={deleteProject(project)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
            </svg>
          </button>
        </div>
      </div>
    {/each}
  </div>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 1fr minmax(0, 700px) auto 1fr;
    grid-template-rows: 48px 1fr;
    height: 100dvh;
    background: #333;
    gap: 2px;

    & > .area-regular,
    & > .area-toolbar {
      background: #111;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
    }

    & > .area-regular {
      overflow-y: auto;
      grid-column: 1 / -1;
    }

    & > .area-toolbar {
      grid-column: 1 / -1;
    }
  }

  .toolbar {
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
  }

  .projects {
    padding: var(--s-md);
    display: grid;
    grid-template-columns: subgrid;
    align-items: start;
    grid-template-rows: auto;
    align-content: start;
    row-gap: var(--s-md);

    .project-container {
      grid-column: 2 / 4;
      display: grid;
      grid-template-columns: subgrid;
    }

    .project {
      padding: var(--s-md);
      background: #222;
      border-radius: var(--s-smp);
      min-width: 0;
      cursor: pointer;
      appearance: none;
      text-align: left;
      display: block;
      white-space: normal;

      &:hover {
        background: #333;
      }

      .name {
        font-size: 19px;
        line-height: 1.3;
        opacity: 0.8;
        letter-spacing: -0.01em;
        margin-top: -3px;
        min-width: 0;
        display: block;
        font-weight: 700;
      }

      .description {
        line-height: 1.2;
        margin-top: var(--s-xs);
        font-size: 13px;
        letter-spacing: 0.03em;
        min-width: 0;
        display: block;
        opacity: 0.6;

        &:last-child {
          opacity: 0.4;
        }
      }
    }
  }

  .toolbar-button,
  .project-button {
    height: 48px;
    min-width: 48px;
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
  }
</style>
