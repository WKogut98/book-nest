<script lang="ts">
    import { getUserState } from "$lib/state/user-state.svelte";

    let userContext = getUserState();
    let {allBooks} = $derived(userContext);

    $inspect(allBooks);
</script>

<ul>
{#each allBooks as book}
    <li>
        <h4>{book.title}</h4>
        <p>{book.author}</p>
    </li>
{/each}
</ul>