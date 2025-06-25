<script lang="ts">
  import { editorService, editorTreeString } from "$lib/services/editorService";
  import { uiService } from "$lib/services/uiService";

  async function copyTree(): Promise<void> {
    try {
      await navigator.clipboard.writeText($editorTreeString);
      uiService.alertInfo("Project copied to clipboard");
    } catch {
      uiService.alertError("Failed to copy project to clipboard");
    }
  }

  async function pasteTree(): Promise<void> {
    const text = await navigator.clipboard.readText();
    try {
      editorService.loadTree(text);
    } catch (e) {
      uiService.alertError(`${e}`);
    }
  }
</script>

<div class="project-toolbar">
  <div class="project-name">New project</div>
  <div style="flex: 1 1 auto;"></div>
  <div class="toolbar-label">Project</div>
  <button type="button" onclick={copyTree}>
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960">
      <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/>
    </svg>
    <span class="toolbar-label">Copy</span>
  </button>
  <button type="button" onclick={pasteTree}>
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960">
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560h-80v120H280v-120h-80v560Zm280-560q17 0 28.5-11.5T520-800q0-17-11.5-28.5T480-840q-17 0-28.5 11.5T440-800q0 17 11.5 28.5T480-760Z"/>
    </svg>
    <span class="toolbar-label">Paste</span>
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

    .project-name {
      white-space: nowrap;
      font-size: 19px;
      font-weight: 700;
      opacity: 0.8;
      letter-spacing: -0.02em;
    }

    .toolbar-label {
      font-family: monospace;
      white-space: nowrap;
      text-transform: uppercase;
      font-size: 13px;
      opacity: 0.3;
      letter-spacing: 0.1em;
    }

    button {
      height: 32px;
      display: flex;
      align-items: center;
      gap: var(--s-xsp);
      justify-content: center;
      background: transparent;

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
        width: 16px;
        height: 16px;
        display: block;
        fill: #fff;
      }
    }
  }
</style>