<script lang="ts">
    /* expect classes to be the tailwind bg class for the colour */
    const {
        classes,
        icon = undefined,
        callback = undefined,
        children = undefined,
        disabled = false,
    } = $props();
</script>

<button
    class="flex gap-2 clicky text-ctp-crust rounded px-2 py-1 border-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none {classes}"
    onclick={() => callback?.()}
    {disabled}
>
    {#if icon}
        {@render icon()}
    {/if}
    {#if children}
        <div>
            {@render children()}
        </div>
    {/if}
</button>
