import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";

function isVelidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

interface RegisterReturnObject
{
    success: boolean;
    errors: string[];
}

export const actions = {
    default: async ({request, locals: {supabase}}) => {
        const formData = await request.formData();

        const username = formData.get("username") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const passwordConfirmation = formData.get("passwordConfirmation") as string;

        const returnObject: RegisterReturnObject ={
            success: true,
            errors: []
        }

        if(!username.length)
        {
            returnObject.errors.push("Username is required.");
            returnObject.success = false;
        }

        if(username.length && username.length < 3) 
        {
            returnObject.errors.push("Username must be at least 3 characters long.");
            returnObject.success = false;
        }

        if(!email.length)
        {
            returnObject.errors.push("Email is required.");
            returnObject.success = false;
        }

        if(email.length && isVelidEmail(email) === false)
        {
            returnObject.errors.push("Email is not valid.");
            returnObject.success = false;
        }

        if(!password.length)
        {
            returnObject.errors.push("Password is required.");
            returnObject.success = false;
        }

        if(password.length && password.length < 8)
        {
            returnObject.errors.push("Password must be at least 8 characters long.");
            returnObject.success = false;
        }

        if(!passwordConfirmation.length)
        {
            returnObject.errors.push("Password confirmation is required.");
            returnObject.success = false;
        }

        if(password !== passwordConfirmation)
        {
            returnObject.errors.push("Passwords do not match.");
            returnObject.success = false;
        }

        const response = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if(response && response.error)
        {
            returnObject.errors.push(response.error.message);
            returnObject.success = false;
            return fail(400, returnObject as any)
        }

        if(response && !response.data.user)
        {
            returnObject.errors.push("An error occured while trying to register.");
            returnObject.success = false;
            return fail(400, returnObject as any)
        }

        redirect(303, "/private/dashboard");

        return returnObject;
    }
}