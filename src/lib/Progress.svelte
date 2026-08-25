<script lang="ts">
    /* progress: a fraction between 0 and 1 */
    let { progress, classList }: { progress: number; classList?: string } =
        $props();
</script>

<div class="h-2 rounded bg-ctp-surface2 p-0 {classList}">
    <div
        class="transition-all h-2 rounded bg-ctp-mauve"
        style="width: {progress * 100}%"
    ></div>
</div>