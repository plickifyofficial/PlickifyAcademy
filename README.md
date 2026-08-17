# Plickify Academy

একটি সম্পূর্ণ Academic SaaS — অনলাইন কোর্স, লেসন, এনরোলমেন্ট, প্রগ্রেস ট্র্যাকিং, অ্যাডমিন প্যানেল ও Stripe পেমেন্ট।

## টেক স্ট্যাক

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS 4 + Hind Siliguri (বাংলা font)
- **Database & Auth:** Supabase (PostgreSQL + RLS)
- **Payment:** Stripe Checkout
- **Hosting:** Vercel

## ফিচার

- 📚 কোর্স & লেসন (video embed, free preview)
- 🔐 Authentication (Supabase Auth, email/password)
- 📊 Student Dashboard (enrollment + progress bar)
- 🛠️ Admin Panel (course/lesson CRUD)
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
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (webhook-এর জন্য) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | publishable key |
| `STRIPE_WEBHOOK_SECRET` | `stripe listen` দিয়ে যুক্ত করা webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

## Supabase সেটআপ

1. [supabase.com](https://supabase.com) এ project তৈরি করুন।
2. **SQL Editor** খুলে `supabase/schema.sql`-এর পুরোটা পেস্ট করে **Run** করুন।
   - এটি সব table, RLS policy, trigger আর `handle_new_user` ফাংশন তৈরি করবে।
3. এনরোলমেন্টের পরে প্রথম user-কে admin করতে:
   ```sql
   update public.profiles set role = 'admin'
   where id = '<user-uuid>';
   ```
   (user UUID: Dashboard → Authentication → Users)

## Stripe সেটআপ

```bash
# webhook local এ listen করতে:
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
3. `NEXT_PUBLIC_APP_URL` = deployed URL দিতে ভুলবেন না।