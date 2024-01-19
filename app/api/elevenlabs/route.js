// for our AI voice using power of elevenlabs

import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(request) {
  const { message, voice } = await request.json();

  console.log(message, voice);
  
  try {
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: "POST",
        headers: {
          accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: message,
          model_id: "eleven_monolingual_v2",
          voice_settings: {
            stability: 0,
            similarity_boost: 0,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Something went wrong");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFile(path.join("public", "audio", `voice.mp3`), buffer, (error) => {
      console.log(error);
    });

    return NextResponse(response);
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }));
  }
}