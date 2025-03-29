<script lang="ts">
    import {Button, StarRating} from "$components";
    import { getUserState, type Book } from "$lib/state/user-state.svelte";
    import Icon from "@iconify/svelte";

    interface BookPageProps
    {
        data: {
            book: Book
        };
    }

    let userContext = getUserState();
    let {data}:BookPageProps = $props();
    let book = $derived(userContext.getBookById(data.book.id) || data.book);
    let isEditMode = $state(false);

    let title = $state(data.book.title);
    let author = $state(data.book.author);
    let description = $state(data.book.description || "");
    let genre = $state(data.book.genre || "");

    function goBack()
    {
        history.back();
    }

    async function toggleEditModeOrSave()
    {
        if(isEditMode)
        {
            await userContext.updateBook(book.id, {title, author, description, genre});
        }
        isEditMode = !isEditMode;
    }

    async function updateReadingStatus()
    {
        const startedReading = Boolean(book.started_reading_on);
        if(startedReading)
        {
            await userContext.updateBook(book.id, {finished_reading_on: new Date().toISOString()});
        }
        else
        {
            await userContext.updateBook(book.id, {started_reading_on: new Date().toISOString()});
        }
    }

    async function updateDatabaseRating(rating: number)
    {
        await userContext.updateBook(book.id, {rating});
    }
</script>

{#snippet statusButtons()}
{#if !book.finished_reading_on}
<Button isSecondary={true} onclick={updateReadingStatus}>
   {book.started_reading_on ? "I finished it" : "I've started reading it"}
</Button>
{/if}
{/snippet}

{#snippet bookInfo()}
<h2 class = "book-title mt-m">{book.title}</h2>
<p class = "book-author">{book.author}</p>
<h4 class="mt-m mb-xs semi-bold">Your rating:</h4>
<StarRating value={book.rating||0} {updateDatabaseRating}/>
<p class="small-font">Click to {book.rating ? "update rating" : "rate"}</p>
{#if book.genre}
<h4 class="mt-m mb-xs semi-bold">Genre</h4>
<p>{book.genre}</p>
{/if}
<h4 class = "mt-m mb-xs semi-bold">Description</h4>
{#if book.description}
<p class="mb-m">{book.description}</p>
{:else}
<p class="mb-m">No description yet</p>
<button class = "block mb-m" onclick = {() => toggleEditModeOrSave()}>Add description</button>
{/if}
    {@render statusButtons()}
{/snippet}

{#snippet editFields()}
    <form>
        <input class = "input input-title mt-m mb-xs" bind:value={title} type="text" name="title"/>
        <div class="input-author">
            <p>by</p>
            <input class = "input" bind:value={author} type="text" name="author"/>
        </div>
        <h4 class="mt-m mb-xs semi-bold">Your rating:</h4>
        <StarRating value={book.rating||0} {updateDatabaseRating}/>
        <p class="small-font">Click to {book.rating ? "update rating" : "rate"}</p>
        <h4 class="mt-m mb-xs semi-bold">Genre</h4>
        <input class = "input" bind:value={genre} type="text" name="genre"/>
        <h4 class = "mt-m mb-xs semi-bold">Description</h4>
        <textarea class = "textarea mb-m" name="description" bind:value={description} placeholder="Write a short summary of what the book is about.">
        </textarea>
        {@render statusButtons()}
    </form>
{/snippet}

<div class="book-page">
    <button onclick={goBack} aria-label="Go back">
        <Icon icon="ep:back" width="40"/>
    </button>
    <div class="book-container">
        <div class="book-info">
            {#if isEditMode}
                {@render editFields()}
            {:else}
                {@render bookInfo()}
            {/if}
            <div class="buttons-container mt-m">
                <Button isSecondary={true} onclick={()=>toggleEditModeOrSave()}>{isEditMode? "Save Changes" : "Edit"}</Button>
                <Button isDanger={true} onclick={()=>console.log("Delete")}>Delete from library</Button>
            </div>
        </div>
        <div class="book-cover">
            {#if book.cover_image}
            <img src={book.cover_image} alt=""/>
            {:else}
            <button class="add-cover">
                <Icon icon="akar-icons:plus" width="40"/>
                <p>Add cover</p>
            </button>
            {/if}
        </div>  
    </div>
</div>

<style>
    .book-container
    {
        display: flex;
        justify-content: flex-start;
    }
    .book-info
    {
        width: 50%;
    }
    .book-cover
    {
        width: 40%;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid black;
        border-radius: 15px;
        min-height: 400px;
        max-width: 450px;
        margin-left: 80px;
    }
    .book-cover img
    {
        object-fit: cover;
        width: 100%;
        height: 100%;
        border-radius: inherit;
    }
    .add-cover
    {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .input
    {
        padding: 8px 4 px;
        width: 100%;
    }
    .textarea
    {
        width: 100%;
    }
    .input-title
    {
        font-size: 60px;
        font-weight: bold;
        font-family: "EB Garamond", serif;
    }
    .input-author
    {
        display: flex;
        align-items: center;
    }
    .input-author p
    {
        margin-right: 8px;
    }
</style>