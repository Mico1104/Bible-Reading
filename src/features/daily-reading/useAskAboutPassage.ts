import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query"


export const useAskAboutPassage = () => {
return useMutation({
    mutationFn: async ({
        question,
        passageText,
        passageReference,
    }: {
        question: string;
        passageText: string;
        passageReference: string
    }) => {
        const {data, error} = await supabase.functions.invoke("ask-about-passage",{
            body: {question, passageText, passageReference}
        });
        if(error) throw error;
        return data.answer as string;
    }
})
}