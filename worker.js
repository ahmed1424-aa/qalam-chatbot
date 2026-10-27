// Cloudflare Worker: وسيط آمن بين الصفحة وواجهة Anthropic API
// المفتاح يُحفظ كسرّ (Secret) ولا يظهر في الصفحة أبداً.

const SYSTEM = "أنت «قلم»، مدرّب متخصص في مهارات الكتابة الأكاديمية، تخاطب الطلاب والباحثين بالعربية الفصحى المبسّطة بأسلوب ودود ومشجّع ومحترف. مجالاتك: صياغة العنوان والسؤال البحثي وبيان المشكلة، المقدمة، مراجعة الأدبيات، المنهجية، عرض النتائج والمناقشة، الخاتمة، الملخص، إعادة الصياغة والأمانة العلمية، أنظمة التوثيق (APA وMLA وشيكاغو وهارفارد)، المراجعة اللغوية والأسلوبية، الرد على المحكّمين، وتنظيم وقت الكتابة. القواعد: (1) كن عملياً: قدّم هيكلاً أو قالباً أو مثالاً قبل/بعد كلما أمكن. (2) عند مراجعة نص، اعرض النص المحسّن ثم اشرح أهم التعديلات في نقاط قصيرة. (3) لا تؤلّف مراجع أو اقتباسات أو إحصاءات؛ وإن طُلب منك مثال توثيق فاذكر أنه توضيحي فقط. (4) لا تكتب بحثاً كاملاً بدلاً من الطالب، بل درّبه وأرشده، ويمكنك صياغة أمثلة قصيرة. (5) شجّع على الأمانة العلمية. (6) إن كان السؤال غامضاً فافترض أفضل تفسير وأجب، ثم اقترح سؤال متابعة واحداً في النهاية. (7) اجعل الإجابة موجزة ومنظمة (عناوين فرعية ونقاط)، وتجنّب الإطالة. (8) إن كان السؤال خارج الكتابة الأكاديمية فأجب باختصار ثم أعد توجيه الحديث بلطف إلى الكتابة.";

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN || "*"; // مثال: https://username.github.io
    const cors = {
      "Access-Control-Allow-Origin": allowed === "*" ? "*" : allowed,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors);
    if (allowed !== "*" && origin !== allowed) return json({ error: "forbidden" }, 403, cors);

    let body;
    try { body = await request.json(); } catch { return json({ error: "bad_json" }, 400, cors); }

    let msgs = Array.isArray(body.messages) ? body.messages : [];
    msgs = msgs
      .slice(-12)
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 6000) }));
    while (msgs.length && msgs[0].role !== "user") msgs.shift();
    if (!msgs.length || msgs[msgs.length - 1].role !== "user") return json({ error: "bad_messages" }, 400, cors);

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.MODEL || "claude-sonnet-5-5",
        max_tokens: 1200,
        system: SYSTEM,
        messages: msgs,
      }),
    });

    if (!upstream.ok) return json({ error: "upstream_error", status: upstream.status }, 502, cors);
    const data = await upstream.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    return json({ text }, 200, cors);
  },
};
