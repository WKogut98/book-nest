import { fail, redirect } from "@sveltejs/kit";

function isVelidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

interface ReturnObject
{
    success: boolean;
    email: string;
    password: string;
    errors: string[];
    passwordConfirmation?: never;
    username?: never;
}

export const actions = {
    default: async ({request, locals: {supabase}}) => {
        const formData = await request.formData();

        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const returnObject: ReturnObject ={
            success: true,
            email,
            password,
            errors: []
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

        const response = await supabase.auth.signInWithPassword({
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