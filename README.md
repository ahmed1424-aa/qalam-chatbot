# قلم ✒️ — مساعد مهارات الكتابة الأكاديمية

موقع عربي لمساعدة الطلاب والباحثين على تطوير الكتابة الأكاديمية. يتكوّن من واجهة ثابتة ووسيط API على Cloudflare Workers.

## الملفات

- `index.html` — واجهة الموقع، تُنشر على GitHub Pages.
- `worker.js` و`wrangler.toml` — وسيط API وإعداداته لـ Cloudflare Workers.
- `LICENSE` — رخصة MIT.

## نشر الواجهة على GitHub Pages

1. من المستودع افتح **Settings → Pages**.
2. في **Build and deployment** اختر **Deploy from a branch**، ثم الفرع `main` والمجلد `/ (root)`، واحفظ.
3. سيكون رابط الموقع: `https://ahmed1424-aa.github.io/qalam-chatbot/`.

## تشغيل المحادثة

1. ثبّت Wrangler وسجّل الدخول إلى Cloudflare، ثم من جذر المشروع أضف مفتاح Anthropic كسرّ وانشر الـ Worker:

   ```bash
   npx wrangler secret put ANTHROPIC_API_KEY
   npx wrangler deploy
   ```

2. في `index.html` استبدل قيمة `API_URL` برابط Worker الذي يظهر بعد النشر.
3. أبقِ `ALLOWED_ORIGIN` في `wrangler.toml` على `https://ahmed1424-aa.github.io`، ثم أعد نشر الـ Worker بعد تغييرها.

لا تضع مفتاح Anthropic في `index.html` أو في مستودع GitHub؛ أضفه فقط كسرّ في Cloudflare.
