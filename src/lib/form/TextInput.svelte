<script lang="ts">
    /* value: bindable, holds the current text
       placeholder: optional hint shown when empty
       multiline: render a taller textarea instead of a single-line input */
    let { value = $bindable(""), placeholder = undefined, multiline = false } =
        $props();

    const base = "text-sm w-full rounded-sm bg-ctp-crust text-ctp-text py-1 px-2 focus-border-ctp-lavender outline-none resize-none";
</script>

{#if multiline}
    <textarea
        bind:value
        placeholder={placeholder}
        rows="4"
        class={base}
    ></textarea>
{:else}
    <input
        type="text"
        bind:value
        placeholder={placeholder}
        class={base}
    />
{/if}
