<script>
  import { accounts } from "../data/demo.js";
  let { id, compact = false } = $props();
</script>

<span class="tag" style={`--c: var(--${id})`} title={accounts[id].email}>
  <span class="dot" aria-hidden="true"></span>{#if !compact}{accounts[id].name}{:else}<span class="sr-only">{accounts[id].name}</span>{/if}
</span>

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--fs-small);
    line-height: var(--lh-small);
    font-weight: 560;
    color: var(--text-2);
    white-space: nowrap;
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--c);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 18%, transparent);
  }
</style>
