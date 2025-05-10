<script lang="ts">
    import { getUserState } from "$lib/state/user-state.svelte";
    import type { Book } from "$lib/state/user-state.svelte";
    import Icon from "@iconify/svelte";
    import {BookCategory} from '$components';

    let userContext = getUserState();
    let {userName, allBooks} = $derived(userContext);
    let favoriteGenre = $derived.by(()=>userContext.getFavoriteGenre());

</script>

<div class="dashboard">
    <div class="dashboard-header mb-m">
        <a href="/private/scan-shelf" class="add-book">
            <Icon icon = "icons8:plus" width={"72"} height={"72"}/>
            <p>Add new book</p>
        </a>
    <div class="headline">
        <h3 class="bold mb-xs">Welcome back, {userName}</h3>
    </div>
    </div>
    {#if allBooks.length}
        {#if userContext.getCurrentlyReadingBooks().length}
            <BookCategory books={userContext.getCurrentlyReadingBooks()} categoryName={"Currently reading"}/>
        {/if}
        {#if userContext.getHighestRatedBooks().length}
            <BookCategory books={userContext.getHighestRatedBooks()} categoryName={"Your favorite Books"}/>
        {/if}
        <BookCategory books={userContext.getNewestUnreadBooks()} categoryName={"Recently Added"}/>
        {#if userContext.getFavoriteGenre()}
            <BookCategory books={userContext.getHighestRatedBooksFromFavoriteGenre(favoriteGenre)} 
                categoryName={`From your favorite genre - ${favoriteGenre}`}/>
        {/if}
    {:else}
        <div class="upload-hint">
            <h3>You have no books.</h3>
        </div>
    {/if}
</div>

<style>
    .dashboard-header{
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        width: 100%;
    }
    .add-book{
        display: flex;
        align-items: center;
        text-decoration: none;
    }
    .add-book p
    {
        margin-left: 8px;
    }
    .add-book:hover
    {
        color: darkgray;
        transition: linear 0.3s all;
    }
    .headline
    {
        text-align: right;
        max-width: 30%;
        min-width: 300px;
    }
</style>