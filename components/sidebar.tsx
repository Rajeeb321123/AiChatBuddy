'use client';

import { cn } from "@/lib/utils";
import { UserPlus, BrainCircuit } from "lucide-react";
import { usePathname, useRouter }  from 'next/navigation';

const Sidebar = () => {

    const pathname = usePathname();
    const router = useRouter();
    const routes = [
        {
            icon: BrainCircuit,
            href: '/',
            label: "Home",
            pro: false,
        },
        // {
        //     icon: UserPlus,
        //     href: '/companion/new',
        //     label: "Create",
        //     pro: true,
        // },
    ];
    
    const onNavigate = (url: string , pro: boolean) => {

        return router.push(url);
    };

  return (
    <div 
        className="
        space-y-4
        flex
        flex-col
        h-full
        text-primary
        bg-secondary
        "
    >
        <div
            className="p-3 flex-1 justify-center"
        >
            <div className="space-y-2">
                {routes.map((route) => (
                    <div
                        onClick={() => onNavigate(route.href, route.pro) }
                        key={route.href}
                        className={cn(
                            "text-muted-foreground text-xs group flex py-3 w-full justify-start font-medium cursor-pointer hover:text-primary/10 rounded-lg transition",
                            pathname === route.href && "bg-[#63c2db] text-primary"
                        )}
                    >
                        <div
                            className=" flex flex-col gap-y-2 items-center flex-1"
                        >
                            <route.icon className="h-7 w-7 " />
                            {route.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}

export default Sidebar