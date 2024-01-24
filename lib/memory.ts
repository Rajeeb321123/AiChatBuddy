// memory and history for our ai companion



import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// import { PineconeClient } from "@pinecone-database/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { pinecone } from "./pinecone";

// for pushing our docs to vectorstore: pinecone
// import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { UpsertRequestFromJSON } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";


export type CompanionKey = {
  companionName: string;
  modelName: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private history: Redis;
  // private vectorDBClient: Pinecone;

  public constructor() {
    this.history = Redis.fromEnv();
  }

  // deprecated old way 
  // initialization function
  // public async init() {
  //   if (this.vectorDBClient instanceof Pinecone) {
  //     await this.vectorDBClient.init({
  //       apiKey: process.env.PINECONE_API_KEY!,
  //       environment: process.env.PINECONE_ENVIRONMENT!,
  //     });
  //   }
  // }

  // for vector seaarh of simialr docs
  public async vectorSearch(
    fileKey: string,
    prompt: string,
  ) {
    const pineconeIndex = pinecone.index("companion");

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      { pineconeIndex,  namespace: fileKey }
    );

    console.log("vector store:", vectorStore)

    const similarDocs = await vectorStore
      .similaritySearch(prompt, 4)
      .catch((err) => {
        console.log("WARNING: failed to get vector search results.", err);
      });

    console.log("similarDocs:", similarDocs)
    return similarDocs;
  };

  

  // function to get instance
  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
      // init() is th above function we created
      // await MemoryManager.instance.init();
    }
    return MemoryManager.instance;
  }

  // function to generate redis companion key
  private generateRedisCompanionKey(companionKey: CompanionKey): string {
    return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
  }

  // function to write history 
  // so our model can adapt to new information
  public async writeToHistory(text: string, companionKey: CompanionKey) {
    if (!companionKey || typeof companionKey.userId == "undefined") {
      console.log("Companion key set incorrectly");
      return "";
    }

    const key = this.generateRedisCompanionKey(companionKey);
    const result = await this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });

    return result;
  }

  // function to read from history
  public async readLatestHistory(companionKey: CompanionKey): Promise<string> {
    if (!companionKey || typeof companionKey.userId == "undefined") {
      console.log("Companion key set incorrectly");
      return "";
    }

    const key = this.generateRedisCompanionKey(companionKey);
    // fetch the history
    // Returns the specified range of elements in the sorted set stored at <key>.
    let result = await this.history.zrange(key, 0, Date.now(), {
      byScore: true,
    });

    // we need to do something like this as data is stored in redis in different way
    result = result.slice(-10).reverse();
    const recentChats = result.reverse().join("\n");
    return recentChats;
  }

  // to seed the chat history
  // we hample 2 field in compaion creation instruction and example conversation
  // we are going to use that example conversation to seed that information into a vector database so we can create memory for our database, so it can give better reply
  public async seedChatHistory(
    seedContent: String,
    delimiter: string = "\n",
    companionKey: CompanionKey
  ) {
    const key = this.generateRedisCompanionKey(companionKey);
    // if key already exist in redis history then no need to recreate history for ai companion
    if (await this.history.exists(key)) {
      console.log("User already has chat history");
      return;
    }

    const content = seedContent.split(delimiter);
    let counter = 0;
    for (const line of content) {
      // IMP:adding to redis
      await this.history.zadd(key, { score: counter, member: line });
      counter += 1;
    }
  }
}