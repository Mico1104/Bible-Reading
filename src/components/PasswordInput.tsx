import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";


export const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className = "", ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input {...props} ref={ref} type={visible ? "text" : "password"}
            className={`w-full rounded-xl border border-(--border) bg-(--surface) px-4 py-3 pr-11 text-(--text) placeholder:text-(--muted) focus:border-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/20 ${className}`}
            />
            <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-(--muted-strong) hover:text-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/30"
            >
                {visible ? <EyeOff size={18}/> : <Eye size={18}/> }
            </button>
        </div>
    )
})

PasswordInput.displayName ="PasswordInput"
