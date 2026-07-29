import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  return {
    title: "南京慢遊記｜南京 8 日同行手冊",
    description: "高雄出發，8 人同行的南京行程、交通、美食與共享記帳。",
    openGraph: {
      title: "南京慢遊記｜南京 8 日同行手冊",
      description: "11.18–11.25 高雄往返南京，8 人同行的完整旅遊手冊。",
      type: "website",
      locale: "zh_TW",
      images: [{ url: image, width: 1733, height: 907, alt: "南京慢遊記｜南京 8 日同行手冊" }],
    },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
