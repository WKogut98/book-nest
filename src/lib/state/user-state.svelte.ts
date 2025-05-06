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

export interface OpenAIBook
{
    author: string;
    bookTitle: string;
}

type UpdatableBookFields = Omit<Book, "id" | "user_id" | "created_at">;

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

    async uploadBookCover(file: File, bookId: number)
    {
        if(!this.user || !this.supabase) return;

        const filePath = `${this.user.id}/${new Date().getTime()}_${file.name}`;

        const {error: uploadError} = await this.supabase.storage.from("book-covers").upload(filePath, file);
        if(uploadError)
        {
           return console.log(uploadError);
        }

        const {data: {publicUrl}} = this.supabase.storage.from("book-covers").getPublicUrl(filePath);
        await this.updateBook(bookId, {cover_image: publicUrl});
    }


    async deleteBookFromLibrary(bookId: number)
    {
        if(!this.supabase) return;
        const {error, status} = await this.supabase.from("books").delete().eq("id", bookId);
        if(!error && status === 204)
        {
            this.allBooks = this.allBooks.filter((book) => book.id !== bookId);
        }
        else console.log(error);
        goto("/private/dashboard");
    }

    async addBooksToLibrary(books: OpenAIBook[])
    {
        if(!this.supabase || !this.user) return;
        const userID = this.user.id;
        const processedBooks = books.map((book) => ({
            title: book.bookTitle,
            author: book.author,
            user_id: userID,
        }));

        const {error} = await this.supabase.from("books").insert(processedBooks);
        if(error)
        {
            throw new Error(error.message);
            return;
        }
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

    async updateAccountData(email: string, userName: string)
    {
        if(!this.session) return;

        try
        {
            const response = await fetch("/api/update-account", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.session.access_token}`
                },
                body: JSON.stringify({
                    email,
                    userName
                })
            });

            if(response.ok) this.userName = userName;
        }
        catch(error)
        {
            console.log("Failed to update account data", error);
        }
    }

    getBookById(bookId: number)
    {
        return this.allBooks.find((book) => book.id === bookId);
    }

    async updateBook(bookId: number, updateObject: Partial<UpdatableBookFields>)
    {
        if(!this.supabase) return;
        const {status, error} = await this.supabase.from("books").update(updateObject).eq("id", bookId);
        
        if(status === 204 && !error)
        {
             this.allBooks = this.allBooks.map((book) => {
                if(book.id === bookId)
                {
                    return {...book, ...updateObject};
                }
                else return book;
             });
        }
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