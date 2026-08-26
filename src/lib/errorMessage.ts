type SupabaseLikeError = {
    code?: string;
    message?: string;
}

export const getFriendlyErrorMessage = (error: unknown): string => {
    const err = error as SupabaseLikeError;

    switch(err?.code) {
        case "23505":
            return "That already exists - no changes needed.";
        case "23503":
            return "That item couldn't be found. Please refresh and try again.";
        case "PGRST116":
            return "We couldn't find what you were looking for.";
        case "invalid_credentials":
            return "Incorrect email/username or password.";
        default:
            break;
    }

    if(err?.message?.includes("Email not confirmed")){
        return "Please confirm your email before logging in";
    }
    if(err?.message?.includes("User already registered")){
        return "An account with that email already exist"
    }

    return "Something went wrong. Please try again."
}

