<script lang="ts">
    import Dropzone from "svelte-file-dropzone";
    import Icon from "@iconify/svelte";
    import { convertFileToBase64 } from "$lib/utils/helpers";

    let isLoading = $state(false);

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
            console.log(result);
            console.log(`Response on the front-end: ${response}`);
            }
            catch (error) {
                console.error("Error uploading file:", error);
            }
        }
    }
</script>

<h2 class="mt-m mb-l">Take a picture to add books</h2>
<div class="upload-area">
    <div class="upload-container">
        <Dropzone on:drop={handleDrop} multiple={false} accept="image/*" maxSize={10*1024*1024}
            containerClasses = {"dropzone-cover"}>
            <Icon icon="bi:camera-fill" width="40px"/>
            <p>Drop a picture of your shelf or select a file</p>
        </Dropzone>
    </div>
</div>