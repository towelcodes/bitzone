<script lang="ts">
    import { onMount } from "svelte";
    import Cap from "cap-widget";
    import { LoaderCircle, Check, X } from "@lucide/svelte";
    import { env } from "$env/dynamic/public";

    /* token: bindable, holds the latest solved cap token ("" until solved)
       solve: bindable, a function the parent can call to get a fresh token */
    let { token = $bindable(""), solve = $bindable() } = $props();

    type Status = "idle" | "verifying" | "success" | "error";
    let status: Status = $state("idle");

    const endpoint = env.PUBLIC_CAP_ENDPOINT;

    async function doSolve(): Promise<string> {
        if (!endpoint) return "";
        const cap = new Cap({ apiEndpoint: endpoint });
        status = "verifying";
        try {
            const { token: t } = await cap.solve();
            token = t;
            status = "success";
            return t;
        } catch (e) {
            console.error("cap solve failed", e);
            status = "error";
            throw e;
        }
    }

    // expose the solve function to the parent
    solve = doSolve;

    // solve once on mount so the token is usually ready before upload
    onMount(() => {
        if (endpoint) doSolve();
    });
</script>

{#if endpoint}
    <div class="flex items-center gap-2 text-sm">
        {#if status === "verifying"}
            <LoaderCircle class="w-4 h-4 stroke-ctp-mauve animate-spin" />
            <span class="text-ctp-subtext0">verifying...</span>
        {:else if status === "success"}
            <Check class="w-4 h-4 stroke-ctp-green" />
            <span class="text-ctp-green">verified</span>
        {:else if status === "error"}
            <X class="w-4 h-4 stroke-ctp-red" />
            <span class="text-ctp-red">verification failed</span>
        {/if}
    </div>
{:else}
    <p class="text-xs text-ctp-subtext0 italic">
        captcha not configured
    </p>
{/if}