<script lang="ts">
    import { env } from "$env/dynamic/public";
    import { Download, Flag, Link, Trash, Pencil } from "@lucide/svelte";
    import type { PageProps } from "./$types";
    import Button from "$lib/Button.svelte";
    import Progress from "$lib/Progress.svelte";
    import { prettyNumber } from "$lib/util";
    import FilePreview from "$lib/FilePreview.svelte";
    import Banner from "$lib/Banner.svelte";

    let { data }: PageProps = $props();

    let downloadProgress: number | undefined = $state();

    const properties = [
        ["filename", data.filename],
        ["size", `${prettyNumber(data.size)}B`],
        ["date", data.lastModified],
        ["type", data.contentType],
    ];

    const title = data.title ?? data.filename;

    async function download() {
        if (downloadProgress != undefined) return; // already downloading

        const response = await fetch(data.raw + "?d");
        if (!response.ok || !response.body) {
            throw new Error(`download failed: ${response.status}`);
        }
        const total = parseInt(response.headers.get("Content-Length") ?? "0");

        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let loaded = 0;

        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            loaded += value.length;
            downloadProgress = total > 0 ? loaded / total : undefined;
        }

        const blob = new Blob(chunks as BlobPart[], { type: response.headers.get("Content-Type") ?? "application/octet-stream" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        a.click();

        URL.revokeObjectURL(url);
        downloadProgress = undefined;
    }

    function report() {}

    function copyUrl() {
        const copyText: HTMLDivElement =
            document.querySelector("#downloadUrl")!!;
        const selection = window.getSelection()!!;
        const range = document.createRange();
        range.selectNodeContents(copyText);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("copy");
    }
</script>

<svelte:head>
    <meta property="og:title" content={data.title ?? data.filename} />
    <meta property="og:type" content="video.other" />
    <meta property="og:url" content={`${env.PUBLIC_BASE_URL}/u/${data.file}`} />
    {#if data.contentType.startsWith("image")}
        <meta
            property="og:image"
            content={`${env.PUBLIC_BASE_URL}/u/${data.file}`}
        />
    {:else}
        <meta
            property="og:image"
            content={`${env.PUBLIC_BASE_URL}/default.png`}
        />
    {/if}
    {#if data.contentType.startsWith("video")}
        <meta
            property="og:video"
            content={`${env.PUBLIC_BASE_URL}/u/${data.file}`}
        />
    {/if}
</svelte:head>

<!-- add download button so we can reuse it later -->
{#snippet download_icon()}
    <Download />
{/snippet}
{#snippet download_button()}
    <!-- <a href={data.raw} download={data.file} class="no-underline w-min"> -->
    <Button
        classes="bg-ctp-green w-min"
        icon={download_icon}
        callback={download}
        disabled={downloadProgress != undefined}
    >
        {#if downloadProgress != undefined}
            <div class="flex flex-col gap-1 items-center">
                <span class="text-xs">
                    {Math.round(downloadProgress * 100)}%
                </span>
                <Progress progress={downloadProgress} classList="w-24" />
            </div>
        {:else}
            Download
        {/if}
    </Button>
    <!-- </a> -->
{/snippet}

<Banner user={data.user} />

<div
    class="w-full md:px-64 mt-8 flex items-center justify-around flex-col md:flex-row gap-6 px-8"
>
    <div class="flex md:flex-1 flex-col gap-2">
        <!-- title and buttons -->
        <div class="flex gap-2">
            <div class="rounded w-min px-4 py-2 grow my-auto">
                <h1 class="text-4xl font-display text-ctp-blue">
                    {title}
                </h1>
                <div class="text-sm text-ctp-subtext0 text-nowrap">
                    by {data.uploader}
                </div>
            </div>
            <div class="flex flex-col gap-1 justify-around">
                <!-- buttons -->
                <div class="flex gap-1 ml-auto">
                    {@render download_button()}

                    {#snippet report_icon()}
                        <Flag />
                    {/snippet}
                    <Button classes="bg-ctp-surface1" icon={report_icon} />
                </div>

                <!-- url -->
                <div
                    class="flex bg-ctp-crust text-ctp-subtext0 font-mono text-sm w-full rounded-sm py-2 px-2 text-nowrap overflow-x-auto"
                    id="downloadUrl"
                >
                    <div class="pr-4">
                        {env.PUBLIC_BASE_URL}/u/{data.file}
                    </div>
                    {#snippet link_icon()}
                        <Link class="h-5 w-4" />
                    {/snippet}
                    <Button
                        classes="text-ctp-text! border-ctp-surface0 bg-ctp-surface0 right-0 top-0 -m-2"
                        icon={link_icon}
                        callback={copyUrl}
                    />
                </div>
            </div>
        </div>

        <!-- preview -->
        <FilePreview
            file={data.file}
            raw={data.raw}
            contentType={data.contentType}
            {download_button}
        />
    </div>
    <div class="flex flex-col gap-6 w-min">
        <div
            class="relative rounded border-4 border-ctp-surface0 px-4 py-2 pt-6 w-lg md:w-sm"
        >
            <h2 class="font-display text-4xl absolute -top-6 bg-bg px-1">
                properties
            </h2>
            <div class="flex flex-col gap-1">
                {#each properties as [property, value]}
                    <div class="flex *:py-1">
                        <div
                            class="relative z-10 rounded-sm w-[12em] bg-ctp-mantle font-bold text-center -mr-2"
                        >
                            {property}
                        </div>
                        <div
                            class="rounded-sm w-full bg-ctp-crust font-mono text-sm -ml-2 pl-7 leading-6"
                        >
                            {value}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
        <div
            class="relative rounded border-4 border-ctp-surface0 px-4 py-2 pt-5 w-lg md:w-sm"
        >
            <h2 class="font-display text-4xl absolute -top-6 bg-bg px-1">
                about
            </h2>
            {#if data.description}
                <p class="text-ctp-subtext0 whitespace-pre-wrap">
                    {data.description}
                </p>
            {:else}
                <i class="text-ctp-subtext0"
                    >The uploader did not provide any additional information.</i
                >
            {/if}
        </div>
    </div>
</div>
