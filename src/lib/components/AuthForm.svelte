<script lang="ts">
    import type { ActionData } from "../../routes/register/$types";
    import Button from "./Button.svelte";

    interface ComponentProps{
        isRegistration: boolean;
        form: ActionData;
    }
    let {isRegistration, form}: ComponentProps = $props();
    let title = isRegistration ? "Create Account" : "Log In";
</script>
<div class="auth-container default-margin">
    <h1 class = "mb-l">{title}</h1>
    <div class="form-and-social-login">
        <form class = "auth-form" method="POST">
            {#if form && form.errors?.length}
            {#each form.errors as error}
                <div class="auth-error">{error}</div>
            {/each}
            {/if}
            {#if isRegistration}
                <input placeholder="Userame" type="text" name="username"
                value={form?.username || ""}/>
            {/if}
            <input placeholder="Email" type="text" name="email"
            value={form?.email || ""}/>
            <input placeholder="Password" type="password" name="password"
            value={form?.password || ""}/>
            {#if isRegistration}
                <input placeholder="Confirm password" type="password" name="passwordConfirmation"
                value={form?.passwordConfirmation || ""}/>
            {/if}
            <Button type="submit">{title}</Button>
            {#if isRegistration}
                <p class="auth-hint mt-s">Already have an account? <a href="/login">Log In</a></p>
            {:else}
                <p class="auth-hint mt-s">Don't have an account? <a href="/register">Sign Up</a></p>
            {/if}
        </form>
        <div class="social-login">
        </div>
    </div>
</div>

<style>
    .auth-container{
        margin-top: 80px;
    }
    .form-and-social-login{
        display: flex;
    }
    .auth-form{
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        border-right: 1px solid gray;
        padding-right: 80px;
        width: 40%;
    }
    .auth-form input{
        
        width: 100%;
        margin-bottom: 12px;
    }
    .auth-form input:last-of-type{
        margin-bottom: 30px;
    }
    .auth-hint{
        font-size: 16px;
        color: gray;
    }
    .auth-error{
        background-color: rgb(122, 35, 35);
        color: white;
        font-size: 18px;
        border-radius: 12px;
        padding: 12px;
        width: 100%;
        margin-bottom: 8px;
    }
    .auth-error:last-of-type{
        margin-bottom: 16px;
    }
    .social-login{
        padding-left: 80px;
        width: 40%;
    }
</style>