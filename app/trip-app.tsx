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

const expensesEndpoint = "https://jinling-nanjing-trip-2026.dancry800102.chatgpt.site/api/expenses";

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
    note: "南京博物院免費但須實名預約，建議提前 7 天於「南京博物院」微信小程序預約 09:00–13:00 上午場，參考放票時間為每日 18:00；南京總統府票價參考約人民幣 35 元，建議提前 2 天於官方微信小程序購票，參考放票時間為每日 00:00。兩館週一閉館，南京 1912 街區免費且無需預約；入園請攜帶台胞證或護照，實際放票與票價以官方最新公告為準。",
    stops: [
      { time: "08:30–09:15", title: "南京南站出發", detail: "搭地鐵 3 號線往林場方向至大行宮站，轉 2 號線往經天路方向至明故宮站，由 1 號出口沿中山東路向東步行約 300 公尺。全程約 13 公里，約 35～40 分鐘。" },
      { time: "09:15–12:00", title: "南京博物院", detail: "安排約 2.5～3 小時，重點參觀歷史館，以及還原民國老街、適合拍照的民國館。" },
      { time: "12:00–13:30", title: "博物院周邊午餐", detail: "可前往博物院周邊或大行宮商圈用餐。", food: "小金陵鹽水鴨、南京大牌檔（大行宮新世紀廣場店）或附近小吃店；推薦鹽水鴨、鴨血粉絲湯、美齡粥與生煎包。" },
      { time: "13:30–13:50", title: "前往南京總統府", detail: "由明故宮站搭地鐵 2 號線往油坊橋方向至大行宮站，從 5 號出口沿長江路步行約 400 公尺；全程約 15 分鐘。" },
      { time: "13:50–16:30", title: "南京總統府", detail: "安排約 2～2.5 小時，參觀中區總統府官署、西區孫中山臨時大總統辦公室與煦園，以及東區行政院舊址。" },
      { time: "16:30–16:35", title: "步行前往南京 1912 街區", detail: "總統府與 1912 街區相鄰，距離約 200 公尺，步行約 2～3 分鐘。" },
      { time: "16:35–20:30", title: "南京 1912 街區與晚餐", detail: "漫遊由民國風格建築改建的餐飲、酒吧與文創街區，欣賞入夜後的街景。", food: "可選「民國民國菜」體驗老南京風味，或街區內的精緻江浙菜、異國料理與胡桃里等音樂餐廳。" },
      { time: "20:30–21:15", title: "返回南京南站", detail: "從 1912 街區步行約 6 分鐘至大行宮站，搭地鐵 3 號線往秣周東路方向直達南京南站；約 10.5 公里，地鐵約 20 分鐘，全程約 30 分鐘。" },
    ],
  },
  {
    date: "11/20", weekday: "五", label: "DAY 3", title: "鍾山景區與老門東巡禮",
    transport: "地鐵 3 號線轉 2 號線＋景區觀光車＋步行", hotel: "南京南站清木尚酒店",
    note: "中山陵須提前 1–3 天預約，免費入場；週一祭堂閉館、戶外園區正常開放。建議購買涵蓋明孝陵、美齡宮、音樂台與靈谷寺的鐘山景區聯票（參考價約人民幣 100 元）。大報恩寺參考全票約人民幣 90 元，19:00 停止入場、展館約 19:30 關閉；老門東為免費開放式街區、無需預約。實際票價與開放時間請以官方公告為準。",
    stops: [
      { time: "08:30–09:10", title: "南京南站出發", detail: "搭地鐵 3 號線至大行宮站，轉 2 號線至苜蓿園站 1 號出口；約 15 公里，車程約 28 分鐘。" },
      { time: "09:10–09:30", title: "梧桐大道漫步", detail: "沿陵園路段拍照散步約 20 分鐘，再步行約 1.2 公里、15–20 分鐘前往明孝陵 5 號／7 號門。" },
      { time: "09:30–11:30", title: "明孝陵", detail: "重點參觀石象路神道、享殿與方城明樓，預留約 2 小時。" },
      { time: "11:35–12:35", title: "美齡宮", detail: "由明孝陵步行約 800 公尺、10–12 分鐘，或搭乘景區觀光車前往；參觀國民政府主席官邸約 1 小時。" },
      { time: "12:40–13:30", title: "中山陵商業街午餐", detail: "可在中山陵商業街或美齡宮附近用餐。", food: "南京大排檔（中山陵店）：美齡粥、鹽水鴨、金牌羅漢齋、古法糖芋苗；若想快速用餐，商業街亦有肯德基、麥當勞等便餐。" },
      { time: "13:40–15:30", title: "中山陵", detail: "從美齡宮搭景區觀光車 1 號線／2 號線，約 2.5 公里、8 分鐘抵達中山陵廣場；攀登 392 級台階至祭堂，預留 1.5–2 小時。" },
      { time: "15:30–16:30", title: "音樂台", detail: "由中山陵步行約 400 公尺、5 分鐘抵達，欣賞露天建築與白鴿，停留約 1 小時。" },
      { time: "16:40–17:40", title: "靈谷寺與靈谷景區", detail: "從音樂台搭景區觀光車 4 號線／大環線，約 2.8 公里、10 分鐘；參觀無梁殿，可依體力登靈谷塔遠眺。" },
      { time: "17:40–18:25", title: "前往大報恩寺", detail: "從靈谷寺出口搭觀光車／公車至鐘靈街站，搭地鐵 2 號線至大行宮站轉 3 號線，在雨花門站 4 號出口下車；也可改走地鐵 1 號線至中華門站 2 號出口。接駁、地鐵與步行合計約 45 分鐘。" },
      { time: "18:25–19:40", title: "大報恩寺遺址公園", detail: "參觀地宮遺址、現代琉璃寶塔與夜間燈光；建議 19:00 前入場。結束後沿雨花路、中華門方向步行約 1.2 公里、15 分鐘前往老門東。" },
      { time: "19:45–21:30", title: "老門東歷史文化街區", detail: "漫步明清風格老街，享用晚餐與南京在地小吃。", food: "蔣有記牛肉鍋貼與牛肉湯、陸氏梅花糕、小鄭酥燒餅（鴨油、蔥油、赤豆口味）；想坐下用餐可選尋魏·金陵菜或德明飯店。" },
      { time: "21:30 後", title: "返回南京南站", detail: "步行至武定門站搭地鐵 3 號線，或至三山街站搭 1 號線直達南京南站；約 8 公里，車程約 15–20 分鐘。" },
    ],
  },
  {
    date: "11/21", weekday: "六", label: "DAY 4", title: "牛首攬勝與秦淮夜色",
    transport: "計程車／叫車＋景區接駁車＋地鐵＋步行＋秦淮河畫舫", hotel: "南京南站清木尚酒店",
    note: "牛首山建議由東門入園並購買景區接駁車票，提前透過官方管道實名購票；夫子廟街區免費，秦淮河畫舫請提前查詢官方碼頭、班次與票價。實際開放與預約規則以官方公告為準。",
    stops: [
      { time: "08:30–09:15", title: "前往牛首山", detail: "從南京南站清木尚酒店出發，建議搭乘計程車或叫車前往牛首山東門。" },
      { time: "09:15–09:30", title: "入園與景區接駁", detail: "由東門入園後搭乘景區接駁車直達天闕站，節省山路步行時間。" },
      { time: "09:30–12:30", title: "牛首山文化旅遊區", detail: "重點參觀佛頂宮水景廣場、禪境大觀與地下萬佛廊，再依時間前往佛頂塔或佛頂寺。" },
      { time: "12:30–14:00", title: "下山與午餐", detail: "搭接駁車返回出口，簡單用餐後前往夫子廟商業街區。" },
      { time: "14:00–17:30", title: "夫子廟商業街區", detail: "漫步大照壁、江南貢院與秦淮河畔，逛街並品嚐赤豆元宵、牛肉鍋貼、鴨油酥燒餅等金陵小吃。" },
      { time: "17:30–19:00", title: "秦淮特色晚餐", detail: "可在夫子廟周邊享用金陵傳統料理，等待河岸亮燈。" },
      { time: "19:00–20:30", title: "夜遊秦淮河", detail: "搭乘畫舫欣賞十里秦淮兩岸燈景，結束後搭地鐵返回南京南站。" },
    ],
  },
  {
    date: "11/22", weekday: "日", label: "DAY 5", title: "名山秋色與湖光城牆",
    transport: "地鐵＋公車／計程車＋步行", hotel: "南京南站清木尚酒店",
    note: "棲霞山紅楓季建議提前透過「南京棲霞山」官方管道購票；雞鳴寺與明城牆可現場或線上購票，玄武湖免費開放。請隨身攜帶台胞證，實際票價與交通班次以官方公告為準。",
    stops: [
      { time: "08:00–09:15", title: "前往棲霞山", detail: "由南京南站搭地鐵前往南京站或燕子磯方向，再轉乘公車或計程車至棲霞山景區。" },
      { time: "09:15–12:30", title: "棲霞山賞楓", detail: "參觀棲霞寺、舍利塔、千佛崖與桃花湖，漫步山林欣賞紅楓秋色。" },
      { time: "12:30–14:00", title: "午餐與返回市區", detail: "可品嚐棲霞寺素齋面或棲霞古街小吃，用餐後前往雞鳴寺。" },
      { time: "14:00–15:15", title: "雞鳴寺", detail: "參拜千年古剎，參觀毗盧寶殿與藥師佛塔，從後門前往解放門城牆入口。" },
      { time: "15:15–16:45", title: "明城牆台城段", detail: "登上明城牆遠眺玄武湖與紫金山，沿台城段散步感受古城風貌。" },
      { time: "16:45–18:30", title: "玄武湖公園", detail: "下城後漫步玄武湖畔，依體力安排遊船或環湖電瓶車，傍晚返回南京南站。" },
    ],
  },
  {
    date: "11/23", weekday: "一", label: "DAY 6", title: "市區退房・前往句容探親",
    transport: "南京南站 → 句容（親友接送／計程車／客運）", hotel: "句容親友家或句容當地住宿",
    stops: [
      { time: "上午", title: "清木尚酒店退房", detail: "在南京南站清木尚酒店辦理退房，攜帶全部行李出發。" },
      { time: "上午／中午", title: "前往句容", detail: "依親友安排搭乘接送車、計程車或客運前往句容，抵達後安頓行李。" },
      { time: "全天", title: "句容探親訪友", detail: "與親友團聚、家庭聚會，當日行程以家人安排為主。" },
    ],
  },
  {
    date: "11/24", weekday: "二", label: "DAY 7", title: "句容探親訪友",
    transport: "親友接送／當地短程交通", hotel: "句容親友家或句容當地住宿",
    stops: [
      { time: "全天", title: "句容探親", detail: "探親訪友、走訪鄉里，行程依親友安排彈性進行。" },
      { time: "午餐／晚餐", title: "家鄉特色美食", detail: "與親友聚餐，品嚐句容當地料理並確認隔日清晨送機時間。" },
    ],
  },
  {
    date: "11/25", weekday: "三", label: "DAY 8", title: "親戚送機・順利返台",
    transport: "句容親戚專車 → 南京祿口國際機場", hotel: "溫暖的家",
    note: "回程航班 07:50 起飛，建議約 05:50 抵達機場辦理報到與出境手續；請前一晚再次確認車程、送機時間、護照／台胞證與行李。",
    stops: [
      { time: "05:00 左右", title: "由句容出發送機", detail: "由親戚清晨開車前往南京祿口國際機場，車程約 40～50 分鐘，預留路況與停車緩衝時間。" },
      { time: "05:50 左右", title: "抵達南京祿口機場", detail: "辦理報到、行李托運與出境手續，確認登機門資訊。" },
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
      const response = await fetch(expensesEndpoint, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const rows = await response.json() as Array<{
        id: number;
        title: string;
        amount: number | string;
        payer: string;
        splitMode: "all" | "custom";
        participants: string[];
        createdAt: string;
      }>;
      setExpenses(rows.map((row) => ({
        id: row.id,
        title: row.title,
        amount: Number(row.amount),
        payer: row.payer === "李素貞" ? "李素珍" : row.payer === "蔡壁燦" ? "蔡璧燦" : row.payer,
        splitMode: row.splitMode,
        participants: (row.participants ?? []).map((name) => name === "李素貞" ? "李素珍" : name === "蔡壁燦" ? "蔡璧燦" : name),
        createdAt: row.createdAt,
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          amount,
          payer: form.payer,
          splitMode: form.splitMode,
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
    const response = await fetch(`${expensesEndpoint}?id=${id}`, {
      method: "DELETE",
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
            <div><span>11/18–11/22 · 五晚</span><strong>南京南站清木尚酒店</strong><p>南京市區住宿</p></div>
            <div><span>11/23–11/24 · 兩晚</span><strong>句容親友家或句容當地住宿</strong><p>探親期間住宿，11/25 由親戚清晨送機</p></div>
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
