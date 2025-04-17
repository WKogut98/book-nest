<script lang="ts">
    import Dropzone from "svelte-file-dropzone";
    import Icon from "@iconify/svelte";
    import { convertFileToBase64 } from "$lib/utils/helpers";
    import {Button} from "$components";

    let isLoading = $state(false);
    let errorMessage = $state("");
    let recognizedBooks = $state<OpenAIBook[]>([]);
    let booksAddSuccess = $state(false);

    interface OpenAIBook
    {
        author: string;
        bookTitle: string;
    }

    async function handleDrop(e: CustomEvent<any>) {
        const { acceptedFiles } = e.detail;
        if (acceptedFiles.length) {
            isLoading = true;
            const fileToSend = acceptedFiles[0] as File;
            const base64String = await convertFileToBase64(fileToSend);
            try
            {
                const response = await fetch("/api/scan-shelf", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    base64: base64String,})
            });

            const result = await response.json() as {bookArray: OpenAIBook[]};

            recognizedBooks = result.bookArray;
            console.log(result);
            console.log(`Response on the front-end: ${response}`);
            isLoading = false;
            }
            catch (error) {
                errorMessage = "An error occurred while processing the image. Please try again.";
            }
        }
        else
        {
            errorMessage = "Could not upload the image. Please try again. Images have to be smaller than 10MB.";
        }
    }
</script>

<h2 class="mt-m mb-l">Take a picture to add books</h2>
{#if recognizedBooks.length===0}
<div class="upload-area">
    <div class="upload-container">
        {#if errorMessage}
           <h4 class="text-center mb-s upload-error">{errorMessage}</h4>>
        {/if}
        {#if isLoading}
            <div class="spinner-container">
                <div class="spinner"></div>
                <p class="text-center">Processing image...</p>
            </div>
            
        {:else}
        <Dropzone on:drop={handleDrop} multiple={false} accept="image/*" maxSize={10*1024*1024}
            containerClasses = {"dropzone-cover"}>
            <Icon icon="bi:camera-fill" width="40px"/>
            <p>Drop a picture of your shelf or select a file</p>
        </Dropzone>
        {/if}
    </div>
</div>
{:else if !booksAddSuccess}
    <div class="found-books">
        <table class="book-list mb-m">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {#each recognizedBooks as book, i}
                    <tr>
                        <td>{book.bookTitle}</td>
                        <td>{book.author}</td>
                        <td><button type="button" aria-label="Remove book" class="remove-book"
                            onclick={()=>console.log(`Delete book with index ${i}`)}>
                            <Icon icon="streamline:delete-1-solid" width="24"/>
                        </button></td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <Button onclick={()=>console.log("Add books to library")}>Add all</Button>
    </div>
{:else}
    <h4>The selected {recognizedBooks,length} books have been added</h4>
    <Button href="/private/dashboard">Go back</Button>
{/if}