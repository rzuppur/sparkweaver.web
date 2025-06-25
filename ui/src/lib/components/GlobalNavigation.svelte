<script lang="ts">
  import { uiService } from "$lib/services/uiService";

  const { tab } = uiService;
</script>

<div class="nav-buttons">
  <button type="button" title="Edit nodes" class:active={$tab === "nodes"} onclick={() => uiService.changeTab("nodes")}>
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
      <path d="M280-80q-50 0-85-35t-35-85q0-39 22.5-70t57.5-43v-334q-35-12-57.5-43T160-760q0-50 35-85t85-35q50 0 85 35t35 85q0 39-22.5 70T320-647v7q0 50 35 85t85 35h80q83 0 141.5 58.5T720-320v7q35 12 57.5 43t22.5 70q0 50-35 85t-85 35q-50 0-85-35t-35-85q0-39 22.5-70t57.5-43v-7q0-50-35-85t-85-35h-80q-34 0-64.5-10.5T320-480v167q35 12 57.5 43t22.5 70q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T320-200q0-17-11.5-28.5T280-240q-17 0-28.5 11.5T240-200q0 17 11.5 28.5T280-160Zm400 0q17 0 28.5-11.5T720-200q0-17-11.5-28.5T680-240q-17 0-28.5 11.5T640-200q0 17 11.5 28.5T680-160ZM280-720q17 0 28.5-11.5T320-760q0-17-11.5-28.5T280-800q-17 0-28.5 11.5T240-760q0 17 11.5 28.5T280-720Z"/>
    </svg>
    <span class="label">Edit</span>
  </button>
  <button type="button" title="Bluetooth link" class:active={$tab === "bluetooth"} onclick={() => uiService.changeTab("bluetooth")}>
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
      <path d="M440-80v-304L256-200l-56-56 224-224-224-224 56-56 184 184v-304h40l228 228-172 172 172 172L480-80h-40Zm80-496 76-76-76-74v150Zm0 342 76-74-76-76v150Z"/>
    </svg>
    <span class="label">Link</span>
  </button>
  <button type="button" title="Debug" class:active={$tab === "debug"} onclick={() => uiService.changeTab("debug")}>
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
      <path d="m384-336 56-58-86-86 86-86-56-58-144 144 144 144Zm192 0 144-144-144-144-56 58 86 86-86 86 56 58ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm280-590q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM200-200v-560 560Z"/>
    </svg>
    <span class="label">Debug</span>
  </button>
</div>

<style>
  .nav-buttons {
    button {
      width: 52px;
      height: 52px;
      display: block;

      &:not(.active):not(:hover) {
        background: transparent;
      }

      &.active {
        box-shadow: inset -4px 0 #ca8;

        svg {
          fill: #fca;
        }
      }

      svg {
        margin: 0 auto;
        fill: #aaa;
      }

      .label {
        display: block;
        opacity: 0.6;
        margin-top: 2px;
        font-size: 0.9em;
      }
    }
  }
</style>