<script lang="ts">
  import type { DmxOutput } from "$lib/services/coreService";

  interface Props {
    size?: number;
    output: DmxOutput;
    dmxData: Array<number>;
  }

  let { size = 8, output, dmxData }: Props = $props();

  const lights = $derived.by(() => {
    const lights: Array<{ r: number; g: number; b: number; }> = [];
    for (let i = 0; i < output.count; i++) {
      const base = output.address + i * 3;
      lights.push({ r: dmxData.at(base) ?? 0, g: dmxData.at(base + 1) ?? 0, b: dmxData.at(base + 2) ?? 0 });
    }
    return lights;
  });
</script>

{#if lights.length === 1}
  <div
    class="light"
    style="--light-size: {size}px; --light-color: rgb({lights.at(0)?.r}, {lights.at(0)?.g}, {lights.at(0)?.b});"
    title={output.address.toString(10).padStart(3, "0")}
  ></div>
{:else if lights.length > 1}
  <div class="light-group">
    {#each lights as light, l_i (l_i)}
      <div
        class="light"
        style="--light-size: {size}px; --light-color: rgb({light.r}, {light.g}, {light.b});"
        title={output.address.toString(10).padStart(3, "0")}
      ></div>
    {/each}
  </div>
{/if}

<style>
  .light-group {
    display: flex;
    outline: 1px solid #fff1;
    border-radius: var(--s-xs);
    background: #fff1;
    gap: var(--s-xxs);

    .light {
      flex: 0 0 auto;
      outline: none;

      &:not(:first-child) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      &:not(:last-child) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
  }

  .light {
    width: var(--light-size);
    height: var(--light-size);
    border-radius: 50%;
    background: var(--light-color);
    box-shadow: 0 0 var(--light-size) 2px var(--light-color);
    outline: 1px solid #fff1;
  }
</style>

