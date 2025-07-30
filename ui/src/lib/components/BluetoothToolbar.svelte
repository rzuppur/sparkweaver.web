<script lang="ts">
  import { bluetoothPwNeedsChanging, bluetoothService, bluetoothState, editorService, editorTree, uiService } from "$lib/services";
  import { BluetoothState, CHR_PW, CHR_TREE, readInChunks, writeInChunks } from "$lib/services/bluetoothService";
  import { Uint8Vector } from "$lib/utils";
  import { get } from "svelte/store";

  let newPw = $state("");

  async function changePw(): Promise<void> {
    const pw = Number.parseInt(newPw, 10);
    if (pw < 100000 || pw > 999999 || !Number.isInteger(pw)) {
      alert("Password must be 6 digits");
      return;
    }
    const success = await bluetoothService.request(async (service) => {
      const chrPw = await service.getCharacteristic(CHR_PW);
      const pwBytes = new Uint8Array(4);
      pwBytes[0] = pw & 0xFF;
      pwBytes[1] = (pw >> 8) & 0xFF;
      pwBytes[2] = (pw >> 16) & 0xFF;
      pwBytes[3] = (pw >> 24) & 0xFF;
      await chrPw.writeValueWithResponse(pwBytes);
      return true;
    });
    if (success) bluetoothService.reset();
  }

  async function loadFromDevice(): Promise<void> {
    let data: Uint8Array | undefined;
    await bluetoothService.request(async (service) => {
      data = await readInChunks(service, CHR_TREE);
    });
    if (data) {
      try {
        editorService.loadTree(new Uint8Vector([...data]));
      } catch (e) {
        uiService.alertError(`${e}`);
      }
    }
  }

  async function sendToDevice(): Promise<void> {
    await bluetoothService.request(async (service) => {
      const tree = get(editorTree);
      await writeInChunks(service, CHR_TREE, tree.get());
    });
  }
</script>

<div class="bluetooth-toolbar">
  {#if $bluetoothState >= BluetoothState.READY}
    <div class="buttons">
      {#if $bluetoothState === BluetoothState.READY}
        <button type="button" onclick={() => bluetoothService.connect()} disabled={$bluetoothState !== BluetoothState.READY}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M360-80v-304L176-200l-56-56 224-224-224-224 56-56 184 184v-304h40l228 228-172 172 172 172L400-80h-40Zm80-496 76-76-76-74v150Zm0 342 76-74-76-76v150Zm222-152-92-94 92-92q9 22 14.5 45t5.5 47q0 24-5.5 47.5T662-386Zm118 114-50-48q20-37 31-77.5t11-82.5q0-42-11-82.5T730-640l50-50q29 48 44.5 101T840-480q0 56-15.5 108.5T780-272Z"/>
          </svg>
          <span class="button-label">Connect</span>
        </button>
      {/if}
      {#if $bluetoothState >= BluetoothState.CONNECTED}
        <button type="button" onclick={sendToDevice} disabled={$bluetoothState === BluetoothState.COMMUNICATING}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
          </svg>
          <span class="button-label">Upload</span>
        </button>
        <button type="button" onclick={loadFromDevice} disabled={$bluetoothState === BluetoothState.COMMUNICATING}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
          </svg>
          <span class="button-label">Download</span>
        </button>
        <button type="button" onclick={() => bluetoothService.reset()} disabled={$bluetoothState === BluetoothState.COMMUNICATING}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
          </svg>
          <span class="button-label">Disconnect</span>
        </button>
      {/if}
    </div>
  {/if}
  <div class="text">
    {#if $bluetoothState === BluetoothState.UNAVAILABLE}
      Bluetooth not available. Please <a href="https://caniuse.com/web-bluetooth" target="_blank">check here</a> to get latest information about Web Bluetooth supported browsers.
    {/if}
    {#if $bluetoothState === BluetoothState.READY}
      Default password is 654321
    {/if}
    {#if $bluetoothState >= BluetoothState.CONNECTED && $bluetoothPwNeedsChanging === true}
      Please set a custom 6-digit password. 123456 can not be used.
    {/if}
  </div>
  {#if $bluetoothState >= BluetoothState.CONNECTED}
    <input bind:value={newPw} type="text" inputmode="numeric" minlength="6" maxlength="6" pattern="[0-9]{6}" autocomplete="off" placeholder="000000" required>
    <button type="button" onclick={changePw} disabled={$bluetoothState === BluetoothState.COMMUNICATING}>
      <span class="button-label">Set password</span>
    </button>
  {/if}
</div>

<style>
  .bluetooth-toolbar {
    height: 100%;
    overflow-x: auto;
    padding: 0 var(--s-md);
    gap: var(--s-md);
    display: flex;
    align-items: center;

    & > :global(*) {
      flex: 0 0 auto;
    }

    input {
      padding: 0 var(--s-sm);
      height: 24px;
      font-family: monospace;
      font-size: 13px;
      width: 9ch;
    }

    .buttons {
      display: flex;

      @media (max-width: 600px) {
        .button-label {
          display: none;
        }
      }
    }

    button {
      height: 48px;
      min-width: 48px;
      padding: 0 var(--s-xsp);
      display: flex;
      align-items: center;
      gap: var(--s-xsp);
      justify-content: center;
      background: transparent;

      .button-label,
      svg {
        opacity: 0.6;
      }

      &:hover {
        .button-label,
        svg {
          opacity: 0.8;
        }
      }

      .button-label {
        font-family: monospace;
        white-space: nowrap;
        text-transform: uppercase;
        font-size: 13px;
        letter-spacing: 0.1em;
      }

      svg {
        width: 20px;
        height: 20px;
        display: block;
        fill: #fff;
        flex: 0 0 auto;
      }
    }

    .text {
      flex: 1 1 auto;
      font-size: 13px;
      letter-spacing: 0.02em;
      white-space: nowrap;
      opacity: 0.6;
    }
  }
</style>