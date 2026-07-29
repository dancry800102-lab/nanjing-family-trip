"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const members = ["李文龍", "馬僖慧", "李文斌", "黃富美", "李素玲", "蔡壁燦", "李素貞", "陳怡君"];

type Stop = { time: string; title: string; detail: string; food?: string };
type Day = { date: string; weekday: string; label: string; title: string; transport: string; hotel: string; stops: Stop[]; note?: string };
type Expense = { id: number; title: string; amount: number; payer: string; splitMode: "all" | "custom"; participants: string[]; createdAt: string };

const supabaseUrl = "https://riymnecjfrgeqiwnytdj.supabase.co";
const supabaseKey = "sb_publishable_897WJUODqwKH9FOBam_fdg_assAWeFv";
const expensesEndpoint = `${supabaseUrl}/rest/v1/expenses`;
const supabaseHeaders = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
};

const days: Day[] = [
  {
    date: "11/18", weekday: "三", label: "DAY 1", title: "抵達南京・新街口時尚漫遊",
    transport: "祿口機場 → 南京南站：地鐵 S1 號線；市區搭地鐵 1 號線", hotel: "南京南站青沐尚酒店",
    stops: [
      { time: "11:40–14:00", title: "高雄飛往南京", detail: "KHH 小港國際機場 → NKG 南京祿口國際機場 T2" },
      { time: "14:00–15:30", title: "飯店 Check-in", detail: "抵達飯店辦理入住，稍微休息。" },
      { time: "16:00–20:30", title: "新街口＋德基廣場", detail: "1 號線直達新街口站；7 號出口地下通道直通德基廣場。打卡奢華藝術洗手間與 8 樓德基藝術館。", food: "南京大牌檔（德基店）：金陵美齡粥、天王烤鴨包、王府泡椒雞。" },
      { time: "20:30", title: "返回飯店", detail: "新街口站搭地鐵 1 號線直達南京南站。" },
    ],
  },
  {
    date: "11/19", weekday: "四", label: "DAY 2", title: "東郊綠意・琉璃光影美學",
    transport: "地鐵 1 號線轉 2 號線", hotel: "南京南站青沐尚酒店",
    stops: [
      { time: "09:00–11:30", title: "鐘山風景區", detail: "苜蓿園站 1/3 號出口到梧桐大道，搭景區觀光車遊明孝陵石象路神道與方城明樓。" },
      { time: "11:30–13:30", title: "美齡宮＋午餐", detail: "參觀美齡宮後用餐。", food: "小廚娘淮揚菜（下馬坊店）：淮揚獅子頭、清蒸白花魚。" },
      { time: "13:30–15:30", title: "中山陵・博愛廣場", detail: "搭觀光車至博愛廣場拍照，長輩可不登 392 級台階。" },
      { time: "16:00–18:00", title: "大報恩寺遺址公園", detail: "中華門站附近，全平路、室內展館，欣賞琉璃光影與地宮聖物。" },
      { time: "18:30", title: "綠柳居晚餐", detail: "百年清真老字號。", food: "素菜包、牛腩煲、金陵鹽水鴨。" },
    ],
  },
  {
    date: "11/20", weekday: "五", label: "DAY 3", title: "南郊建築・老城南・秦淮夜遊",
    transport: "計程車／滴滴＋地鐵 3 號線", hotel: "南京南站青沐尚酒店",
    stops: [
      { time: "09:00–12:00", title: "牛首山文化旅遊區", detail: "飯店門口叫車約 20 分鐘；購買往返觀光車票直達山頂佛頂宮，內有手扶梯與電梯。" },
      { time: "12:30–14:30", title: "景區午餐與歇腳", detail: "清淡養生用餐。", food: "牛首山景區蔬食／梁武素食：羅漢齋、素什錦。" },
      { time: "15:00–16:30", title: "南京城牆・中華門甕城", detail: "登上平整城牆，俯瞰秦淮河。" },
      { time: "16:30–18:00", title: "瞻園", detail: "欣賞假山亭台、池塘錦鯉與幽靜江南名園。" },
      { time: "18:00–19:30", title: "老門東小吃巡禮", detail: "步行品嚐南京味。", food: "蔣有記牛肉鍋貼、牛肉粉絲湯、陸氏梅花糕、蓮湖糕團店桂花赤豆元宵。" },
      { time: "19:30–20:30", title: "夜遊外秦淮河", detail: "掃葉樓／石頭城碼頭或中華門碼頭搭畫舫，欣賞明城牆夜景。" },
    ],
  },
  {
    date: "11/21", weekday: "六", label: "DAY 4", title: "國寶文博盛宴・城市綠肺",
    transport: "地鐵 1／3 號線轉 2 號線", hotel: "南京南站青沐尚酒店",
    stops: [
      { time: "09:00–12:00", title: "南京博物院", detail: "明故宮站步行約 300 公尺；重點看歷史館與地下民國館。若未預約到，改六朝博物館。" },
      { time: "12:00–14:00", title: "科巷美食街", detail: "午餐慢慢吃。", food: "馨方園食府／廣迎居：金陵鹽水鴨、軟兜長魚、揚州獅子頭。" },
      { time: "14:30–16:00", title: "古雞鳴寺", detail: "參拜千年古剎，可品嚐寺內雞鳴賜福素麵。" },
      { time: "16:00–18:00", title: "玄武湖公園", detail: "從台城口進入，租環湖觀光電瓶車，輕鬆欣賞湖光山色與夕陽。" },
    ],
  },
  {
    date: "11/22", weekday: "日", label: "DAY 5", title: "近代歷史・頤和路民國風情",
    transport: "地鐵 3 號線＋短途計程車", hotel: "南京南站青沐尚酒店",
    stops: [
      { time: "09:30–12:00", title: "總統府", detail: "南京南站搭 3 號線至大行宮站，5 號出口步行 3 分鐘。" },
      { time: "12:00–13:30", title: "1912 街區午餐", detail: "就近用餐。", food: "小廚娘淮揚菜（1912 店）：松鼠桂魚、燉蛋燒牛肉。" },
      { time: "13:35–15:20", title: "六朝博物館", detail: "總統府正隔壁，欣賞貝聿銘事務所設計的竹林美學展館。" },
      { time: "15:30–17:30", title: "頤和路歷史文化街區", detail: "漫步黃牆黛瓦，於頤和公館內茶室喝花茶歇腳。" },
      { time: "18:00–19:30", title: "獅子樓晚餐", detail: "湖南路店。", food: "南京大獅子頭、生炊黃鱔。" },
    ],
  },
  {
    date: "11/23", weekday: "一", label: "DAY 6", title: "棲霞古剎・山林慢遊",
    transport: "計程車＋地鐵 S1 機場線", hotel: "祿口機場飯店（諾富特酒店／陸港客棧）",
    stops: [
      { time: "08:30", title: "退房＋順豐行李寄送", detail: "大型行李交給飯店前台，預約順豐同城寄至機場飯店。" },
      { time: "09:00–12:00", title: "棲霞山＋棲霞古鎮", detail: "叫車約 35 分鐘，參觀山腳千年古剎棲霞寺。" },
      { time: "12:00–14:00", title: "棲霞寺午餐", detail: "清淡素食。", food: "千佛齋素菜館：清蒸素鴨、羅漢齋。" },
      { time: "15:00", title: "前往機場飯店 Check-in", detail: "南京南站搭地鐵 S1 號線約 35 分鐘至祿口機場站，入住並領取寄達行李。" },
    ],
  },
  {
    date: "11/24", weekday: "二", label: "DAY 7", title: "彈性備用・輕鬆休息",
    transport: "以飯店接駁／短程計程車為主", hotel: "祿口機場飯店",
    note: "原攻略未安排此日；依 11/18–11/25 航班日期補為彈性日，可用於休息、採買伴手禮，或因天候調整前幾日景點。",
    stops: [
      { time: "全日", title: "保留彈性，不趕行程", detail: "建議在機場飯店周邊休息，提早整理行李並確認隔日 05:40 退房。" },
    ],
  },
  {
    date: "11/25", weekday: "三", label: "DAY 8", title: "早安南京・平安返台",
    transport: "飯店步行／接駁至航廈", hotel: "溫暖的家",
    stops: [
      { time: "05:40–05:50", title: "退房、前往東航櫃檯", detail: "步行約 5 分鐘抵達航廈，建議預留充足報到時間。" },
      { time: "07:50–10:10", title: "南京飛回高雄", detail: "NKG 南京祿口國際機場 T2 → KHH 小港國際機場。" },
    ],
  },
];

function money(value: number) {
  return new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 1 }).format(value);
}

export default function TripApp() {
  const [section, setSection] = useState<"trip" | "ledger">("trip");
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
        payer: row.payer,
        splitMode: row.split_mode,
        participants: row.participants ?? [],
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
              <div><span>01</span><h3>熱門場館先預約</h3><p>南京博物院提前 7 天零點搶約；中山陵免費但需預約；總統府需購票預約。</p></div>
              <div><span>02</span><h3>手機交通碼</h3><p>在微信或支付寶搜尋「南京地鐵電子卡」，綁定後進出閘門直接掃碼。</p></div>
              <div><span>03</span><h3>行李同城寄送</h3><p>11/23 退房時預約順豐同城，將大件行李送至機場飯店。</p></div>
              <div><span>04</span><h3>雨天備案</h3><p>南京博物院可改六朝博物館或江寧織造博物館；大報恩寺、德基藝術館與瞻園也適合雨天。</p></div>
            </div>
          </section>
        </>
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
