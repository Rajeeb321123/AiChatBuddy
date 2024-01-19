'use client';


let speechRecogition = window.SpeechRecognition || webkitSpeechRecognition,
    recognition: SpeechRecognition


const useSpeechRecognition = ({lang,setInput}:{lang:string,setInput:any}) => {

    try {
        recognition = new speechRecogition();

        recognition.lang = lang;
        recognition.interimResults = true;

        recognition.start();
        recognition.onresult = (event: any) => {
            const speechResult:string = event.results[0][0].transcript;
            if (event.results[0].isFinal) {

                console.log(speechResult)
                setInput((input:any) => input + speechResult)
            }
        };
        recognition.onspeechend = () => {
            useSpeechRecognition({setInput,lang});
        };
        recognition.onerror = (event: any) => {
            // alert("Error Occured:" + event.error);
            recognition.stop();
            
        };
    }
    catch (error) {
        console.log(error);
        // return error
    }

};

const stopRecording = ()=> {
    recognition.stop();
}




export { useSpeechRecognition, stopRecording };
