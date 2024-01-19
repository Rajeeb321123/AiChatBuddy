'use client';

import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { Menu, Sparkle } from "lucide-react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import MobileSidebar from "./mobile-sidebar";
import Image from "next/image";

const font = Poppins({
    weight: "600",
    subsets: ["latin"]
});

export const Navbar = () => {
    return (
        <div
            className="
                fixed
                w-full
                z-50
                flex
                justify-between
                items-center
                py-2
                px-4
                border-b
                border-primary
                bg-[#c70039]
                h-16
                
            "
        >


            <div
                className="flex items-center"
            >
                <MobileSidebar />
                <Link href='/'
                    className="
                    hidden
                    md:flex
                    bg-white
                    rounded-md
                    items-center
                    p-2
                    "
                >
                    <Image
                        src='/Moru_logo.png'
                        alt="Moru_logo"
                        height={50}
                        width={80}
                    />
                </Link>
            </div>
            <div
                className="flex items-center gap-x-3"
            >
                <div className="rounded-full overflow-hidden">
                    <ModeToggle />

                </div>
                <UserButton afterSignOutUrl='/' />
            </div>
        </div>
    );
};