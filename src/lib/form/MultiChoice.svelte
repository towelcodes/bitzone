<script lang="ts">
    interface Option {
        label: string;
        value: string;
    }

    /* options: the choices shown in the horizontal list
       value: bindable, holds the currently selected option's value */
    let { options, value = $bindable("") } = $props();
</script>

<div class="flex gap-2 flex-wrap">
    {#each options as option}
        <button
            class="flex items-center gap-2 rounded border-2 px-3 py-1 text-sm font-bold transition
                {option.value === value
                    ? 'border-ctp-lavender bg-ctp-lavender text-ctp-crust'
                    : 'border-ctp-surface0 bg-ctp-surface0 text-ctp-subtext0 hover:border-ctp-overlay0'}"
            onclick={() => (value = option.value)}
        >
            {option.label}
        </button>
    {/each}
</div>