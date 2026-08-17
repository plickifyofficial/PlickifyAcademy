# Plickify Academy

একটি সম্পূর্ণ Academic SaaS — অনলাইন কোর্স, লেসন, এনরোলমেন্ট, প্রগ্রেস ট্র্যাকিং, অ্যাডমিন প্যানেল (WordPress/cPanel-style) ও Stripe পেমেন্ট।

## টেক স্ট্যাক

- **Framework:** Next.js 16 (App Router, TypeScript, React component-driven)
- **Styling:** Tailwind CSS 4 (fully responsive) + Hind Siliguri (বাংলা font)
- **Animation:** AOS (Animate On Scroll) — free version
- **Icons:** Font Awesome (free icons) + open-source SVG resources
- **Database & Auth:** Supabase (PostgreSQL + RLS, Google OAuth)
- **Payment:** Stripe Checkout
- **Backend:** Node.js (Vercel Serverless Functions)
- **Hosting:** Vercel

## ফিচার

- 📚 কোর্স & লেসন (video embed, free preview)
- 🔐 Authentication (Supabase Auth — Google only)
- 📊 Student Dashboard (Tutor LMS-style — enrollment, progress bar, stats)
- 🛠️ Admin Panel (WordPress/cPanel-style — courses, lessons, students, orders, revenue)
- 💳 Stripe payment + webhook (auto-enrollment)

## লোকাল সেটআপ

```bash
npm install
cp .env.example .env.local   # সব key ভরে নিন
```

`.env.local`-এ যা যা লাগবে:

| Variable | কোথায় পাবেন |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | একই জায়গায় anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (admin/webhook-এর জন্য) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | publishable key |
| `STRIPE_WEBHOOK_SECRET` | `stripe listen` দিয়ে যুক্ত করা webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

## Supabase সেটআপ

1. [supabase.com](https://supabase.com) এ project তৈরি করুন।
2. **SQL Editor** খুলে `supabase/schema.sql`-এর পুরোটা পেস্ট করে **Run** করুন।
3. **Authentication → URL Configuration:**
   - Site URL: `https://www.plickifyacademy.com`
   - Redirect URLs: `https://www.plickifyacademy.com/auth/callback` এবং `http://localhost:3000/auth/callback`
4. **Google OAuth চালু করুন:**
   - Supabase → Authentication → Providers → **Google** → Enable
   - [Google Cloud Console](https://console.cloud.google.com) → OAuth consent screen → OAuth 2.0 Client IDs (Web application) বানান
   - Authorized redirect URI: `https://<your-supabase-ref>.supabase.co/auth/v1/callback`
   - Client ID ও Secret Supabase-এ বসান
4. প্রথম user-কে admin বানাতে:
   ```sql
   update public.profiles set role = 'admin'
   where id = '<user-uuid>';
   ```
   (user UUID: Dashboard → Authentication → Users)

## Stripe সেটআপ

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Deploy-এর পর Stripe Dashboard → Developers → Webhooks এ `https://<your-domain>/api/webhooks/stripe` endpoint যোগ করুন।

## Dev Server

```bash
npm run dev
```

## Deploy to Vercel

1. Repo push করার পর [vercel.com/new](https://vercel.com/new) থেকে repo import করুন।
2. Environment variables (`.env.local`-এর সবগুলো) Project Settings → Environment Variables এ দিন।
3. `NEXT_PUBLIC_APP_URL` = `https://www.plickifyacademy.com` দিন।
4. Main domain (custom domain) যুক্ত থাকলে Vercel **Deployment Protection** disable করুন — নইলে site-এ প্রবেশ করতে login চাইবে।