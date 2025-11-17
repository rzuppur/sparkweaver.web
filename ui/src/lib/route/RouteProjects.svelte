<script lang="ts">
  import { routeBus } from "$lib/bus/route.bus";
  import type { Project } from "$lib/model/project.model";
  import { projectsService } from "$lib/service/projects.service";
  import { uiService } from "$lib/service/ui.service";
  import { projectsStore } from "$lib/store/projects.store";
  import { dateRelative } from "$lib/util/date.util";

  function duplicateProject(project: Project): void {
    projectsService.duplicateProject(project);
  }

  async function deleteProject(project: Project): Promise<void> {
    if (await uiService.confirm(`Delete ${project.name}?`)) {
      projectsService.deleteProject(project);
    }
  }
</script>

<div class="projects">
  {#each $projectsStore as project (project.id)}
    <div class="project-container">
      <button type="button" class="project" onclick={() => { routeBus.navigate({ path: "project", params: { id: project.id } }); }}>
        <span class="name">{project.name}</span>
        <span class="description">Modified {dateRelative(project.modified)} </span>
        <span class="description">Created {dateRelative(project.created)}</span>
      </button>
      <div style="margin-left: var(--s-smp);">
        <button type="button" class="project-button" title="Duplicate" onclick={() => duplicateProject(project)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M320-80q-33 0-56.5-23.5T240-160v-80h-80q-33 0-56.5-23.5T80-320v-80h80v80h80v-320q0-33 23.5-56.5T320-720h320v-80h-80v-80h80q33 0 56.5 23.5T720-800v80h80q33 0 56.5 23.5T880-640v480q0 33-23.5 56.5T800-80H320Zm0-80h480v-480H320v480ZM80-480v-160h80v160H80Zm0-240v-80q0-33 23.5-56.5T160-880h80v80h-80v80H80Zm240-80v-80h160v80H320Zm0 640v-480 480Z"/>
          </svg>
        </button>
        <button type="button" class="project-button" title="Delete" onclick={() => deleteProject(project)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
          </svg>
        </button>
      </div>
    </div>
  {/each}
</div>

<style>
  .projects {
    background: #111;
    padding: var(--s-md);
    display: grid;
    grid-template-columns: 1fr minmax(0, 700px) auto 1fr;
    align-items: start;
    grid-template-rows: auto;
    align-content: start;
    row-gap: var(--s-md);
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;

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

    svg {
      opacity: 0.6;
    }

    &:hover {
      svg {
        opacity: 0.8;
      }
    }
  }
</style>
