"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const members = ["李文龍", "馬僖慧", "李文斌", "黃富美", "李素玲", "蔡璧燦", "李素珍", "陳怡君"];

type Stop = { time: string; title: string; detail: string; food?: string };
type Day = { date: string; weekday: string; label: string; title: string; transport: string; hotel: string; stops: Stop[]; note?: string };
type Expense = { id: number; title: string; amount: number; payer: string; splitMode: "all" | "custom"; participants: string[]; createdAt: string };
type Ticket = { name: string; englishName: string; ticketSuffix: string };

const tickets: Ticket[] = [
  { name: "李文龍", englishName: "LEE/WENLUNG", ticketSuffix: "7706" },
  { name: "黃富美", englishName: "HUANG/FUMEI", ticketSuffix: "7707" },
  { name: "馬僖慧", englishName: "MA/HSIHUI", ticketSuffix: "7708" },
  { name: "李文斌", englishName: "LEE/WENPING", ticketSuffix: "7709" },
  { name: "蔡璧燦", englishName: "TSAI/PITSAN", ticketSuffix: "7710" },
  { name: "李素玲", englishName: "LEE/SULING", ticketSuffix: "7711" },
  { name: "李素珍", englishName: "LEE/SUCHEN", ticketSuffix: "7712" },
  { name: "陳怡君", englishName: "CHEN/YIJIUN", ticketSuffix: "7713" },
];

const supabaseUrl = "https://riymnecjfrgeqiwnytdj.supabase.co";
const supabaseKey = "sb_publishable_897WJUODqwKH9FOBam_fdg_assAWeFv";
const expensesEndpoint = `${supabaseUrl}/rest/v1/expenses`;
const supabaseHeaders = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
};

const days: Day[] = [
  {
    date: "11/18", weekday: "三", label: "DAY 1", title: "抵達南京與市區初體驗",
    transport: "南京祿口機場 → 南京南站 → 新街口", hotel: "南京南站清木尚酒店",
    stops: [
      { time: "11:40–14:00", title: "高雄飛往南京", detail: "高雄小港機場 KHH → 南京祿口國際機場 NKG，東方航空 MU2946。" },
      { time: "16:00", title: "飯店 Check-in", detail: "前往南京南站清木尚酒店辦理入住。" },
      { time: "17:00", title: "新街口德基廣場", detail: "逛街、享用南京在地美食與晚餐。" },
    ],
  },
  {
    date: "11/19", weekday: "四", label: "DAY 2", title: "民國風情與歷史文化",
    transport: "地鐵 3 號線轉 2 號線＋步行", hotel: "南京南站清木尚酒店",
    note: "南京博物院免費但須實名預約，建議提前 7 天於「南京博物院」微信小程序搶上午場，參考放票時間為每日 18:00；南京總統府票價參考約人民幣 35 元，建議提前 2 天於官方微信小程序購票。兩館週一閉館，入園請攜帶台胞證或護照；放票與票價以官方最新公告為準。",
    stops: [
      { time: "08:30–09:15", title: "南京南站出發", detail: "搭地鐵 3 號線往林場方向至大行宮站，轉 2 號線往經天路方向至明故宮站，由 1 號出口沿中山東路向東步行約 300 公尺。全程約 13 公里，約 35～40 分鐘。" },
      { time: "09:15–12:00", title: "南京博物院", detail: "安排約 2.5～3 小時，重點參觀歷史館，以及還原民國老街、適合拍照的民國館。" },
      { time: "12:00–13:30", title: "博物院周邊午餐", detail: "可前往博物院周邊或大行宮商圈，選擇小金陵鹽水鴨、南京大牌檔大行宮店，品嚐鹽水鴨、鴨血粉絲湯、美齡粥或生煎包。" },
      { time: "13:30–13:50", title: "前往南京總統府", detail: "由明故宮站搭地鐵 2 號線往油坊橋方向至大行宮站，從 5 號出口沿長江路步行約 400 公尺；全程約 15 分鐘。" },
      { time: "13:50–16:30", title: "南京總統府", detail: "安排約 2～2.5 小時，參觀中區總統府官署、西區孫中山臨時大總統辦公室與煦園，以及東區行政院舊址。" },
      { time: "16:30–16:35", title: "步行前往南京 1912 街區", detail: "總統府與 1912 街區相鄰，距離約 200 公尺，步行約 2～3 分鐘。" },
      { time: "16:35–20:30", title: "南京 1912 街區與晚餐", detail: "漫遊民國風格建築、文創小店與夜景；晚餐可選民國風味南京菜，或街區內的江浙菜、異國料理與音樂餐廳。" },
      { time: "20:30–21:15", title: "返回南京南站", detail: "步行至大行宮站，搭地鐵 3 號線往秣周東路方向直達南京南站；約 10.5 公里，含步行約 30 分鐘。" },
    ],
  },
  {
    date: "11/20", weekday: "五", label: "DAY 3", title: "鍾山景區與老門東巡禮",
    transport: "地鐵 3 號線轉 2 號線＋景區觀光車＋步行", hotel: "南京南站清木尚酒店",
    note: "中山陵須提前 1–3 天預約，免費入場；建議購買涵蓋明孝陵、美齡宮、音樂台與靈谷寺的鐘山景區聯票（參考價約人民幣 100 元）。大報恩寺參考全票約人民幣 90 元，19:00 停止入場、展館約 19:30 關閉，實際票價與開放時間請以官方公告為準。",
    stops: [
      { time: "08:30–09:10", title: "南京南站出發", detail: "搭地鐵 3 號線至大行宮站，轉 2 號線至苜蓿園站 1 號出口；約 15 公里，車程約 28 分鐘。" },
      { time: "09:10–09:30", title: "梧桐大道漫步", detail: "沿陵園路段拍照散步約 20 分鐘，再步行約 1.2 公里、15–20 分鐘前往明孝陵 5 號／7 號門。" },
      { time: "09:30–11:30", title: "明孝陵", detail: "重點參觀石象路神道、享殿與方城明樓，預留約 2 小時。" },
      { time: "11:35–12:35", title: "美齡宮", detail: "由明孝陵步行約 800 公尺、10–12 分鐘，或搭乘景區觀光車前往；參觀國民政府主席官邸約 1 小時。" },
      { time: "12:40–13:30", title: "中山陵商業街午餐", detail: "可在中山陵商業街或美齡宮附近用餐。", food: "南京大排檔：美齡粥、鹽水鴨、金牌羅漢齋、古法糖芋苗；若想快速用餐，商業街亦有連鎖便餐。" },
      { time: "13:40–15:30", title: "中山陵", detail: "從美齡宮搭景區觀光車 1 號線／2 號線，約 2.5 公里、8 分鐘抵達中山陵廣場；攀登 392 級台階至祭堂，預留 1.5–2 小時。" },
      { time: "15:30–16:30", title: "音樂台", detail: "由中山陵步行約 400 公尺、5 分鐘抵達，欣賞露天建築與白鴿，停留約 1 小時。" },
      { time: "16:40–17:40", title: "靈谷寺與靈谷景區", detail: "從音樂台搭景區觀光車 4 號線／大環線，約 2.8 公里、10 分鐘；參觀無梁殿，可依體力登靈谷塔遠眺。" },
      { time: "17:40–18:25", title: "前往大報恩寺", detail: "從靈谷寺出口搭觀光車／公車至鐘靈街站，搭地鐵 2 號線至大行宮站轉 3 號線，在雨花門站 4 號出口下車；接駁、地鐵與步行合計約 45 分鐘。" },
      { time: "18:25–19:40", title: "大報恩寺遺址公園", detail: "參觀地宮遺址、現代琉璃寶塔與夜間燈光；建議 19:00 前入場。結束後沿雨花路、中華門方向步行約 1.2 公里、15 分鐘前往老門東。" },
      { time: "19:45–21:30", title: "老門東歷史文化街區", detail: "漫步明清風格老街，享用晚餐與南京在地小吃。", food: "蔣有記牛肉鍋貼與牛肉湯、陸氏梅花糕、小鄭酥燒餅；想坐下用餐可選尋魏·金陵菜或德明飯店。" },
      { time: "21:30 後", title: "返回南京南站", detail: "步行至武定門站搭地鐵 3 號線，或至三山街站搭 1 號線直達南京南站；約 8 公里，車程約 15–20 分鐘。" },
    ],
  },
  {
    date: "11/21", weekday: "六", label: "DAY 4", title: "返鄉探親",
    transport: "南京往返句容", hotel: "南京南站清木尚酒店",
    stops: [
      { time: "全天", title: "返回句容", detail: "探親訪友，行程以家人安排為主。" },
    ],
  },
  {
    date: "11/22", weekday: "日", label: "DAY 5", title: "古剎湖光與秦淮夜景",
    transport: "地鐵 3 號線／1 號線＋步行＋秦淮河畫舫", hotel: "南京南站清木尚酒店",
    note: "雞鳴寺門票參考約人民幣 10 元，可透過「南京雞鳴寺」微信公眾號或現場購票；明城牆台城段門票參考約人民幣 30 元，可透過「南京城牆」預約；玄武湖與夫子廟街區免費。外秦淮河畫舫請提前查詢官方碼頭、班次與購票資訊；節假日夫子廟可能實施實名人流預約，實際規則與票價以官方公告為準。",
    stops: [
      { time: "08:30–09:10", title: "南京南站出發", detail: "搭地鐵 3 號線往林場方向至雞鳴寺站，由 5 號出口步行約 350 公尺、5 分鐘抵達山門；全程約 14 公里。" },
      { time: "09:10–10:30", title: "雞鳴寺", detail: "參拜千年香火古剎，重點參觀毗盧寶殿與藥師佛塔；後門可直通明城牆解放門。" },
      { time: "10:30–12:30", title: "明城牆台城段與玄武湖", detail: "由雞鳴寺後門步行約 3 分鐘至解放門登城，沿城牆遠眺玄武湖與紫金山，再前往玄武門或下城進入湖畔散步；依路線步行約 500 公尺～1.5 公里。" },
      { time: "12:30–14:00", title: "玄武湖周邊午餐", detail: "可在玄武湖、玄武門或新街口商圈用餐；推薦雞鳴寺百味齋素面，或南京大牌檔的美齡粥、金牌烤鴨與江米扣肉。" },
      { time: "14:00–17:30", title: "午後悠閒時段", detail: "可留在玄武湖搭遊船或環湖電瓶車休息，也可前往新街口商圈或先鋒書店自由逛街。" },
      { time: "17:30–19:00", title: "夫子廟與秦淮晚餐", detail: "可由玄武門站搭地鐵 1 號線至三山街站，或由雞鳴寺站搭 3 號線至夫子廟站，再步行約 5～8 分鐘進入景區。漫步大照壁、江南貢院與秦淮河畔，晚餐可選蓮湖糕團店或奇芳閣。" },
      { time: "19:00–20:30", title: "外秦淮河畫舫夜遊", detail: "沿河步行約 900 公尺、12～15 分鐘前往掃帚巷或水西門碼頭，搭乘約 45～60 分鐘的畫舫，欣賞古城牆與沿岸夜間燈景。" },
      { time: "20:30–21:00", title: "返回南京南站", detail: "夜遊結束後依下船碼頭步行至鄰近地鐵站，再搭地鐵返回南京南站與飯店休息。" },
    ],
  },
  {
    date: "11/23", weekday: "一", label: "DAY 6", title: "棲霞秋色、長江風光與民國街區",
    transport: "地鐵＋公車／計程車＋步行", hotel: "南京南站清木尚酒店",
    note: "棲霞山紅楓節期間門票參考約人民幣 80 元（平時約 50 元），建議提前透過微信公眾號「南京棲霞山」購票；燕子磯公園門票參考約人民幣 10 元。景區票價與交通班次可能調整，請以出發前官方公告為準，並隨身攜帶台胞證。",
    stops: [
      { time: "08:30–09:30", title: "南京南站出發", detail: "搭地鐵 3 號線至南京站，轉地鐵 1 號線至燕子磯站或邁皋橋站，再轉乘 206／207 路公車或計程車前往棲霞山。全程約 32 公里，含等車與步行約 1 小時。" },
      { time: "09:30–12:30", title: "棲霞山景區", detail: "安排約 3 小時深度訪古與賞景，參觀千年古剎棲霞寺、隋代舍利塔、南朝千佛崖石窟與桃花湖。" },
      { time: "12:30–13:45", title: "棲霞山周邊午餐", detail: "可品嚐棲霞寺素齋面，或到棲霞古街享用鹽水鴨、鴨血粉絲湯等在地小吃。" },
      { time: "13:45–14:15", title: "前往燕子磯公園", detail: "建議搭公車或計程車直達；距離約 13 公里，車程約 25–30 分鐘。" },
      { time: "14:15–16:30", title: "燕子磯公園", detail: "登臨有「萬里長江第一磯」之稱的燕子磯，欣賞長江江景與南京長江大橋，停留約 2 小時。" },
      { time: "16:30–17:15", title: "前往頤和路", detail: "步行至燕子磯站搭地鐵 1 號線，在鼓樓站轉 4 號線至雲南路站，再步行前往頤和路；約 14 公里，全程約 45 分鐘。" },
      { time: "17:15–18:30", title: "頤和路歷史文化街區", detail: "漫步黃牆綠樹與民國建築群，感受「一條頤和路，半部民國史」的街區風貌。" },
      { time: "18:30–19:45", title: "頤和路／雲南路晚餐", detail: "可前往南京大牌檔上海路店或德基店品嚐金陵菜，也可選擇上海路、雲南路一帶的私房菜或蘇菜館。" },
      { time: "19:45–20:15", title: "返回南京南站", detail: "由雲南路站搭地鐵 4 號線，可在雞鳴寺站轉 3 號線，或在鼓樓站轉 1 號線前往南京南站；含步行約 30 分鐘。" },
    ],
  },
  {
    date: "11/24", weekday: "二", label: "DAY 7", title: "牛首攬勝與轉移機場住宿",
    transport: "計程車／叫車＋麗楓酒店接送服務", hotel: "南京祿口機場麗楓酒店",
    note: "牛首山半日遊建議由東門入園並購買景區接駁車票，避免山路步行耗費體力；請提前網路購票，穿著舒適步行鞋，並盡量在 13:00 前進入核心景區。實際開放時間與接駁班次請以出發前官方公告為準。",
    stops: [
      { time: "08:30", title: "退房與寄放行李", detail: "南京南站清木尚酒店辦理退房，將行李寄放櫃檯。" },
      { time: "09:00–09:20", title: "牛首山入園與接駁", detail: "建議由交通較方便、景交車班次較密集的東門入園，搭乘景區接駁車直達天闕站（佛頂宮外），節省約 1～2 小時步行與爬坡時間。" },
      { time: "09:20–11:50", title: "佛頂宮", detail: "先遊覽水景廣場與融合歐式、禪意的巨型穹頂，再深入地宮參觀禪境大觀、動態蓮花舞台及地下 6 層萬佛廊；建議停留約 2～2.5 小時。" },
      { time: "11:50–12:35", title: "佛頂塔／佛頂寺", detail: "佛頂塔位於佛頂宮旁，可登高遠眺景區；時間充裕可順遊唐代風格、氛圍寧靜的佛頂寺，停留約 30～60 分鐘。" },
      { time: "12:35–13:00", title: "搭接駁車返回出口", detail: "由核心景區搭乘景交車下山返回東門或原入園出口，完成約 3.5～4 小時的半日精華路線。" },
      { time: "14:00", title: "取行李並前往機場飯店", detail: "返回清木尚酒店取行李，搭車前往南京祿口機場麗楓酒店。" },
      { time: "15:00", title: "麗楓酒店 Check-in", detail: "辦理入住，使用預約之麗楓酒店接送服務。" },
    ],
  },
  {
    date: "11/25", weekday: "三", label: "DAY 8", title: "順利返台",
    transport: "麗楓酒店送機專車", hotel: "溫暖的家",
    stops: [
      { time: "05:30", title: "搭乘飯店送機專車", detail: "使用預約之麗楓酒店接送服務前往南京祿口國際機場。" },
      { time: "07:50–10:10", title: "南京飛回高雄", detail: "南京祿口國際機場 NKG → 高雄小港機場 KHH，東方航空 MU2945。" },
    ],
  },
];

function money(value: number) {
  return new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 1 }).format(value);
}

export default function TripApp() {
  const [section, setSection] = useState<"trip" | "tickets" | "ledger">("trip");
  const [activeDay, setActiveDay] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", amount: "", payer: members[0], splitMode: "all" as "all" | "custom", participants: [members[0]] });

  async function loadExpenses() {
    try {
      const response = await fetch(`${expensesEndpoint}?select=*&order=id.desc`, {
        cache: "no-store",
        headers: supabaseHeaders,
      });
      if (!response.ok) throw new Error();
      const rows = await response.json() as Array<{
        id: number;
        title: string;
        amount: number | string;
        payer: string;
        split_mode: "all" | "custom";
        participants: string[];
        created_at: string;
      }>;
      setExpenses(rows.map((row) => ({
        id: row.id,
        title: row.title,
        amount: Number(row.amount),
        payer: row.payer === "李素貞" ? "李素珍" : row.payer === "蔡壁燦" ? "蔡璧燦" : row.payer,
        splitMode: row.split_mode,
        participants: (row.participants ?? []).map((name) => name === "李素貞" ? "李素珍" : name === "蔡壁燦" ? "蔡璧燦" : name),
        createdAt: row.created_at,
      })));
    } catch {
      setError("記帳資料目前無法連線，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadExpenses(); }, []);

  async function addExpense(event: FormEvent) {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0 || (form.splitMode === "custom" && form.participants.length === 0)) {
      setError(form.splitMode === "custom" && form.participants.length === 0 ? "請至少勾選 1 位分攤成員。" : "請填寫項目與正確金額。");
      return;
    }
    setSaving(true); setError("");
    try {
      const response = await fetch(expensesEndpoint, {
        method: "POST",
        headers: { ...supabaseHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          title: form.title.trim(),
          amount,
          payer: form.payer,
          split_mode: form.splitMode,
          participants: form.splitMode === "custom" ? form.participants : [],
        }),
      });
      if (!response.ok) throw new Error();
      setForm((old) => ({ ...old, title: "", amount: "" }));
      await loadExpenses();
    } catch { setError("這筆帳沒有存成功，請再試一次。"); }
    finally { setSaving(false); }
  }

  async function removeExpense(id: number) {
    if (!window.confirm("確定要刪除這筆帳嗎？")) return;
    const response = await fetch(`${expensesEndpoint}?id=eq.${id}`, {
      method: "DELETE",
      headers: supabaseHeaders,
    });
    if (response.ok) loadExpenses(); else setError("刪除失敗，請稍後再試。");
  }

  const summary = useMemo(() => members.map((name) => {
    let paid = 0, share = 0;
    for (const item of expenses) {
      if (item.payer === name) paid += item.amount;
      if (item.splitMode === "all") share += item.amount / members.length;
      if (item.splitMode === "custom" && item.participants.includes(name)) share += item.amount / item.participants.length;
    }
    return { name, paid, share, net: paid - share };
  }), [expenses]);

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const day = days[activeDay];

  return (
    <main>
      <header className="hero">
        <div className="hero-art" aria-hidden="true"><span>金</span><i /><b /></div>
        <nav className="topbar">
          <a className="brand" href="#"><span>南京</span>慢遊記</a>
          <div className="nav-actions">
            <button className={section === "trip" ? "active" : ""} onClick={() => setSection("trip")}>行程</button>
            <button className={section === "tickets" ? "active" : ""} onClick={() => setSection("tickets")}>機票資訊</button>
            <button className={section === "ledger" ? "active" : ""} onClick={() => setSection("ledger")}>共享記帳</button>
          </div>
        </nav>
        <div className="hero-copy">
          <p className="eyebrow">2026 · NANJING · 8 TRAVELERS</p>
          <h1>八人同行，<br /><em>李氏家族之旅。</em></h1>
          <p className="lead">高雄出發的 8 天城市漫遊。古城牆、梧桐大道、秦淮夜色，還有每一頓值得記住的南京味。</p>
          <div className="trip-facts">
            <span><small>日期</small>11.18 — 11.25</span>
            <span><small>航線</small>高雄 KHH ⇄ 南京 NKG</span>
            <span><small>同行</small>8 位家人朋友</span>
          </div>
        </div>
      </header>

      {section === "trip" ? (
        <>
          <section className="flight-strip" aria-label="航班資訊">
            <div><span className="flight-label">去程</span><strong>11/18　11:40</strong><p>KHH 高雄 <i>→</i> NKG 南京　14:00</p></div>
            <div className="flight-line"><span>✈</span></div>
            <div><span className="flight-label return">回程</span><strong>11/25　07:50</strong><p>NKG 南京 <i>→</i> KHH 高雄　10:10</p></div>
          </section>

          <section className="itinerary section-wrap">
            <div className="section-heading">
              <div><p className="eyebrow dark">DAILY ITINERARY</p><h2>每日行程</h2></div>
              <p>點選日期，查看當天交通、景點與餐食。</p>
            </div>
            <div className="day-tabs" role="tablist" aria-label="選擇日期">
              {days.map((item, index) => (
                <button key={item.date} className={index === activeDay ? "active" : ""} onClick={() => setActiveDay(index)} role="tab" aria-selected={index === activeDay}>
                  <small>{item.label}</small><b>{item.date}</b><span>週{item.weekday}</span>
                </button>
              ))}
            </div>
            <article className="day-panel">
              <div className="day-intro">
                <span className="day-number">{String(activeDay + 1).padStart(2, "0")}</span>
                <div><p>{day.date}　星期{day.weekday}</p><h3>{day.title}</h3></div>
              </div>
              <div className="day-meta">
                <p><span>🚇</span><b>今日交通</b>{day.transport}</p>
                <p><span>⌂</span><b>今晚住宿</b>{day.hotel}</p>
              </div>
              {day.note && <p className="day-note">行程備註｜{day.note}</p>}
              <div className="timeline">
                {day.stops.map((stop, index) => (
                  <div className="stop" key={`${stop.time}-${stop.title}`}>
                    <div className="time">{stop.time}</div>
                    <div className="dot">{index + 1}</div>
                    <div className="stop-card">
                      <h4>{stop.title}</h4><p>{stop.detail}</p>
                      {stop.food && <p className="food"><span>一席南京味</span>{stop.food}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="people">
            <div className="section-wrap people-inner">
              <div><p className="eyebrow">OUR TRAVEL PARTY</p><h2>八位旅伴，<br />一段共同記憶。</h2></div>
              <div className="member-grid">{members.map((name, index) => <div key={name}><span>{String(index + 1).padStart(2, "0")}</span><b>{name}</b></div>)}</div>
            </div>
          </section>

          <section className="tips section-wrap">
            <div className="section-heading"><div><p className="eyebrow dark">BEFORE YOU GO</p><h2>出發前提醒</h2></div></div>
            <div className="tip-grid">
              <div><span>01</span><h3>確認旅遊證件</h3><p>出發前請確認台胞證仍在有效期限內，並隨身妥善保管。</p></div>
              <div><span>02</span><h3>熱門景點先預約</h3><p>南京博物院、中山陵、牛首山等熱門景點，建議提前在官方小程序預約門票。</p></div>
              <div><span>03</span><h3>設定手機交通碼</h3><p>預先下載並綁定南京地鐵電子卡，或使用支付寶、微信乘車碼。</p></div>
            </div>
          </section>
        </>
      ) : section === "tickets" ? (
        <section className="tickets section-wrap">
          <div className="section-heading">
            <div><p className="eyebrow dark">FLIGHT INFORMATION</p><h2>全員機票資訊</h2></div>
            <p>依 8 份電子機票逐一核對；票號僅顯示末四碼，避免在公開網站暴露完整識別資料。</p>
          </div>

          <div className="flight-summary">
            <div><span>去程 · MU2946</span><strong>11/18　11:40 → 14:00</strong><p>高雄小港 KHH → 南京祿口 NKG T2</p></div>
            <div><span>回程 · MU2945</span><strong>11/25　07:50 → 10:10</strong><p>南京祿口 NKG T2 → 高雄小港 KHH</p></div>
            <div><span>共同資訊</span><strong>訂位代號 NXQTTF</strong><p>中國東方航空 · 每人托運 1 件，每件 23 公斤</p></div>
          </div>

          <div className="hotel-summary">
            <div><span>11/18–11/23</span><strong>南京南站清木尚酒店</strong><p>前六晚住宿</p></div>
            <div><span>11/24</span><strong>南京祿口機場麗楓酒店</strong><p>最後一晚，使用預約接送服務</p></div>
          </div>

          <div className="ticket-grid">
            {tickets.map((ticket, index) => (
              <article className="ticket-card" key={ticket.englishName}>
                <div className="ticket-index">{String(index + 1).padStart(2, "0")}</div>
                <div><small>旅客姓名</small><h3>{ticket.name}</h3><p>{ticket.englishName}</p></div>
                <div className="ticket-number"><small>電子機票</small><b>•••• {ticket.ticketSuffix}</b></div>
              </article>
            ))}
          </div>
          <p className="ticket-note">請以護照或台胞證上的英文姓名辦理報到；航班時間仍應於出發前再次向航空公司確認。</p>
        </section>
      ) : (
        <section className="ledger section-wrap">
          <div className="section-heading">
            <div><p className="eyebrow dark">SHARED EXPENSES</p><h2>旅費共享記帳</h2></div>
            <p>資料同步儲存，同行成員開啟網站即可看見最新帳目。</p>
          </div>
          <div className="ledger-overview">
            <div className="total-card"><small>目前總支出</small><strong><span>NT$</span> {money(total)}</strong><p>{expenses.length} 筆共同旅程紀錄</p></div>
            <div className="mini-stat"><small>全員均分</small><b>{expenses.filter((x) => x.splitMode === "all").length}</b><span>筆</span></div>
            <div className="mini-stat"><small>自選成員</small><b>{expenses.filter((x) => x.splitMode === "custom").length}</b><span>筆</span></div>
          </div>

          <div className="ledger-grid">
            <form className="expense-form" onSubmit={addExpense}>
              <div className="form-title"><span>＋</span><div><h3>新增一筆</h3><p>誰先付款、由誰分攤</p></div></div>
              <label>支出項目<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例如：晚餐、計程車" /></label>
              <label>金額（新台幣）<input inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" /></label>
              <label>付款人<select value={form.payer} onChange={(e) => setForm({ ...form, payer: e.target.value })}>{members.map((name) => <option key={name}>{name}</option>)}</select></label>
              <fieldset><legend>這筆費用怎麼算？</legend>
                <div className="split-options">
                  <button type="button" className={form.splitMode === "all" ? "active" : ""} onClick={() => setForm({ ...form, splitMode: "all" })}><b>8 人平均分攤</b><span>每個人都算一份</span></button>
                  <button type="button" className={form.splitMode === "custom" ? "active" : ""} onClick={() => setForm({ ...form, splitMode: "custom" })}><b>自選成員分攤</b><span>勾選 1 人、2 人、3 人或更多</span></button>
                </div>
              </fieldset>
              {form.splitMode === "custom" && (
                <fieldset className="participant-picker">
                  <legend>勾選分攤成員 <span>已選 {form.participants.length} 人</span></legend>
                  <div>
                    {members.map((name) => (
                      <label key={name}>
                        <input
                          type="checkbox"
                          checked={form.participants.includes(name)}
                          onChange={() => setForm((old) => ({
                            ...old,
                            participants: old.participants.includes(name)
                              ? old.participants.filter((member) => member !== name)
                              : [...old.participants, name],
                          }))}
                        />
                        <span>{name}</span>
                      </label>
                    ))}
                  </div>
                  {form.participants.length > 0 && form.amount && Number(form.amount) > 0 && <p>每人分攤 NT$ {money(Number(form.amount) / form.participants.length)}</p>}
                </fieldset>
              )}
              {error && <p className="form-error">{error}</p>}
              <button className="submit-expense" disabled={saving}>{saving ? "儲存中…" : "儲存這筆帳"}</button>
            </form>

            <div className="balance-list">
              <div className="form-title"><span>↗</span><div><h3>成員結算</h3><p>正數為應收，負數為應付</p></div></div>
              {summary.map((item) => <div className="balance-row" key={item.name}><div className="avatar">{item.name.slice(-1)}</div><div><b>{item.name}</b><span>代墊 {money(item.paid)} · 分攤 {money(item.share)}</span></div><strong className={item.net >= 0 ? "positive" : "negative"}>{item.net >= 0 ? "+" : "−"}{money(Math.abs(item.net))}</strong></div>)}
            </div>
          </div>

          <div className="history">
            <div className="history-head"><h3>支出明細</h3><span>{loading ? "讀取中…" : `共 ${expenses.length} 筆`}</span></div>
            {!loading && expenses.length === 0 && <div className="empty">還沒有帳目，從上方新增第一筆旅費吧。</div>}
            {expenses.map((item) => <div className="expense-row" key={item.id}>
              <div><b>{item.title}</b><span>{item.payer} 付款 · {item.splitMode === "all" ? "8 人均分" : `${item.participants.join("、")} 分攤`}</span></div>
              <strong>NT$ {money(item.amount)}</strong><button onClick={() => removeExpense(item.id)} aria-label={`刪除 ${item.title}`}>刪除</button>
            </div>)}
          </div>
        </section>
      )}
      <footer><div><b>南京慢遊記</b><span>NANJING · 2026</span></div><p>願我們走得從容，也記得每一段同行。</p></footer>
    </main>
  );
}
