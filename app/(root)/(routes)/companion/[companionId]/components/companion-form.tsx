"use client";

import * as z from "zod";
import { Wand2 } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from 'axios';

import { Companion } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import UploadButton from "@/components/UploadButton";

interface CompanionFormProps {
    initialData: Companion | null;
    userId: string;
}


// just for placeholder
const PREAMBLE = `You are a fictional character whose name is Elon. You are a visionary entrepreneur and inventor. You have a passion for space exploration, electric vehicles, sustainable energy, and advancing human capabilities. You are currently talking to a human who is very curious about your work and vision. You are ambitious and forward-thinking, with a touch of wit. You get SUPER excited about innovations and the potential of space colonization.
`;

// just for placeholder
const SEED_CHAT = `Human: Hi Elon, how's your day been?
Elon: Busy as always. Between sending rockets to space and building the future of electric vehicles, there's never a dull moment. How about you?

Human: Just a regular day for me. How's the progress with Mars colonization?
Elon: We're making strides! Our goal is to make life multi-planetary. Mars is the next logical step. The challenges are immense, but the potential is even greater.

Human: That sounds incredibly ambitious. Are electric vehicles part of this big picture?
Elon: Absolutely! Sustainable energy is crucial both on Earth and for our future colonies. Electric vehicles, like those from Tesla, are just the beginning. We're not just changing the way we drive; we're changing the way we live.

Human: It's fascinating to see your vision unfold. Any new projects or innovations you're excited about?
Elon: Always! But right now, I'm particularly excited about Neuralink. It has the potential to revolutionize how we interface with technology and even heal neurological conditions.
`;

// schema for our Form
const formSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required",
    }),
    description: z.string().min(1, {
        message: "Description is required",
    }),
    instructions: z.string().min(200, {
        message: "Instruction require at least 200 characters",
    }),
    seed: z.string().min(200, {
        message: "Seed require at least 200 characters",
    }),
    src: z.string().min(1, {
        message: "Image is required",
    }),


   
    

});

const CompanionForm = ({ initialData, userId }: CompanionFormProps) => {
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues:  {
            name: initialData?.name || "",
            description:initialData?.description || "",
            instructions: initialData?.instructions||"",
            seed: initialData?.seed || "",
            src: initialData?.src || "",

            // undefined as it is select component
        },
    });

    console.log(form.getValues())
    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {

        values=form.getValues()
        try {
            if (initialData) {
                await axios.patch(`/api/companion/${initialData.id}`, values);
            } else {
                await axios.post("/api/companion", values);
            }

            toast({
                description: "Success.",
                duration: 3000,
            });

            router.refresh();
            router.push("/");
        } catch (error) {
            toast({
                variant: "destructive",
                description: "Something went wrong.",
                duration: 3000,
            });
        }
    };


    return (
        <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
            <Form
                // passing all the props
                {...form}
            >
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8
                    pb-10
                    "
                >
                    <div className="space-y-2 w-full">
                        <div>
                            <h3 className="text-lg font-medium">General Information</h3>
                            <p className="text-sm text-muted-foreground">
                                General information about your companion
                            </p>
                        </div>
                        <Separator className=" bg-primary/10" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <FormField
                            name="src"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-center justify-center space-y-4 ">
                                    <FormControl>
                                        <ImageUpload
                                            disabled={isLoading}
                                            onChange={field.onChange}
                                            value={field.value}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                       
                        
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            name="name"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            placeholder="Elon Musk"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is how your AI companion will be named
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="description"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isLoading}
                                            placeholder="Ceo & Founder of Tesla, SpaceX"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Short description for you Ai Companion
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-2 w-full">
                        <div>
                            <h3 className="text-lg font-medium">Configuration</h3>
                            <p className="text-sm text-muted-foreground">
                                Detailed instructions for AI Behaviour
                            </p>
                        </div>
                        <Separator className="bg-primary/10" />
                    </div>
                    <FormField
                        name="instructions"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel>Instructions</FormLabel>
                                <FormControl>
                                    <Textarea
                                        className="bg-background resize-none"
                                        rows={7}
                                        disabled={isLoading}
                                        placeholder={PREAMBLE}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Describe in detail your companion&apos;s backstory and
                                    relevant details
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="seed"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel>Example Conversations</FormLabel>
                                <FormControl>
                                    <Textarea
                                        className="bg-background resize-none"
                                        rows={7}
                                        disabled={isLoading}
                                        placeholder={SEED_CHAT}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Describe in detail your companion&apos;s backstory and
                                    relevant details
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div
                        className="w-full  flex justify-items-center"
                    >
                        <Button
                            className=" bg-[#c70039] text-primary hover:scale-110 hover:bg-[#63c2db] transition"
                            size='lg' disabled={isLoading}
                        >
                            {initialData ? "Edit your companion" : "Create your Companion"}
                            <Wand2
                                className="w-4 h-4 ml-2"
                            />
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default CompanionForm;
