<script lang="ts">
    import {
        PUBLIC_INSTANCE_RULES,
        PUBLIC_REPO_URL,
        PUBLIC_BASE_URL,
    } from "$env/static/public";
    import { env } from "$env/dynamic/public";
    import {
        TriangleAlert,
        Upload,
        File,
        X,
        LoaderCircle,
    } from "@lucide/svelte";
    import { createUpload, prettyNumber } from "$lib/util";
    import Progress from "$lib/Progress.svelte";
    import Container from "$lib/Container.svelte";
    import Banner from "$lib/Banner.svelte";
    import RecentUploads from "$lib/RecentUploads.svelte";
    import { fade, slide } from "svelte/transition";
    import type { PageProps } from "./$types";
    import TextInput from "$lib/form/TextInput.svelte";
    import MultiChoice from "$lib/form/MultiChoice.svelte";
    import Button from "$lib/Button.svelte";
    import Checkbox from "$lib/form/Checkbox.svelte";
    import CapWidget from "$lib/form/CapWidget.svelte";

    let { data }: PageProps = $props();

    const rules = PUBLIC_INSTANCE_RULES.split("\\n");
    const captchaEnabled =
        env.PUBLIC_CAP_ENDPOINT !== undefined && env.PUBLIC_CAP_ENDPOINT !== "";

    let filename = $state("");
    let files: FileList | undefined = $state();
    let progress: { loaded: number; total: number } | undefined = $state();

    let error: { title: string; description: string } | undefined = $state();

    let recentUploads: string[] = $state([]);

    // options
    let title = $state("");
    let description = $state("");
    let expiry = $state("-1");
    let preserveFilename = $state(false);
    let capToken = $state("");
    let solveCap: (() => Promise<string>) | undefined = $state();

    let canUpload = $state(false);
    let canClear = $state(false);

    async function upload() {
        if (!files) return;
        if (files.item(0) == null) return;
        const file = files.item(0)!!;

        // create the upload
        try {
            // get a fresh captcha token (single-use) right before uploading
            let token = capToken;
            if (captchaEnabled && solveCap) {
                token = await solveCap();
            }
            const { key, signed } = await createUpload(file.size, file.name, undefined, {
                title: title || undefined,
                description: description || undefined,
                expiry: parseInt(expiry),
                preserveFilename,
                capToken: token || undefined,
            });
            const req = new XMLHttpRequest();
            req.open("PUT", signed);
            req.setRequestHeader("Content-Type", file.type);
            await new Promise((resolve) => {
                req.upload.addEventListener("progress", (e) => {
                    if (e.lengthComputable) {
                        progress = {
                            loaded: e.loaded,
                            total: e.total,
                        };
                    }
                });
                req.addEventListener("readystatechange", () => {
                    if (req.readyState == 4) {
                        resolve(req.response);
                    }
                });
                req.send(file);
            });

            recentUploads.unshift(key);
            window.localStorage.setItem(
                "recentUploads",
                JSON.stringify(recentUploads),
            );

            clear();
        } catch (e: any) {
            console.error(e);
            error = {
                title: "upload failed",
                description: `${e.message}`,
            };
            return;
        }

        progress = undefined;
    }

    function clear() {
        files = new DataTransfer().files;
        error = undefined;
    }

    $effect(() => {
        const file = files?.item(0);
        const maxSize = env.PUBLIC_MAX_SIZE;

        if (file) {
            filename = file.name;

            if (maxSize != undefined && file.size > parseInt(maxSize)) {
                canUpload = false;
                canClear = true;
                error = {
                    title: "cannot upload this file",
                    description: `size is too big (${prettyNumber(file.size)}B > ${prettyNumber(parseInt(maxSize))}B)`,
                };
            } else {
                canUpload = !captchaEnabled || capToken !== "";
                canClear = true;
                if (error?.title === "cannot upload this file") {
                    error = undefined;
                }
            }
        } else {
            filename = "";
            canUpload = false;
            canClear = false;
        }
    });

    function drop(e: DragEvent) {
        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
            e.preventDefault();
            files = e.dataTransfer.files;
        }
    }

    function dragOver(e: DragEvent) {
        if (!e.dataTransfer) return;
        const fileItems = [...e.dataTransfer.items].filter(
            (item) => item.kind === "file",
        );
        if (fileItems.length > 0) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        }
    }
</script>

<Banner user={data.user} />

<div class="mt-8 container lg:max-w-2xl! mx-auto">
    <!-- rules -->
    {#if rules.length > 0}
        <div class="my-4">
            {#snippet warning_icon()}
                <TriangleAlert class="h-4" />
            {/snippet}
            <Container
                icon={warning_icon}
                title="instance rules"
                border="border-ctp-red"
                text="text-ctp-red"
            >
                <ul class="text-sm">
                    {#each rules as line}
                        <li>{line}</li>
                    {/each}
                </ul>
            </Container>
            <span class="text-xs text-ctp-subtext0 italic">
                don't like these rules? <a href={PUBLIC_REPO_URL}
                    >host your own!</a
                >
            </span>
        </div>
    {/if}

    <!-- error or status information -->
    {#if error}
        <div class="mx-4 mb-2 px-3 py-1 rounded bg-ctp-crust" transition:slide>
            <h3 class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ctp-red to-ctp-mauve">
                {error.title}
            </h3>
            <p>
                {error.description}
            </p>
        </div>
    {/if}

    <!-- upload options -->
    <div class="flex flex-col md:flex-row gap-8">
        <div class="flex flex-col items-center">
            <label
                for="upload"
                class="font-sans p-4 rounded border-2 border-dashed border-ctp-subtext0 bg-ctp-crust my-4 flex justify-center items-center flex-col gap-3 w-full md:w-80 h-56"
            >
                <!-- icon -->
                <div class="flex flex-col">
                    <div class="grow flex items-center justify-center">
                        <div class="rounded-full bg-ctp-mantle px-2 py-2">
                            {#if progress}
                                <LoaderCircle
                                    class="stroke-ctp-mauve animate-spin"
                                />
                            {:else if filename}
                                <File class="stroke-ctp-mauve" />
                            {:else}
                                <Upload class="stroke-ctp-mauve" />
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- text -->
                <div class="md:w-1/2 text-center break-words">
                    {#if progress}
                        uploading...
                    {:else if filename}
                        {filename}
                    {:else}
                        Drag and drop, or select a file to begin uploading.
                    {/if}
                </div>

                <!-- size -->
                <div>
                    {#if progress}
                        <div class="text-xs text-ctp-subtext0">
                            {((progress.loaded / progress.total) * 100).toPrecision(
                                3,
                            )}% ({prettyNumber(progress.loaded)}B /
                            {prettyNumber(progress.total)}B)
                        </div>
                    {:else if filename}
                        <div class="text-xs text-ctp-subtext0">
                            {prettyNumber(files?.item(0)?.size ?? 0)}B
                        </div>
                    {:else if env.PUBLIC_MAX_SIZE}
                        <div class="text-xs text-ctp-subtext0">
                            Max: {prettyNumber(parseInt(env.PUBLIC_MAX_SIZE))}B
                        </div>
                    {/if}
                </div>

                {#if progress}
                    <Progress
                        progress={progress.loaded / progress.total}
                        classList="w-full"
                    />
                {/if}
                <input id="upload" type="file" bind:files class="hidden" />
            </label>

            <!-- buttons -->
            <div class="flex gap-2">
                {#snippet uploadIcon()}
                    <Upload />
                {/snippet}
                <Button
                    classes={"bg-linear-to-tr from-ctp-green to-ctp-yellow border-ctp-green"}
                    icon={uploadIcon}
                    callback={upload}
                    disabled={!canUpload}
                >
                    upload!
                </Button>

                {#snippet clearIcon()}
                    <X />
                {/snippet}
                <Button
                    classes={"bg-linear-to-tr from-ctp-red to-ctp-peach border-ctp-red"}
                    icon={clearIcon}
                    callback={clear}
                    disabled={!canClear}
                >
                    clear
                </Button>
            </div>
        </div>

        <!-- options -->
        <div>
            <h2 class="text-2xl font-display">options</h2>

            <div class="flex flex-col gap-2">
                <TextInput bind:value={title} placeholder="title" />
                <TextInput bind:value={description} placeholder="description" multiline />
                <Checkbox bind:checked={preserveFilename} label="preserve filename?"/>
                <MultiChoice options={[{
                    label: "∞", value: "-1"
                }, {
                    label: "30d", value: "2592000",
                }, {
                    label: "1d", value: "86400",
                }, {
                    label: "12h", value: "43200",
                }, {
                    label: "1h", value: "3600",
                }]} bind:value={expiry} />
                {#if captchaEnabled}
                    <CapWidget bind:token={capToken} bind:solve={solveCap} />
                {/if}
            </div>
        </div>
    </div>

    <!-- recent uploads -->
    <RecentUploads bind:uploads={recentUploads} />
</div>

<svelte:window ondragover={dragOver} ondrop={drop} />
