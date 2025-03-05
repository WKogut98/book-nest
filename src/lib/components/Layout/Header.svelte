<script lang="ts">
    import appLogo from '$assets/app-logo.svg';
    import {Button} from '$components';
    import { getUserState } from '$lib/state/user-state.svelte';

    let userContext = getUserState();
    let {user, userName} = $derived(userContext);
</script>

<header>
    <a href={user ? "/private/dashboard" : "/"}>
        <img class="logo" src={appLogo} alt="Go to home">
    </a>
    <nav>
        {#if !user}
        <ul>
            <li>
                <Button isMenu={true} href="/register">Sign Up</Button>
            </li>
            <li>
                <Button isMenu={true} isSecondary={true} href="/login">Log in</Button>
            </li>
        </ul>
        {:else}
        <ul>
            <li>
                {userName}
            </li>
            <li>
                <Button isMenu={true} onclick = {() => userContext.logout()}>Log Out</Button>
            </li>
        </ul>
        {/if}
    </nav>
</header>

<style>
    header
    {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 4vw;
    }
    .logo
    {
        height: 72px;
    }
    ul
    {
        display: flex;
        align-items: center;
        column-gap: 24px;
    }
</style>