<script lang="ts">
  import { editorService, editorTree, projectCurrent, projectService, projectUnsaved, routerService, uiService, uiToolbarsVisible } from "$lib/services";
  import { Uint8Vector } from "$lib/utils";

  async function copyProject(): Promise<void> {
    try {
      await navigator.clipboard.writeText($editorTree.toString());
      uiService.alertInfo("Project copied to clipboard");
    } catch {
      uiService.alertError("Failed to copy project to clipboard");
    }
  }

  async function pasteProject(): Promise<void> {
    const text = await navigator.clipboard.readText();
    try {
      editorService.loadTree(Uint8Vector.fromString(text));
    } catch (e) {
      uiService.alertError(`${e}`);
    }
  }

  function toProjects(): void {
    routerService.navigate({ path: "projects" });
  }

  let nameInputEl: HTMLInputElement;
</script>

<div class="project-toolbar">
  {#if $projectCurrent}
    <div style="flex: 1 1 auto; display: flex; align-items: center; min-width: 0;">
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button type="button" onclick={toProjects}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
          <path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z"/>
        </svg>
      </button>
      {#if $projectUnsaved}
        <div style="font-size: 30px; color: #a73; margin-right: 4px;">*</div>
      {/if}
      <input
        bind:this={nameInputEl}
        type="text"
        class="project-name"
        value={$projectCurrent.name} onchange={() => projectService.setCurrentProjectName(nameInputEl.value)}
        required
        minlength="3"
        maxlength="80"
      >
    </div>
    <button type="button" onclick={() => projectService.saveCurrentProject()} disabled={!$projectUnsaved}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
        <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/>
      </svg>
      <span class="toolbar-label">Save</span>
    </button>
    <button type="button" onclick={() => projectService.restoreCurrentProject()} disabled={!$projectUnsaved}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
        <path d="M480-80q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-440h80q0 117 81.5 198.5T480-160q117 0 198.5-81.5T760-440q0-117-81.5-198.5T480-720h-6l62 62-56 58-160-160 160-160 56 58-62 62h6q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-440q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-80Z"/>
      </svg>
      <span class="toolbar-label">Restore</span>
    </button>
    <button type="button" onclick={copyProject}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
        <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/>
      </svg>
      <span class="toolbar-label">Copy</span>
    </button>
    <button type="button" onclick={pasteProject}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
        <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560h-80v120H280v-120h-80v560Zm280-560q17 0 28.5-11.5T520-800q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800q0 17 11.5 28.5T480-760Z"/>
      </svg>
      <span class="toolbar-label">Paste</span>
    </button>
  {/if}
  <div class="separator"></div>
  <!-- svelte-ignore a11y_consider_explicit_label -->
  <button type="button" onclick={() => uiService.setToolbar("bluetooth", !$uiToolbarsVisible.has("bluetooth"))} class="button-toggle" class:active={$uiToolbarsVisible.has("bluetooth")} title="Bluetooth toolbar">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
      <path d="M440-80v-304L256-200l-56-56 224-224-224-224 56-56 184 184v-304h40l228 228-172 172 172 172L480-80h-40Zm80-496 76-76-76-74v150Zm0 342 76-74-76-76v150Z"/>
    </svg>
  </button>
  <!-- svelte-ignore a11y_consider_explicit_label -->
  <button type="button" onclick={() => uiService.setToolbar("simulation", !$uiToolbarsVisible.has("simulation"))} class="button-toggle" class:active={$uiToolbarsVisible.has("simulation")} title="Simulation toolbar">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
      <path d="M206-206q-41-48-63.5-107.5T120-440q0-150 105-255t255-105h8l-64-64 56-56 160 160-160 160-57-57 63-63h-6q-116 0-198 82t-82 198q0 51 16.5 96t46.5 81l-57 57Zm234-14q0-23-15.5-45.5t-34.5-47q-19-24.5-34.5-51T340-420q0-58 41-99t99-41q58 0 99 41t41 99q0 30-15.5 56.5t-34.5 51q-19 24.5-34.5 47T520-220h-80Zm0 100v-60h80v60h-80Zm314-86-57-57q30-36 46.5-81t16.5-96q0-66-27.5-122.5T657-657l57-57q58 50 92 120.5T840-440q0 67-22.5 126.5T754-206Z"/>
    </svg>
  </button>
</div>

<style>
  .project-toolbar {
    height: 100%;
    overflow-x: auto;
    padding: 0 var(--s-md);
    gap: var(--s-md);
    display: flex;
    align-items: center;

    & > :global(*) {
      flex: 0 0 auto;
    }

    input[type="text"] {
      width: 100%;
      background: transparent;
      border: none;
    }

    .project-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 0 1 auto;
      font-size: 24px;
      opacity: 0.8;
      letter-spacing: -0.02em;
      margin-top: -2px;
    }

    .toolbar-label {
      font-family: monospace;
      white-space: nowrap;
      text-transform: uppercase;
      font-size: 13px;
      opacity: 0.4;
      letter-spacing: 0.1em;
    }

    .separator {
      height: 24px;
      width: 2px;
      background: #fff2;
    }

    button {
      min-width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      gap: var(--s-xsp);
      justify-content: center;
      background: transparent;
      border-radius: var(--s-sm);

      &.button-toggle {
        &.active {
          background: #fff1;

          svg {
            fill: #fca;
          }
        }
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

      svg {
        width: 20px;
        height: 20px;
        display: block;
        fill: #fff;
        flex: 0 0 auto;
      }
    }
  }

  @media (max-width: 600px) {
    .project-toolbar {
      gap: var(--s-sm);

      button .toolbar-label {
        display: none;
      }
    }
  }
</style>