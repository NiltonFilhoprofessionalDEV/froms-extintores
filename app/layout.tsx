import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inspeção de Extintores",
  description: "Checklist mensal de inspeção de extintores"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
