'use client';

import { ElementRef, useEffect, useRef, useState } from "react";

import { Companion } from "@prisma/client";
import { ChatMessage, ChatmessageProps } from "./chat-message";

interface ChatMessagesProps {
    messages: ChatmessageProps[];
    isLoading: boolean;
    companion: Companion;
}

const ChatMessages = ({
    messages = [],
    isLoading,
    companion,
}: ChatMessagesProps) => {
    const scrollRef = useRef<ElementRef<"div">>(null);

    // cool loading trick for first message , user first time using it , we dont want to do it every time it get annoying
    // Imp
    // Fake loading
    const [fakeLoading, setFakeLoading] = useState(messages.length === 0 ? true : false)

    useEffect(() => {
      const timeout = setTimeout(() => {
        setFakeLoading(false);
      },1000);
    
      return () => {
        clearTimeout(timeout);
      }
    }, []);

    // VVImp
    // useEffect to scroll to latest message
    useEffect(()=>{
        scrollRef?.current?.scrollIntoView({ behavior: "smooth"})   
    },[messages.length]);
    
    return (
        <div
            className="flex-1 overflow-y-auto pr-4"
        >
            {/* Fake message */}
            <ChatMessage
                src={companion.src}
                role="system"
                content={`hello , I am ${companion.name}, ${companion.description}`}
                isLoading={fakeLoading}
            />
            {/* actual message */}
            {messages.map((message, index) => (
                <ChatMessage
                    key={index}
                    role={message.role}
                    content={message.content}
                    src={companion.src}
                />
            ))}
            {/* when ai is loading the message */}
            {isLoading && (
                <ChatMessage
                    role="system"
                    src={companion.src}
                    isLoading
                />
            )}

             {/*scroll to latest message  */}
             <div ref={scrollRef}>

             </div>

        </div>
    )
}

export default ChatMessages