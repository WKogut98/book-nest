<script lang="ts">
    import {Button, StarRating} from "$components";
    import { getUserState, type Book } from "$lib/state/user-state.svelte";
    import Icon from "@iconify/svelte";
    import Dropzone from "svelte-file-dropzone";

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
    let showDeleteConfirmation = $state(false);

    let title = $state(data.book.title);
    let author = $state(data.book.author);
    let description = $state(data.book.description || "");
    let genre = $state(data.book.genre || "");

    function goBack()
    {
        history.back();
    }

    async function handleDrop(e:CustomEvent<any>)
    {
        const {acceptedFiles} = e.detail;
        if(acceptedFiles.length)
        {
            const file = acceptedFiles[0] as File;
            await userContext.uploadBookCover(file, book.id);
        }
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

    function confirmDeleteBook()
    {
        userContext.deleteBookFromLibrary(book.id);
        showDeleteConfirmation = false;
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
                <Button isDanger={true} onclick={()=>showDeleteConfirmation=true}>Delete from library</Button>
            </div>
        </div>
        <div class="book-cover">
            {#if book.cover_image}
            <img src={book.cover_image} alt=""/>
            {:else}
            <Dropzone multiple={false} accept="image/*"
                maxSize={5*1024*1024}
                containerClasses = {"dropzone-cover"}
                on:drop={handleDrop}>
                <Icon icon="akar-icons:plus" width="40"/>
                <p>Add cover</p>
            </Dropzone>
            {/if}
        </div>  
    </div>
</div>

<!-- Confirmation Popup -->
{#if showDeleteConfirmation}
<div class="popup-overlay">
    <div class="popup">
        <p class="mb-m">Are you sure you want to delete this book?</p>
        <div class="popup-buttons">
            <Button isDanger={true} onclick={confirmDeleteBook}>Yes, Delete</Button>
            <Button isSecondary={true} onclick={() => (showDeleteConfirmation = false)}>Cancel</Button>
        </div>
    </div>
</div>
{/if}

<style>
    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .popup{
        width: 30%;
        height: 20%;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border-radius: 15px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
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

    :global(.dropzone-cover)
    {
        height: 100%;
        border-radius: 15px !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        border: none !important;
        cursor: pointer;
    }
</style>