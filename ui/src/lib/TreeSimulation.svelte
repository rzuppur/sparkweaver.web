<script lang="ts">
  import { onDestroy } from "svelte";
  import { store } from "./store";

  let dmxData = $state<Array<number>>([]);

  const rgbOutputNodeAddresses = $derived(
    $store.nodes.filter(n => n.name === "DsDmxRgb").map(n => n.params.find(p => p.name === "address")?.value).filter(n => n !== undefined),
  );

  const treeString = store.treeString;
  let resultError = $state<string | null>("");

  function buildTree(): void {
    if (!$store.wasm) return;
    try {
      const result = $store.wasm.build($treeString);
      if (result === "OK") {
        resultError = null;
      } else {
        resultError = result;
      }
    } catch (e) {
      resultError = `${e}`;
    }
  }

  function tick(): void {
    if (!$store.wasm) return;
    dmxData = Array.from($store.wasm.tick());
  }

  let runLoopId: number | undefined = $state();
  let lastTick = 0;

  function runLoop(): void {
    const now = performance.now();
    if (now - lastTick > 24) {
      tick();
      lastTick = now;
    }
    runLoopId = window.requestAnimationFrame(runLoop);
  }

  function run(): void {
    if (!runLoopId) {
      runLoopId = window.requestAnimationFrame(runLoop);
    }
  }

  function stop(): void {
    if (runLoopId) {
      window.cancelAnimationFrame(runLoopId);
      runLoopId = undefined;
    }
  }

  async function copyTree(): Promise<void> {
    try {
      await navigator.clipboard.writeText($treeString);
    } catch {
      window.alert("Failed to copy tree to clipboard");
    }
  }

  async function pasteTree(): Promise<void> {
    const text = await navigator.clipboard.readText();
    try {
      store.fromTreeString(text);
    } catch (e) {
      console.warn(e);
      window.alert(e);
    }
  }

  onDestroy(() => {
    stop();
  });
</script>

<div class="tree-simulation">
  <div class="buttons">
    <button type="button" disabled={!$store.wasm} onclick={() => { buildTree(); run(); }}>Build & run</button>
    <button type="button" disabled={!$store.wasm || !runLoopId || resultError !== null} onclick={stop}>Stop</button>
    <button type="button" disabled={!$store.wasm || !!runLoopId || resultError !== null} onclick={run}>Run</button>
    <button type="button" disabled={!$store.wasm || !!runLoopId || resultError !== null} onclick={tick}>Tick</button>
    <button type="button" disabled={!$store.wasm} onclick={buildTree}>Build</button>
    <button type="button" onclick={copyTree}>Copy tree</button>
    <button type="button" onclick={pasteTree}>Paste tree</button>
  </div>
  <div class="status">
    {#if resultError}
      <div class="text-error">{resultError}</div>
    {:else if resultError === null}
      {#if runLoopId !== undefined}
        <div>Running</div>
      {:else}
        <div class="text-ready">Tree ready</div>
      {/if}
    {:else}
      <div class="text-warning">Tree not built</div>
    {/if}
  </div>
  <div class="fixtures">
    {#each rgbOutputNodeAddresses as address, i (i)}
      <div class="fixture">
        <div class="color" style:background-color={`rgb(${dmxData.at(address) ?? 0}, ${dmxData.at(address + 1) ?? 0}, ${dmxData.at(address + 2) ?? 0})`}></div>
        <div class="color-glow" style:background-color={`rgb(${dmxData.at(address) ?? 0}, ${dmxData.at(address + 1) ?? 0}, ${dmxData.at(address + 2) ?? 0})`}></div>
        <div class="address">{address.toFixed(0).padStart(3, "0")}</div>
      </div>
    {/each}
  </div>
</div>

<style>
  .tree-simulation {
    padding: var(--s-md);
    display: flex;
    flex-direction: column;
    gap: var(--s-smp);
    align-items: start;
    justify-content: start;

    .buttons {
      display: flex;
      gap: var(--s-sm);
      align-items: center;
    }

    .status {
      font-size: 13px;
      font-family: monospace;
      font-weight: bold;

      .text-error {
        color: #f52;
      }

      .text-warning {
        color: #fa2;
      }

      .text-ready {
        color: #3a6;
      }
    }

    button {
      padding: var(--s-xsp) var(--s-sm);
      flex: 0 0 auto;
    }

    .fixtures {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-md);

      .fixture {
        position: relative;

        .address {
          font-size: 13px;
          font-family: monospace;
          color: #bbb;
          text-align: center;
          margin-top: var(--s-sm);
        }

        .color {
          width: var(--s-lgp);
          height: var(--s-lgp);
          border-radius: 50%;
          outline: 2px solid #333;
        }

        .color-glow {
          width: var(--s-lgp);
          height: var(--s-lgp);
          border-radius: 50%;
          position: absolute;
          top: 0;
          left: 0;
          filter: blur(18px);
          /*noinspection CssInvalidPropertyValue*/
          mix-blend-mode: plus-lighter;
        }
      }
    }
  }
</style>