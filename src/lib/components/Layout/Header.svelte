<script lang="ts">
    import appLogo from '$assets/app-logo.svg';
    import Button from '$components/Button.svelte';
</script>

<header>
    <a href="/">
        <img class="logo" src={appLogo} alt="Go to home">
    </a>
    <nav>
        <ul>
            <li>
                <Button isMenu={true} href="/register">Sign Up</Button>
            </li>
            <li>
                <Button isMenu={true} isSecondary={true} href="/login">Log in</Button>
            </li>
        </ul>
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
        column-gap: 24px;
    }
</style>