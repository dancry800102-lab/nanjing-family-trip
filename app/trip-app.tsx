"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const members = ["李文龍", "馬僖慧", "李文斌", "黃富美", "李素玲", "蔡壁燦", "李素珍", "陳怡君"];

type Stop = { time: string; title: string; detail: string; food?: string };
type Day = { date: string; weekday: string; label: string; title: string; transport: string; hotel: string; stops: Stop[]; note?: string };
type Expense = { id: number; title: string; amount: number; payer: string; splitMode: "all" | "custom"; participants: string[]; createdAt: string };
type Ticket = { name: string; englishName: string; ticketSuffix: string };

const tickets: Ticket[] = [
  { name: "李文龍", englishName: "LEE/WENLUNG", ticketSuffix: "7706" },
  { name: "黃富美", englishName: "HUANG/FUMEI", ticketSuffix: "7707" },
  { name: "馬僖慧", englishName: "MA/HSIHUI", ticketSuffix: "7708" },
  { name: "李文斌", englishName: "LEE/WENPING", ticketSuffix: "7709" },
  { name: "蔡壁燦", englishName: "TSAI/PITSAN", ticketSuffix: "7710" },
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
    transport: "地鐵與市區短程交通", hotel: "南京南站清木尚酒店",
    stops: [
      { time: "全天", title: "南京博物院", detail: "參觀館藏與民國館；熱門時段須提前預約。" },
      { time: "下午", title: "南京總統府", detail: "參觀近代歷史建築與園區。" },
      { time: "傍晚", title: "南京 1912 街區", detail: "漫步酒吧與文創街區，感受民國建築氛圍。" },
    ],
  },
  {
    date: "11/20", weekday: "五", label: "DAY 3", title: "鍾山景區與老門東巡禮",
    transport: "景區觀光車＋地鐵／計程車", hotel: "南京南站清木尚酒店",
    stops: [
      { time: "白天", title: "鍾山風景區", detail: "梧桐大道 → 明孝陵 → 美齡宮 → 中山陵 → 音樂台餵鴿子 → 靈谷寺。" },
      { time: "傍晚／晚上", title: "老門東歷史街區", detail: "漫步老城南街巷，品嚐在地小吃。" },
      { time: "晚上", title: "大報恩寺遺址公園", detail: "參觀遺址展館與琉璃塔夜景。" },
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
    transport: "地鐵＋步行＋秦淮河遊船", hotel: "南京南站清木尚酒店",
    stops: [
      { time: "上午", title: "雞鳴寺", detail: "參拜古剎後登上明城牆。" },
      { time: "上午／下午", title: "明城牆與玄武湖", detail: "沿城牆遠眺湖景，再遊覽玄武湖公園。" },
      { time: "晚上", title: "夜遊秦淮河", detail: "搭船賞秦淮夜景，續遊夫子廟商業街區。" },
    ],
  },
  {
    date: "11/23", weekday: "一", label: "DAY 6", title: "棲霞秋色",
    transport: "南京市區往返棲霞山", hotel: "南京南站清木尚酒店",
    stops: [
      { time: "全天", title: "棲霞山賞楓", detail: "前往棲霞山賞楓觀景，依體力安排步道與棲霞寺參觀。" },
    ],
  },
  {
    date: "11/24", weekday: "二", label: "DAY 7", title: "牛首攬勝與轉移機場住宿",
    transport: "計程車／叫車＋麗楓酒店接送服務", hotel: "南京祿口機場麗楓酒店",
    stops: [
      { time: "08:30", title: "退房與寄放行李", detail: "南京南站清木尚酒店辦理退房，將行李寄放櫃檯。" },
      { time: "09:00–13:00", title: "牛首山文化旅遊區", detail: "半日遊，重點參觀佛頂宮。" },
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
        payer: row.payer === "李素貞" ? "李素珍" : row.payer,
        splitMode: row.split_mode,
        participants: (row.participants ?? []).map((name) => name === "李素貞" ? "李素珍" : name),
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
