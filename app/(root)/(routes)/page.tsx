

import { auth, redirectToSignIn, RedirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { ChatClient } from "./components/client";


const ChatIdPage = async ({

}) => {

    const { userId } = auth();

    if (!userId) {
        return <RedirectToSignIn/>
    };

    const companion = await prismadb.companion.findUnique({
        where: {
            userId
        },
        include: {
            messages: {
                orderBy: {
                    createdAt: "asc",
                },
                where: {
                    userId,
                }
            },
            _count: {
                select: {
                    messages: true
                }
            }
        }
    });

    if (!companion) {
        return redirect('/companion/new')
    };

    return (
        <ChatClient 
            companion={companion}
        />
    )
}

export default ChatIdPage