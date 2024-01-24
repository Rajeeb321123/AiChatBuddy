'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useRef } from "react";
import { ChatRequestOptions } from 'ai';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Mic, SendHorizonal, MicOff } from 'lucide-react';
import { Eraser } from "lucide-react";
import { Textarea } from "./ui/textarea";
import useLanguageSet from "@/hooks/useLanguageSet";

// for speech upload or recognition
// import { useSpeechRecognition, stopRecording } from "@/hooks/useSpeechRecognition";
import Image from "next/image";

// Declare a global interface to add the webkitSpeechRecognition property to the Window object
declare global {
    interface Window {
        webkitSpeechRecognition: any;
    }
}




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
    // State variables to manage recording status, completion, and transcript
    const [recordingComplete, setRecordingComplete] = useState(false);
    // const [transcript, setTranscript] = useState("");


    // Reference to store the SpeechRecognition instance
    const recognitionRef = useRef<any>(null);

    // Function to start recording
    const startRecording = () => {
        setIsRecording(true);
        // Create a new SpeechRecognition instance and configure it
        recognitionRef.current = new window.webkitSpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.lang = lang;
        // recognitionRef.current.interimResults = true;

        // Event handler for speech recognition results
        recognitionRef.current.onresult = (event: any) => {
            const { transcript } = event.results[event.results.length - 1][0];

            // Log the recognition results and update the transcript state
            console.log(event.results);
            // setTranscript(transcript);
            setInput((input: any) => input + transcript)
            console.log(transcript)

        };
        // setTranscript("")

        // Start the speech recognition
        recognitionRef.current.start();

    };

    useEffect(() => {
        return () => {
            // Stop the speech recognition if it's active
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Function to stop recording
    const stopRecording = () => {
        if (recognitionRef.current) {
            // Stop the speech recognition and mark recording as complete
            recognitionRef.current.stop();
            setRecordingComplete(true);
        }
    };

    // Toggle recording state and manage recording actions
    const handleToggleRecording = () => {
        setIsRecording(!isRecording);
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    };





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
                            if (!isRecording) {
                                startRecording();
                            }
                            // useSpeechRecognition({ setInput, lang })
                            // setIsRecording(true);
                        }
                        else {
                            if (isRecording === true) {
                                startRecording();
                            }
                            // stopRecording();
                            // setIsRecording(false);
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
                                        onClick={handleToggleRecording}
                                    >
                                        <SendHorizonal className="" />
                                    </Button>
                                </DialogTrigger>

                                <Button
                                    type="button"
                                    disabled={isLoading}
                                    className="relative"
                                    onClick={handleToggleRecording}
                                >
                                    {isRecording ?
                                        <Image
                                            src="/listening.gif"
                                            alt=""
                                            fill

                                            className='hover:cursor-pointer'
                                        /> :
                                        <MicOff
                                            // onClick={handleToggleRecording}
                                            className='hover:cursor-pointer hover:text-[#c70039]'
                                        />
                                    }
                                </Button>
                                <Button type="button"
                                    disabled={isLoading}
                                    onClick={() => setInput("")}
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