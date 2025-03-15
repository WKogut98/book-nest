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

    getHighestRatedBooks()
    {
        return this.allBooks.filter((book) => book.rating && book.rating>=4)
            .sort((a: Book, b: Book) => b.rating! - a.rating!)
            .slice(0,9);
    }

    getNewestUnreadBooks()
    {
        return this.allBooks.filter((book) => !book.started_reading_on && !book.finished_reading_on)
            .sort((a: Book, b: Book) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0,9);
    }
    getHighestRatedBooksFromFavoriteGenre(favoriteGenre : string)
    {
        return this.allBooks.filter((book) => book.rating && book.rating>=4 && book.genre.includes(favoriteGenre))
            .sort((a: Book, b: Book) => b.rating! - a.rating!)
            .slice(0,9);
    }
    getCurrentlyReadingBooks()
    {
        return this.allBooks.filter((book) => book.started_reading_on && !book.finished_reading_on)
            .sort((a: Book, b: Book) => new Date(b.started_reading_on!).getTime() - new Date(a.started_reading_on!).getTime())
            .slice(0,9);
    }

    getFavoriteGenre()
    {
        if(this.allBooks.length === 0) return null;
        const genreCounts: {[key: string]: number} = {};
        this.allBooks.forEach((book) => {
            const genres = book.genre?.split(", ") || [];
            genres.forEach((genre) => {
                //const trimmedGenre = genre.trim();
                if(genre)
                {
                    if(!genreCounts[genre]) genreCounts[genre] = 1;
                    else genreCounts[genre]++;
                }
            });
        });

        console.log(genreCounts);

        return Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b);
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