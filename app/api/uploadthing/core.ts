import prismadb from "@/lib/prismadb";
import { Pinecone } from "@pinecone-database/pinecone";
// import { auth, redirectToSignIn } from "@clerk/nextjs";

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';

// import { currentUser } from "@clerk/nextjs";
// we can use other than OpenAi 
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { pinecone } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";
import { PineconeStore } from "langchain/vectorstores/pinecone";

const f = createUploadthing();

const middleware = async () => {
    
    const {userId} = auth();
    

    if (!userId || !userId) throw new Error('Unauthorized');


    // this return data will be in onUploadComplete as metadata , as it is a middleware. to check hover over onUploadComplete function
    return { userId: userId };
}




const onUploadComplete = async ({
    metadata,
    file,
}: {
    metadata: Awaited<ReturnType<typeof middleware>>
    file: {
        key: string
        name: string
        url: string
    }
}) => {





    // const updateCompanion = await prismadb.companion.update({
    //     where:{
    //         userId:metadata.userId
    //     },
    //     data: {
    //         fileKey: file.key,
    //         fileName: file.name,

    //         fileUrl: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
    //         // we will processing it futher and later add failure or success
    //         fileUploadStatus: "PROCESSING"
    //     }
    // });


    try {
        // we need the pdf file so, we make fetch in above url of uploadthings
        const response = await fetch(file.url);
        // we need blob object to index it
        const blob = await response.blob();


        const loader = new PDFLoader(blob);


        const pineconeIndex = pinecone.Index(
            "companion"
        );
        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
        })


        const docs = await loader.load();

        await PineconeStore.fromDocuments(
            docs,
            embeddings,
            {
                pineconeIndex,
                // saving vectors to certain neamespace
                // so, when query by fileId we can get all the vectors of that fileId
                namespace: file.key,
            });


        // for (const doc of docs) {
        //     console.log("processing documents: ", doc.metadata.source);
        //     const txtPath = doc.metadata.source;
        //     const text = doc.pageContent;
        //     const textSplitter = new RecursiveCharacterTextSplitter({
        //         // range of 200 means almost 2 sentences , 1000 means almost a paragraph
        //         chunkSize: 1000,
        //     });
        //     console.log("Splitting text into chunks...");
        //     // split text into chunks (documents)
        //     const chunks = await textSplitter.createDocuments([text]);
        //     console.log(`text split into ${chunks.length}.chunks`);
        //     console.log(
        //         `calling OpenAi Embedding endpoint documents with ${chunks.length} text chunks ...`
        //     );

        //     // creating the OpenAI embeddings for documents
        //     const embeddingsArrays = await new OpenAIEmbeddings(
        //         { openAIApiKey: process.env.OPENAI_API_KEY, }
        //     ).embedDocuments(
        //         chunks.map((chunk: any) => chunk.pageContent.replace(/n/g, ""))
        //     );
        //     console.log("finished the embedding documents");
        //     console.log(
        //         `creating ${chunks.length} vector array with id, values, and metadata `
        //     );

        //     // create vector in batch in 100 for pinecone 2 mb limit
        //     const batchSize = 100;
        //     let batch = [];
        //     for (let idx = 0; idx < chunks.length; idx++) {
        //         const chunk = chunks[idx];
        //         const vector = {
        //             id: `${txtPath}_${idx}`,
        //             values: embeddingsArrays[idx],

        //             metadata: {
        //                 ...chunk.metadata,
        //                 loc: JSON.stringify(chunk.metadata.loc),
        //                 // embedding the whole content in vector database, alternative we can embedd only the refrence to sql database
        //                 pageContent: chunk.pageContent,
        //                 //txtpath for realizing where result came from
        //                 txtPath: txtPath,
        //             },
        //         };
        //         batch.push(vector);
        //         // when batch is full or it's the last item, upsert the vectors
        //         if (batch.length === batchSize || idx === chunks.length - 1) {
        //             // await pineconeIndex.upsert(batch);

        //             const ns =  pineconeIndex.namespace(file.key);
        //             await ns.upsert(batch);
                    
        //         };
        //     };

            
        // }
        // successful upload and update the file in prismadb as success as we finished processing
        await prismadb.companion.update({
            data: {
                fileKey:file.key
            },
            where: {
                userId: metadata.userId
            }
        });
        

    }
    catch {
        // failed status
        // await prismadb.companion.update({
        //     data: {
        //         fileUploadStatus: "FAILED"
        //     },
        //     where: {
        //         userId: metadata.userId
        //     }
        // });
    }
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    // below should be file type => pdf not image ( default)
    freePlanUploader: f({ pdf: { maxFileSize: "1MB" } })
    .middleware(middleware)
   
        .onUploadComplete(onUploadComplete),

} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;