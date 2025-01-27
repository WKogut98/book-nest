<script lang="ts">
    import type { Snippet } from "svelte";


    interface PropsBase
    {
        children: Snippet;
        isSecondary?: boolean;
        isDanger?: boolean;
        isMenu?: boolean;
    }

    interface ButtonProps extends PropsBase
    {
        onclick?: (e: MouseEvent) => void;
        href?: never;
        type?: "button" | "submit";
    }

    interface LinkProps extends PropsBase
    {
        href: string;
        onclick?: never;
    }

    type ComponentProps = ButtonProps | LinkProps;
    let {children, href, onclick, isSecondary, isDanger, isMenu, ...props}: ComponentProps = $props();
</script>

{#if href}
    
    <a {href} class="btn" class:btn-secondary={isSecondary} 
            class:btn-danger={isDanger} class:btn-menu={isMenu}>
        {@render children()}
    </a>

{:else}

<button {...props} {onclick} class="btn" class:btn-secondary={isSecondary} 
        class:btn-danger={isDanger} class:btn-menu={isMenu}>
    {@render children()}
</button>

{/if}

<style>
    a{
        display: block;
    }
    .btn
    {
        padding: 12px 24px;
        min-width: 230px;
        text-align: center;
        background-color: black;
        border-radius: 12px;
        color: white;
        border: 1px solid white;
        font-weight: normal;
        font-size: 22px;
        text-decoration: none;
    }

    .btn-secondary
    {
        background-color: white;
        color: black;
        border: 1px solid black;
    }

    .btn-danger
    {
        background-color: rgb(136, 4, 4);
        color: white;
        border: 1px solid white;
    }

    .btn-menu
    {
        min-width: 150px;
        padding: 8px 20px;
    }

    .btn:hover
    {
        background-color: rgb(55, 55, 55);
        transition: all 0.3s linear;
    }

    .btn:active
    {
        box-shadow: 0 0 30px black inset;
        transition: all 0.3s linear;
    }

    .btn-secondary:hover
    {
        background-color: rgb(240, 240, 240);
        transition: all 0.3s linear;
    }

    .btn-secondary:active
    {
        box-shadow: 0 0 30px black inset;
        transition: all 0.3s linear;
    }

    .btn-danger:hover
    {
        background-color: rgb(91, 1, 1);
        transition: all 0.3s linear;
    }

    .btn-danger:active
    {
        box-shadow: 0 0 30px black inset;
        transition: all 0.3s linear;
    }

</style>