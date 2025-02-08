<script lang="ts">
    import "./../app.css";
    import {Header} from "$components";
    import { invalidate } from '$app/navigation';
    import {setUserState} from '$components/state/user-state.svelte'

    let { data, children } = $props();
    let { session, supabase, user } = $derived(data);

    let userState = setUserState
    ({
      session: data.session, 
      user: data.user,
      supabase: data.supabase
    });

    $effect(() => {
      userState.updateState({session, user, supabase});
    })

    $effect(() => {const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth');
      }
    });

    return () => data.subscription.unsubscribe();
    });
</script>

<Header />
{@render children()}