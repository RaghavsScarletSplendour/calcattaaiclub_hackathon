import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Homie",
  description:
    "A COO for your household — upload any document, it files itself and surfaces what matters next.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const sb = await createClient();
  const { data: people } = await sb
    .from("people")
    .select("id, name, initial, color")
    .order("name");

  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full bg-background text-foreground font-sans">
        <div className="flex h-full">
          <Sidebar people={people ?? []} />
          <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
