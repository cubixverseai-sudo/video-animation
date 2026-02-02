import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SocketProvider } from "@/providers/SocketProvider";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Director Agent | AI Motion Graphics Studio",
    description: "Create stunning motion graphics videos with AI-powered automation. The Director Agent transforms your ideas into professional videos.",
    keywords: ["motion graphics", "AI video", "animation", "Remotion", "GSAP"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    <SocketProvider>
                        {children}
                    </SocketProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
