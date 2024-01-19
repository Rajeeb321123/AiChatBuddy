// MOST VVVVV imp part of this project
// this is where all the important things happen

import { StreamingTextResponse, LangChainStream, } from "ai";
import { auth, currentUser } from "@clerk/nextjs";
import { CallbackManager } from "langchain/callbacks";
import { NextResponse } from "next/server";
import { Replicate } from "langchain/llms/replicate";

import { MemoryManager } from "@/lib/memory"
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";


export async function POST(
    request: Request,
    { params }: { params: { chatId: string } }
) {
    try {
        const { prompt } = await request.json();
        const user = await currentUser();

        if (!user || !user.firstName || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        };

        // rate Limiting fro particular user
        const identifier = request.url + "-" + user.id;
        const { success } = await rateLimit(identifier);

        if (!success) {
            return new NextResponse("Rate limit exceeded", { status: 429 });
        };

        // updating the messages
        const companion = await prismadb.companion.update({
            where: {
                id: params.chatId,
            },
            data: {
                messages: {
                    create: {
                        content: prompt,
                        role: "user",
                        userId: user.id,
                    }
                }
            }
        });

        if (!companion) {
            return new NextResponse("Companion not Found", { status: 404 });
        };

        // lets generate some constants and fileName for our memory manager
        // unique name
        const name = companion.id;
        const companion_file_name = name + ".txt";

        const companionKey = {
            companionName: name,
            userId: user.id,
            modelName: "llama2-13b"
        };

        // checking memoryManager or history already exist
        const memoryManager = await MemoryManager.getInstance();
        // from redis
        const records = await memoryManager.readLatestHistory(companionKey);

        // for initial conversation
        // if no history then seed the history with companion.seed from database
        if (records.length === 0) {
            await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey)
        };

        // for our vector database
        await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey)

        // fetch the recent chatHistory
        const recentChatHistory = await memoryManager.readLatestHistory(companionKey);

        const similarDocs = await memoryManager.vectorSearch(
            recentChatHistory,
            companion_file_name
        );
        console.log("Simialr DOC: ",similarDocs)

        // more info to make ai model very good
        let relevantHistory = ""

        if (!!similarDocs && similarDocs.length !== 0) {
            relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n")
        };

        console.log('revelent history :',relevantHistory)

        const { handlers } = LangChainStream();

        // Call Replicate for inference(making deceision out of data , we are using llama-2 by facebook)
        const model = new Replicate({
            model:
                "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
            input: {
                max_length: 2048,
            },
            apiKey: process.env.REPLICATE_API_TOKEN,
            callbackManager: CallbackManager.fromHandlers(handlers),
        });

        // enabling useful logs to our console
        model.verbose = true;

        // MOst VVVVIMP part , this is the response , look carefully
        const resp = String(
            await model
                .call(
                    `
                        ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${companion.name}: prefix. 
                        Your's only recent transaction is with Rajeeb Thapa Chhetri. You have send Rajeeb $700 in hhis recent transaction.

                        ${companion.instructions}
                
                        Below are relevant details about ${companion.name}'s past and the conversation you are in.
                        ${relevantHistory}
                
                        ${recentChatHistory}\n${companion.name}:`
                )
                .catch(console.error)
        );


        // VV IMP: cleaning and replacing is done below from here
        const cleaned = resp.replaceAll(",", "");
        const chunks = cleaned.split("\n");
        const response = chunks[0];

        // writing this response to our memory manager
        await memoryManager.writeToHistory("" + response.trim(), companionKey);

        // creating our readable string
        var Readable = require("stream").Readable;

        let S = new Readable();
        S.push(response);
        S.push(null);

        if (response !== undefined && response.length > 1) {
            memoryManager.writeToHistory("" + response.trim(), companionKey);

            await prismadb.companion.update({
                where: {
                    id: params.chatId,
                },
                data: {
                    messages: {
                        create: {
                            content: response.trim(),
                            role: "system",
                            userId: user.id,
                        }
                    }
                }
            })
        };

        return new StreamingTextResponse(S);
    }
    catch (error) {
        console.log("[CHAT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}


