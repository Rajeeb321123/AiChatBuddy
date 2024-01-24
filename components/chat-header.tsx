"use client";

import { ChevronLeft, Edit, MessagesSquare, MoreVertical, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";


import { Companion, Message } from "@prisma/client";
import { Button } from "./ui/button";
import BotAvatar from "./bot-avatar";
import { useUser } from "@clerk/nextjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useToast } from "./ui/use-toast";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import useLanguageSet from "@/hooks/useLanguageSet";
import UploadButton from "./UploadButton";

interface ChatHeaderProps {
    companion: Companion & {
        messages: Message[];
        _count: {
            messages: number;
        };
    };

};

export const ChatHeader = ({
    companion,

}: ChatHeaderProps) => {
    const router = useRouter();
    const { user } = useUser();
    const { toast } = useToast();
    const languageSet = useLanguageSet();

    console.log(languageSet.lang)

    const onDelete = async () => {
        try {
            await axios.delete(`/api/companion/${companion.id}`);

            toast({
                description: "Deleted successfully"
            });

            // to get the latest data
            router.refresh();

            router.push("/");
        }
        catch (error) {
            toast({
                description: "Something went Wrong",
                variant: "destructive"
            })
        }
    }

    return (
        <div
            className="flex w-full justify-between items-center border-b border-primary/10 pb-4"
        >
            {/* button to go back */}
            <div
                className="flex gap-x-2 items-center bg-[#c70039]  text-white py-1 px-3 rounded-md"
            >
                {/* <Button
                    onClick={() => router.back()}
                    size='icon' variant='ghost'
                >
                    <ChevronLeft
                        className="h-8 w-8"
                    />
                </Button> */}
                <BotAvatar
                    src={companion.src!}
                />
                <div
                    className="flex flex-col gap-y-1"
                >
                    <div
                        className="flex items-center gap-x-2"
                    >
                        <p
                            className="font-bold"
                        >
                            {companion.name}
                        </p>
                        <div
                            className="
                                flex items-center text-xs text-white
                            "
                        >
                            <MessagesSquare
                                className="w-3 h-3 mr-1"
                            />
                            {companion._count.messages}
                        </div>
                    </div>
                    <p
                        className="text-xs text-white"
                    >
                        Created by  {companion.userName}
                    </p>

                </div>

            </div>
            <UploadButton/>

            {user?.id === companion.userId && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size='icon'
                            variant="secondary"
                        >
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => router.push(`/companion/${companion.id}`)}
                        >
                            <Edit className='w-4 h-4 mr-2' />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={onDelete}
                        >
                            <Trash className='w-4 h-4 mr-2' />
                            Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            
                        >
                            <Select
                                onValueChange={languageSet.change} defaultValue={languageSet.lang}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="change the language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value='en-US'>English</SelectItem>
                                        <SelectItem value='ne-NP'>Nepali</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    )
}
