import { goto } from "$app/navigation";
import type { Database } from "$lib/types/database.types";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { getContext, setContext} from "svelte";

interface UserStateProps
{
    session: Session | null;
    supabase: SupabaseClient | null;
    user: User | null;
}

export interface Book
{
    author: string | null
    cover_image: string | null
    created_at: string
    description: string | null
    finished_reading_on: string | null
    genre: string | null
    id: number
    rating: number | null
    started_reading_on: string | null
    title: string
    user_id: string
}

export class UserState
{
    session = $state<Session | null>(null);
    supabase = $state<SupabaseClient<Database> | null>(null);
    user = $state<User | null>(null);
    allBooks = $state<Book[]>([]);
    userName = $state<string | null>(null);

    constructor(data: UserStateProps)
    {
        this.updateState(data);
    }

    updateState(data: UserStateProps)
    {
        this.session = data.session;
        this.supabase = data.supabase;
        this.user = data.user;
        this.fetchUserData();
    }

    async logout()
    {
        await this.supabase?.auth.signOut();
        goto("/login"); 
    }

    async fetchUserData()
    {
        if(!this) return;
        if(!this.user || !this.supabase) return;

        const [booksResponse, userNamesResponse] = await Promise.all([
            this.supabase.from("books").select("*").eq("user_id", this.user.id),
            this.supabase.from("user_names").select("name").eq("user_id", this.user.id).single()
        ])

        if(booksResponse.error || !booksResponse.data || userNamesResponse.error || !userNamesResponse.data) 
        {
            console.log("Failed to fetch user data");
            console.log(booksResponse.error);
            console.log(userNamesResponse.error);
            return;
        }

        this.allBooks = booksResponse.data;
        this.userName = userNamesResponse.data.name;
    }
}

const USER_STATE_KEY = Symbol("USER_STATE");

export function setUserState(data: UserStateProps)
{
    return setContext(USER_STATE_KEY, new UserState(data));
}

export function getUserState()
{
    return getContext<ReturnType<typeof setUserState>>(USER_STATE_KEY);
}