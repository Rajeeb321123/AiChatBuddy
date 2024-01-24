'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect } from "react";
import { ChatRequestOptions } from 'ai';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Mic, SendHorizonal, MicOff } from 'lucide-react';
import { Eraser } from "lucide-react";
import { Textarea } from "./ui/textarea";
import useLanguageSet from "@/hooks/useLanguageSet";

// for speech upload or recognition
import { useSpeechRecognition, stopRecording } from "@/hooks/useSpeechRecognition";
import Image from "next/image";






interface ChatFormProps {
    input: string;
    handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions | undefined) => void;
    isLoading: boolean;
    setInput: any
};


const UploadSpeech = ({
    input,
    handleInputChange,
    onSubmit,
    isLoading,
    setInput
}: ChatFormProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const lang = useLanguageSet().lang;
    
    


    console.log("recording",isRecording)
    const StartListening = () => {
        
        setIsRecording(true);
    }

    const StopListening = () => {
        stopRecording();
        setIsRecording(false);

    }
    // const {} = useSpeechRecognition({speechR});


    return (
        <>
            {(
                <Dialog

                    open={isOpen}
                    onOpenChange={(v) => {
                        if (!v) {
                            setIsOpen(v);
                        }
                        if (v === true) {
                            useSpeechRecognition({ setInput, lang })
                            setIsRecording(true);
                        }
                        else {
                            stopRecording();
                            setIsRecording(false);
                        }
                        console.log('v', v)
                    }}
                >
                    <DialogTrigger
                        // DialogTrigger is button in itself so, we use asChild so we are able to pass another button
                        asChild
                        onClick={() => { setIsOpen(true) }}
                    >
                        <Button
                            disabled={isLoading}

                        >

                            <Mic
                                className='hover:cursor-pointer hover:text-[#c70039]'
                            />
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <form
                            onSubmit={onSubmit}
                            className=" flex-1  py-4 flex items-center gap-x-2"
                        >
                            <Textarea
                                disabled={isLoading}
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Type a message"
                                className="rounded-lg bg-primary/10 h-[400px] "
                            />
                            <div
                                className="
                                flex
                                flex-col
                                space-y-2
                                items-center
                                "
                            >
                                <DialogTrigger
                                    // DialogTrigger is button in itself so, we use asChild so we are able to pass another button
                                    asChild
                                    onClick={() => { setIsOpen(true) }}
                                >
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        variant="ghost"
                                        className="bg-[#63c2db]"
                                        onClick={StopListening}
                                    >
                                        <SendHorizonal className="" />
                                    </Button>
                                </DialogTrigger>
                                
                                <Button
                                    type="button"
                                    disabled={isLoading}
                                    className="relative"
                                >
                                    {isRecording ?
                                        <Image
                                            src="/listening.gif"
                                            alt=""
                                            fill
                                            onClick={StopListening}
                                            className='hover:cursor-pointer'
                                        /> :
                                        <MicOff
                                            onClick={StartListening}
                                            className='hover:cursor-pointer hover:text-[#c70039]'
                                        />
                                    }
                                </Button>
                                <Button type="button" 
                                    disabled={isLoading}
                                    onClick={()=>setInput("")}
                                >
                                    <Eraser className="text-red-500" />
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}

export default UploadSpeech;