import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cerhera Nails — Press-on nails",
    template: "%s · Cerhera Nails",
  },
  description:
    "Cerhera Nails — simple, elegant, whimsical press-on styles. Ready sets shipping within the US.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
