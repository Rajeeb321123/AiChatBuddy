'use client';

import { useTheme } from "next-themes";
import { useToast } from "./ui/use-toast";
import { BeatLoader } from 'react-spinners';
import { Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import BotAvatar from "./bot-avatar";
import UserAvatar from "./user-avatar";
import { Button } from "./ui/button";

export interface ChatmessageProps {
    role: "system" | "user";
    content?: string;
    isLoading?: boolean;
    src?:string | null;
}

export const ChatMessage = ({
    role,
    content,
    isLoading,
    src
}: ChatmessageProps) => {
    const { toast } = useToast();
    const { theme } = useTheme();

    // V.IMP copyfunction
    const onCopy = () => {
        if (!content) {
            return;
        };

        // for copying to clipboard
        navigator.clipboard.writeText(content);
        toast({
            description: "Message copied to clipboard"
        });
    };

    return(
        <div
            className={cn(
                "group flex items-start gap-x-3 py-4 w-full",
                role === 'user' && "justify-end"

            )}
        >
            {role !== "user" && src && <BotAvatar src={src}/>}
            <div className="rounded-md px-4 py-2 max-w-sm text-sm bg-primary/10">
                {isLoading
                    ? (<BeatLoader 
                        size={5}
                        color={theme === 'light' ? 'black' : 'white'}/>)
                    : content
                }
            </div>
            {role === 'user' && <UserAvatar/>}

            {/*for copy to clipboard  */}
            {role !== 'user' && !isLoading && (
                <Button
                    onClick={onCopy}
                    className="opacity-0 group-hover:opacity-100 transition"
                    size='icon'
                    variant='ghost'
                >
                    <Copy
                        className="w-4"
                    />
                </Button>
            )}
        </div>
    )
}