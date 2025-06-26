<script lang="ts">
  import { bluetoothPwNeedsChanging, bluetoothService, bluetoothState, editorService, editorTreeString, uiService } from "$lib/services";
  import { BluetoothState, CHR_PW, CHR_TREE, readInChunks, writeInChunks } from "$lib/services/bluetoothService";
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
        editorService.loadTree(String.fromCharCode(...data));
      } catch (e) {
        uiService.alertError(`${e}`);
      }
    }
  }

  async function sendToDevice(): Promise<void> {
    await bluetoothService.request(async (service) => {
      const treeString = get(editorTreeString);
      await writeInChunks(service, CHR_TREE, new TextEncoder().encode(treeString));
    });
  }
</script>

<div class="bluetooth-link">
  <div class="header" class:unavailable={$bluetoothState === BluetoothState.UNAVAILABLE} class:connected={$bluetoothState === BluetoothState.CONNECTED}>
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
        <path d="M440-80v-304L256-200l-56-56 224-224-224-224 56-56 184 184v-304h40l228 228-172 172 172 172L480-80h-40Zm80-496 76-76-76-74v150Zm0 342 76-74-76-76v150Z"/>
      </svg>
    </div>
    <div class="status">
      {#if $bluetoothState === BluetoothState.UNINITIALIZED}
        Loading...
      {:else if $bluetoothState >= BluetoothState.READY}
        Bluetooth {$bluetoothState >= BluetoothState.CONNECTED ? "connected" : "available"}
      {:else}
        Bluetooth not available
      {/if}
    </div>
  </div>
  <div class="actions">
    {#if $bluetoothState >= BluetoothState.READY}
      {#if $bluetoothState >= BluetoothState.CONNECTED}
        <div class="buttons">
          <button type="button" onclick={() => bluetoothService.reset()}>Disconnect</button>
          {#if $bluetoothPwNeedsChanging === false}
            <button type="button" onclick={loadFromDevice} disabled={$bluetoothState === BluetoothState.COMMUNICATING}>Load tree from device</button>
            <button type="button" onclick={sendToDevice} disabled={$bluetoothState === BluetoothState.COMMUNICATING}>Send to device</button>
          {/if}
        </div>
        <hr>
        <div class="form wrap">
          {#if $bluetoothPwNeedsChanging === true}
            <div class="info-text">Please set a custom 6-digit password. 123456 can not be used.</div>
          {/if}
          <input bind:value={newPw} type="text" inputmode="numeric" minlength="6" maxlength="6" pattern="[0-9]{6}" autocomplete="off" placeholder="000000" required>
          <button type="button" onclick={changePw} disabled={$bluetoothState === BluetoothState.COMMUNICATING}>Save new password</button>
        </div>
      {:else}
        <button type="button" onclick={() => bluetoothService.connect()} disabled={$bluetoothState !== BluetoothState.READY}>Connect</button>
      {/if}
    {:else if $bluetoothState === BluetoothState.UNAVAILABLE}
      <div class="info-text">
        Bluetooth is not supported or allowed in your browser. Please <a href="https://caniuse.com/web-bluetooth" target="_blank">check here</a> to get latest information about Web Bluetooth supported browsers.
      </div>
    {/if}
  </div>
</div>

<style>

  .bluetooth-link {
    .header {
      padding: var(--s-smp) var(--s-md);
      background: #457;
      display: flex;
      gap: var(--s-sm);
      align-items: center;

      &.unavailable {
        background: #444;
      }

      &.connected {
        background: #574;
      }

      .icon {
        flex: 0 0 auto;
      }

      .status {
        flex: 1 1 auto;
      }
    }

    .actions {
      padding: var(--s-md);

      hr {
        border: none;
        height: 2px;
        background: #444;
        margin: var(--s-md) 0;
      }

      button {
        padding: 0 var(--s-md);
        height: 40px;
      }

      .info-text {
        color: #bbb;
      }

      input {
        padding: 0 var(--s-sm);
        height: 40px;
      }

      .form {
        display: flex;
        gap: var(--s-sm);
        flex-direction: column;
        align-items: start;

        &.wrap {
          flex-direction: row;
          flex-wrap: wrap;
        }
      }
    }
  }
</style>