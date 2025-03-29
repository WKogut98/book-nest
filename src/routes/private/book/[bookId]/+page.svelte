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

    let {data}:BookPageProps = $props();
    let book = $derived(data.book);
    let userContext = getUserState();

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
</script>

{#snippet bookInfo()}
<h2 class = "book-title mt-m">{book.title}</h2>
<p class = "book-author">{book.author}</p>
<h4 class="mt-m mb-xs semi-bold">Your rating:</h4>
<StarRating value={book.rating||0} />
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
<button class = "block mb-m" onclick = {() =>console.log("Toggle edit mode")}>Add description</button>
{/if}
{#if !book.finished_reading_on}
<Button isSecondary={true} onclick={() => console.log("update reading status")}>
   {book.started_reading_on ? "I finished it" : "I've started reading it"}
</Button>
{/if}
{/snippet}

<div class="book-page">
    <button onclick={goBack} aria-label="Go back">
        <Icon icon="ep:back" width="40"/>
    </button>
    <div class="book-container">
        <div class="book-info">
            {@render bookInfo()}
        </div>
        <div class="book-cover">
            {#if book.cover_image}
            <img src={book.cover_image} alt=""/>
            {:else}
            <Dropzone multiple={false} accept="image/*"
                maxSize={5*1024*1024}
                containerClasses = {"add-cover"}
                on:drop={handleDrop}>
                <Icon icon="akar-icons:plus" width="40"/>
                <p>Add cover</p>
            </Dropzone>
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
        max-width: 350px;
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
</style>