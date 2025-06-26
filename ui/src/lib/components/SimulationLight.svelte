<script lang="ts">
  interface Props {
    size?: number;
    address: number;
    dmxData: Array<number>;
  }

  let { size = 8, address, dmxData }: Props = $props();

  const r = $derived(dmxData.at(address) ?? 0);
  const g = $derived(dmxData.at(address + 1) ?? 0);
  const b = $derived(dmxData.at(address + 2) ?? 0);
</script>

<div
  class="light"
  style="--light-size: {size}px; --light-color: rgb({r}, {g}, {b});"
  title={address.toString(10).padStart(3, "0")}
></div>

<style>
  .light {
    width: var(--light-size);
    height: var(--light-size);
    border-radius: 50%;
    background: var(--light-color);
    box-shadow: 0 0 var(--light-size) 2px var(--light-color);
    outline: 1px solid #fff1;
  }
</style>

