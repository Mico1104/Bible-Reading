import { QueryClient, MutationCache } from "@tanstack/react-query";
import {toast} from 'sonner'
import { getFriendlyErrorMessage } from "./errorMessage";

export const queryClient = new QueryClient({
    mutationCache: new MutationCache({
        onError: (error) => {
            toast.error(getFriendlyErrorMessage(error))
        }
    })
});
