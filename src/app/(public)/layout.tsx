import { LiffProvider } from "@/components/LiffProvider";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { RouteHandler } from "@/components/RouteHandler";
import { Suspense } from "react";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <LiffProvider liffId={process.env.NEXT_PUBLIC_LIFF_ID || ""}>
            <Suspense fallback={null}>
                <RouteHandler />
            </Suspense>
            <div className="w-full max-w-[480px] mx-auto min-h-screen relative shadow-2xl shadow-black bg-background">
                <AnnouncementBanner />
                {children}
            </div>
        </LiffProvider>
    );
}
