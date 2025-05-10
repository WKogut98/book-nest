<script lang="ts">
    import {getUserState} from "$lib/state/user-state.svelte";
    import {Button} from "$components";

    let userContext = getUserState();
    let userName = $state(userContext.userName || "");
    let email = $state(userContext.user?.email || "");
    let isEditMode = $state(false);

    let averageRating = $derived.by(() => {
        const booksWithRating = userContext.allBooks.filter((book) => book.rating);

        if(booksWithRating.length === 0) {
            return "No ratings yet";
        }

        const ratingSum = booksWithRating.reduce((acc, book) => {
            return acc + book.rating!;}, 0);
        const average = ratingSum / booksWithRating.length;
        return average.toFixed(2);
    });

    $effect(() => {
        if (userContext.userName) {
            userName = userContext.userName;
        }
    });

    async function toggleEditModeAndSave() {
        if(isEditMode)
        {
            await userContext.updateAccountData(email, userName);
        }
        isEditMode = !isEditMode;
    }

    async function deleteAccount() {
        const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (confirmDelete) {
            await userContext.deleteAccount();
        }
    }
</script>

<div class="settings-page">
    <div class="settings-container">
        <h2>Settings</h2>
        <h5 class="mt-m mb-xs semi-bold">Username</h5>
        {#if isEditMode}
            <input type="text" name="userName" bind:value={userName} />
        {:else}
            <h3>{userName}</h3>
        {/if}
        <h5 class="mt-m mb-xs semi-bold">Email Address</h5>
        {#if isEditMode}
            <input type="text" name="email" bind:value={email} />
        {:else}
            <h3>{email}</h3>
        {/if}
        <div class="buttons-container mt-l">
            <Button isSecondary={true} onclick={toggleEditModeAndSave}>
                {isEditMode ? "Save Changes" : "Edit"}
            </Button>
            <Button isDanger={true} onclick={deleteAccount}>
                Delete Account
            </Button>
        </div>
    </div>
    <div class="stats-container">
        <h2 class="mb-m">Stats</h2>
        <h5 class="semi-bold">Books in Library</h5>
        <h4>{userContext.allBooks.length}</h4>
        <h5 class="semi-bold mt-m">Finished Books</h5>
        <h4>{userContext.allBooks.filter((book) => Boolean(book.finished_reading_on)).length}</h4>
        <h5 class="semi-bold mt-m">Average rating given</h5>
        <h4>{averageRating}</h4>
    </div>
</div>

<style>
    .settings-page
    {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    }
    .settings-container
    {
        margin-right: 80px;    
    }
    .settings-container input
    {
        width: 100%;
    }
    .stats-container
    {
        min-width: 25%;
        border-radius: 12px;
        padding: 8px 24px;
        background-color: rgba(39, 39, 39, 0.5);
        color: white;
    }
</style>