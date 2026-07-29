import type { Metadata } from "next";
import TripApp from "./trip-app";

export const metadata: Metadata = {
  title: "南京慢遊記｜南京 8 日同行手冊",
  description: "高雄出發，8 人同行的南京行程、交通、美食與共享記帳。",
};

export default function Home() {
  return <TripApp />;
}
