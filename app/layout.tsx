import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fiji Infrastructure Planning Tool",
  description:
    "Interactive infrastructure planning and logistics pricing tool for Fiji's communities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
