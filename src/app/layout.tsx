import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
