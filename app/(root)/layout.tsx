

import { Navbar } from "@/components/navbar";
import Sidebar from "@/components/sidebar";

const RootLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
    return (
        <div
            className=" h-full"
        >
            <Navbar />
            <div
                className="
                    hidden
                    md:flex
                    mt-16
                    w-20
                    flex-col
                    fixed
                    inset-y-0
                "
            >
                <Sidebar />
            </div>
            <main className="md:pl-20 pt-16 h-screen">
                <div
                    className="mx-auto max-w-4xl h-full w-full"
                >
                    {children}
                </div>

            </main>
        </div>
    )
}

export default RootLayout;