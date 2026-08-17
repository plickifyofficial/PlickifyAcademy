import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CourseCard } from "@/components/courses/course-card";

export const metadata = {
  title: "Plickify Academy | শেখো, বেড়ে উঠো",
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <>
      <section className="bg-gradient-to-b from-indigo-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28" data-aos="fade-up">
          <span className="inline-block rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700">
            অনলাইন একাডেমি
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight text-zinc-900 sm:text-5xl">
            নিজের দক্ষতা বাড়ান,{" "}
            <span className="text-indigo-600">ভবিষ্যৎ গড়ুন</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600">
            প্লিকিফাই অ্যাকাডেমিতে আধুনিক কোর্স, অভিজ্ঞ প্রশিক্ষক আর সহজ শেখার
            পদ্ধতিতে নিজের ক্যারিয়ার এগিয়ে নিন।
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/courses"
              className="rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              কোর্স দেখুন
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-zinc-300 bg-white px-8 py-3 text-base font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              ফ্রি একাউন্ট খুলুন
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between" data-aos="fade-up">
          <h2 className="text-2xl font-bold text-zinc-900">জনপ্রিয় কোর্স</h2>
          <Link
            href="/courses"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            সব দেখুন →
          </Link>
        </div>
        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center text-zinc-500">
            শীঘ্রই কোর্স আসছে! অ্যাডমিন প্যানেল থেকে কোর্স যোগ করুন।
          </p>
        )}
      </section>

      <section className="bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold text-zinc-900">
            কেন প্লিকিফাই অ্যাকাডেমি?
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3" data-aos="fade-up" data-aos-delay="100">
            {[
              {
                icon: "fa-solid fa-graduation-cap",
                title: "গুণগত কোর্স",
                desc: "বাস্তব-জীবনের প্রজেক্ট ভিত্তিক শেখা, অভিজ্ঞ শিক্ষকদের তত্ত্বাবধানে।",
              },
              {
                icon: "fa-solid fa-chart-line",
                title: "প্রগ্রেস ট্র্যাকিং",
                desc: "প্রতিটি লেসনের অগ্রগতি দেখুন, নিজের গতিতে শিখুন।",
              },
              {
                icon: "fa-solid fa-credit-card",
                title: "সহজ পেমেন্ট",
                desc: "Stripe দিয়ে নিরাপদ অনলাইন পেমেন্ট, ইনস্ট্যান্ট এনরোলমেন্ট।",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl text-indigo-600">
                  <i className={f.icon} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
