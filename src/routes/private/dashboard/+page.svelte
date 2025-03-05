<script lang="ts">
    import { getUserState } from "$lib/state/user-state.svelte";
    import Icon from "@iconify/svelte";
    import {BookCard} from '$components';

    let userContext = getUserState();
    let {userName, allBooks} = $derived(userContext);

    $inspect(allBooks);
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
    {#each allBooks as book}
        <BookCard {book}/>
    {/each} 
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