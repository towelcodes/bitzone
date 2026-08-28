<script lang="ts">
    /* checked: bindable, holds whether the box is ticked
       label: optional text shown next to the box */
    let { checked = $bindable(false), label = undefined } = $props();
</script>

<label
    class="flex items-center gap-2 text-sm text-ctp-text cursor-pointer select-none"
>
    <input type="checkbox" bind:checked class="sr-only" />
    <span
        class="flex items-center justify-center w-5 h-5 rounded-[6px] border-2 transition-colors duration-200
            {checked
                ? 'bg-ctp-lavender border-ctp-lavender'
                : 'bg-ctp-crust border-ctp-surface0'}"
    >
        {#if checked}
            <svg
                class="w-3 h-3 text-ctp-crust transition-opacity duration-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M20 6 9 17l-5-5" />
            </svg>
        {:else}
            <svg
                class="w-3 h-3 text-ctp-base transition-opacity duration-200"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
            </svg>
        {/if}
    </span>
    {#if label}
        <span>{label}</span>
    {/if}
</label>