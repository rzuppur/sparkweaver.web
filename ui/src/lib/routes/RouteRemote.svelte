<script lang="ts">
  import { bluetoothService, bluetoothState } from "$lib/services";
  import { BluetoothState, CHR_TRIGGER } from "$lib/services/bluetoothService";

  let triggerIds = $state<Array<number>>([]);

  async function loadTriggerIds(): Promise<void> {
    await bluetoothService.request(async (service) => {
      const chrTrigger = await service.getCharacteristic(CHR_TRIGGER);
      const triggerValue = await chrTrigger.readValue();
      triggerIds = [...new Uint8Array(triggerValue.buffer)];
    });
  }

  async function sendTrigger(id: number): Promise<void> {
    await bluetoothService.request(async (service) => {
      const chrTrigger = await service.getCharacteristic(CHR_TRIGGER);
      await chrTrigger.writeValueWithResponse(new Uint8Array([id]));
    });
  }
</script>

<div class="remote">
  <div class="remote-container">
    <div>
      {#if $bluetoothState >= BluetoothState.READY}
        {#if $bluetoothState === BluetoothState.READY}
          <button type="button" onclick={() => bluetoothService.connect()} disabled={$bluetoothState !== BluetoothState.READY}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
              <path d="M360-80v-304L176-200l-56-56 224-224-224-224 56-56 184 184v-304h40l228 228-172 172 172 172L400-80h-40Zm80-496 76-76-76-74v150Zm0 342 76-74-76-76v150Zm222-152-92-94 92-92q9 22 14.5 45t5.5 47q0 24-5.5 47.5T662-386Zm118 114-50-48q20-37 31-77.5t11-82.5q0-42-11-82.5T730-640l50-50q29 48 44.5 101T840-480q0 56-15.5 108.5T780-272Z"/>
            </svg>
            <span class="button-label">Connect</span>
          </button>
        {/if}
        {#if $bluetoothState >= BluetoothState.CONNECTED}
          <button type="button" onclick={() => bluetoothService.reset()} disabled={$bluetoothState === BluetoothState.COMMUNICATING}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
              <path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
            </svg>
            <span class="button-label">Disconnect</span>
          </button>
          <button type="button" onclick={loadTriggerIds} disabled={$bluetoothState === BluetoothState.COMMUNICATING}>
            <span class="button-label">Load triggers</span>
          </button>
          <div class="triggers">
            {#each triggerIds as id, i (i)}
              <button type="button" class="trigger" onclick={() => sendTrigger(id)}>
                <span class="label">{id.toFixed(0).padStart(3, "0")}</span>
              </button>
            {/each}
          </div>
        {/if}
      {/if}
      <div class="text">
        {#if $bluetoothState === BluetoothState.UNAVAILABLE}
          Bluetooth not available. Please <a href="https://caniuse.com/web-bluetooth" target="_blank">check here</a> to get latest information about Web Bluetooth supported browsers.
        {/if}
      </div>
    </div>
  </div>
</div>


<style>
  .remote {
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

    .remote-container {
      grid-column: 2 / 4;
      display: grid;
      grid-template-columns: subgrid;

      button:not(.trigger) {
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

      .triggers {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--s-md);
        margin-top: var(--s-lg);
      }

      .trigger {
        display: block;
        width: 100%;
        padding: var(--s-lg) var(--s-md);
        background: #222;
        border-radius: var(--s-smp);
        cursor: pointer;
        appearance: none;
        text-align: center;
        white-space: normal;

        &:hover {
          background: #333;
        }

        .label {
          font-size: 19px;
          line-height: 1.3;
          opacity: 0.8;
          letter-spacing: -0.01em;
          font-weight: 700;
        }
      }

      .text {
        flex: 1 1 auto;
        font-size: 15px;
        line-height: 1.5;
        letter-spacing: -0.01em;
        opacity: 0.6;
      }
    }
  }
</style>
