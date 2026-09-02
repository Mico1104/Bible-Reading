import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";


export const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input {...props} ref={ref} type={visible ? "text" : "password"}
            className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            tabIndex={-1}
            >
                {visible ? <EyeOff size={18}/> : <Eye size={18}/> }
            </button>
        </div>
    )
})

PasswordInput.displayName ="PasswordInput"

