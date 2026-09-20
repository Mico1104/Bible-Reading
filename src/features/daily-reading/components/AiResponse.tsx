import { formatInlineMarkdown } from "./formatInlineMarkdown";

export const AiResponse = ({ text }: { text: string }) => {
  const lines = text.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          return <div key={index} className="h-1" />;
        }

        // Headings
        if (trimmedLine.startsWith("### ")) {
          return (
            <p key={index} className="font-semibold text-(--text)">
              {formatInlineMarkdown(trimmedLine.slice(4))}
            </p>
          );
        }

        if (trimmedLine.startsWith("## ")) {
          return (
            <p key={index} className="font-semibold text-base text-(--text)">
              {formatInlineMarkdown(trimmedLine.slice(3))}
            </p>
          );
        }

        if (trimmedLine.startsWith("# ")) {
          return (
            <p key={index} className="font-display text-lg text-(--text)">
              {formatInlineMarkdown(trimmedLine.slice(2))}
            </p>
          );
        }

        // Bullet points
        if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
          return (
            <div key={index} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-(--primary)" />
              <p className="min-w-0 flex-1">
                {formatInlineMarkdown(trimmedLine.slice(2))}
              </p>
            </div>
          );
        }

        // Numbered lists
        const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)$/);

        if (numberedMatch) {
          return (
            <div key={index} className="flex gap-2">
              <span className="shrink-0 font-semibold text-(--primary)">
                {numberedMatch[1]}.
              </span>
              <p className="min-w-0 flex-1">
                {formatInlineMarkdown(numberedMatch[2])}
              </p>
            </div>
          );
        }

        // Normal paragraph
        return <p key={index}>{formatInlineMarkdown(trimmedLine)}</p>;
      })}
    </div>
  );
};