import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query"

type AskAboutPassageInput = {
    question: string;
    passageText: string;
    passageReference: string;
    responseLanguage: string;
}


export const useAskAboutPassage = () => {
return useMutation({
    mutationFn: async ({
        question,
        passageText,
        passageReference,
        responseLanguage,
    }: AskAboutPassageInput) => {
        const {data, error} = await supabase.functions.invoke("ask-about-passage",{
            body: {question, passageText, passageReference, responseLanguage}
        });
        if(error) throw error;
        return data.answer as string;
    }
})
}