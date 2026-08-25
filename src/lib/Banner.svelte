<script lang="ts">
    import discordIcon from "$lib/assets/discord.svg";
    import Button from "./Button.svelte";
    import { Folder, LogIn } from "@lucide/svelte";

    interface User {
        displayName: string;
        avatarUrl?: string;
    }

    interface Props {
        user: User | null;
    }

    let { user }: Props = $props();
</script>

<nav>
    <div class="flex flex-col gap-2 w-min md:gap-0 md:flex-row justify-around hover:cursor-default md:w-3/4 mx-auto">
        <div class="flex gap-2 items-center px-2 rounded bg-ctp-surface0">
            <Folder class="stroke-ctp-mauve" />
            <div class="font-sans text-ctp-mauve text-2xl">
                files<span class="text-ctp-subtext0 text-lg">.towel.codes</span>
            </div>
        </div>

        <div class="bg-ctp-surface0 rounded px-2 flex gap-2 items-center">
            {#if user}
                <img
                    src={user.avatarUrl}
                    alt=""
                    class="w-6 h-6 rounded-full"
                />
                <span class="text-ctp-subtext0 text-sm">
                    {user.displayName}
                </span>
            {:else}
                <LogIn/>
                <a href="/auth" class="no-underline">
                    Log in with Discord
                </a>
            {/if}
        </div>
    </div>
</nav>
