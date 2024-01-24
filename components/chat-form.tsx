'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo } from "react";
import { ChatRequestOptions } from 'ai';
import { SendHorizonal } from "lucide-react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import UploadSpeech from "./upload-Speech";
import ClientOnly from "./ClientOnly";
import { useToast } from "@/components/ui/use-toast";

interface ChatFormProps {
    input: string;
    handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions | undefined) => void;
    isLoading: boolean;
    setInput: any;
};

export const ChatForm = ({
    input,
    handleInputChange,
    onSubmit,
    isLoading,
    setInput
}: ChatFormProps) => {

    const { toast } = useToast();

    useMemo(() => {
        if(!!input &&input.length <= 13 && input.toLocaleLowerCase().includes('go somewhere')) {
            toast({
                description: "Going somewhere",
                duration: 3000,
            });
            setInput('')
        }
    }, [input, setInput, toast])
    

    return (
        <ClientOnly>

            <div
                className="
                flex
                flex-row
                justify-between
                border-t border-primary/10
                "
            >
                <form
                    onSubmit={onSubmit}
                    className=" flex-1  py-4 flex items-center gap-x-2"
                >
                    <Input
                        disabled={isLoading}
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type a message"
                        className="rounded-lg bg-primary/10"
                    />
                    <Button disabled={isLoading} variant="ghost" className="bg-[#63c2db]">
                        <SendHorizonal className="" />
                    </Button>
                </form>
                <div
                    className=" py-4 flex justify-center items-center ml-2 px-3  gap-x-2  my-auto  "
                >
                    <UploadSpeech
                        isLoading={isLoading}
                        input={input}
                        handleInputChange={handleInputChange}
                        onSubmit={onSubmit}
                        setInput={setInput}
                    />
                </div>
            </div>
        </ClientOnly>
    )
};