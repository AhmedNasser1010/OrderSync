"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Tab = "terms" | "privacy";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-6 mb-2 font-ProximaNovaBold text-lg text-color-1">
      {children}
    </h2>
  );
}

function BulletedList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-2 font-ProximaNovaThin text-color-5 leading-relaxed"
        >
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-color-2" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TermsEn() {
  return (
    <div className="text-sm font-ProximaNovaThin leading-relaxed text-color-5">
      <p className="font-ProximaNovaMed text-color-1">
        Welcome to Zajil. By creating an account and using our services, you
        agree to the following terms:
      </p>
      <SectionHeading>1. Account Eligibility</SectionHeading>
      <p>
        You must provide accurate information (Name, Phone Number, and Address)
        when registering. You are responsible for maintaining the
        confidentiality of your account.
      </p>
      <SectionHeading>2. Order Placement &amp; Cancellation</SectionHeading>
      <BulletedList
        items={[
          <span key="1">
            You can cancel your order free of charge only if the restaurant has
            not started preparing it yet.
          </span>,
          <span key="2">
            Once the restaurant accepts and begins preparing your food, the
            order cannot be canceled, and you are obligated to pay its full
            amount.
          </span>,
        ]}
      />
      <SectionHeading>3. Delivery &amp; Customer Availability</SectionHeading>
      <BulletedList
        items={[
          <span key="1">
            When the delivery rider arrives at your location, they will wait for
            a maximum of 10 minutes while trying to contact you.
          </span>,
          <span key="2">
            If you fail to respond or show up, the order will be canceled, and
            the full cost will be added as a debt to your account to be paid on
            your next order.
          </span>,
        ]}
      />
      <SectionHeading>4. Food Quality &amp; Allergies</SectionHeading>
      <BulletedList
        items={[
          <span key="1">
            Zajil acts as an intermediary delivery service. The partner
            restaurant is solely responsible for the food quality, preparation,
            and ingredient safety (including food allergies).
          </span>,
          <span key="2">
            If your order arrives damaged, incorrect, or missing items, please
            take a photo and contact our customer support within 30 minutes of
            delivery for a resolution.
          </span>,
        ]}
      />
    </div>
  );
}

function PrivacyEn() {
  return (
    <div className="text-sm font-ProximaNovaThin leading-relaxed text-color-5">
      <p className="font-ProximaNovaMed text-color-1">
        At Zajil, your privacy is our priority. This policy explains how we
        handle your personal data:
      </p>
      <SectionHeading>1. Data We Collect</SectionHeading>
      <p>
        We only collect the essential information needed to deliver your food:
        your Name, Phone Number, Delivery Address, and precise GPS Location.
      </p>
      <SectionHeading>2. How We Use Your Data</SectionHeading>
      <BulletedList
        items={[
          <span key="1">
            Your GPS location is used in the background to track the delivery
            rider and ensure your food arrives accurately.
          </span>,
          <span key="2">
            Your name, phone number, and address are shared only with the
            assigned restaurant and delivery rider for the sole purpose of
            fulfilling your order.
          </span>,
        ]}
      />
      <SectionHeading>3. Data Security &amp; Sharing</SectionHeading>
      <BulletedList
        items={[
          <span key="1">
            We secure your data using industry-standard protection methods.
          </span>,
          <span key="2">
            We do not sell, rent, or share your personal information with any
            third-party marketing companies.
          </span>,
          <span key="3">
            If you use electronic payment, your card details are processed
            securely by certified payment gateways and are never stored on our
            servers.
          </span>,
        ]}
      />
    </div>
  );
}

function TermsAr() {
  return (
    <div
      dir="rtl"
      className="text-sm font-ProximaNovaThin leading-relaxed text-color-5"
    >
      <p className="font-ProximaNovaMed text-color-1">
        أهلاً بك في تطبيق زاجل. باستخدامك للتطبيق وإنشاء حساب، فإنك توافق على
        الشروط التالية:
      </p>
      <SectionHeading>1. أهلية وبيانات الحساب</SectionHeading>
      <p>
        يجب عليك تقديم معلومات دقيقة (الاسم، رقم الهاتف، وعنوان التوصيل) عند
        التسجيل. وتتحمل المسؤولية الكاملة عن الحفاظ على سرية حسابك ونشاطه.
      </p>
      <SectionHeading>2. طلب الطعام وإلغائه</SectionHeading>
      <BulletedList
        items={[
          <span key="1">
            يمكنك إلغاء الطلب مجاناً وبدون رسوم فقط طالما أن المطعم لم يبدأ في
            تحضيره بعد.
          </span>,
          <span key="2">
            بمجرد قبول المطعم للطلب والبدء في تجهيزه، لا يمكن إلغاء الطلب بأي
            حال، ويلتزم العميل بدفع قيمته الكاملة.
          </span>,
        ]}
      />
      <SectionHeading>3. التوصيل وتواجد العميل</SectionHeading>
      <BulletedList
        items={[
          <span key="1">
            عند وصول مندوب التوصيل إلى موقعك، يلتزم بالانتظار لمدة 10 دقائق كحد
            أقصى مع محاولة الاتصال بك.
          </span>,
          <span key="2">
            في حال عدم الرد أو عدم التواجد بعد انتهاء المهلة، يحق للتطبيق إلغاء
            الطلب مع احتساب قيمته كمديونية (دين) على حسابك تلتزم بدفعها في طلبك
            القادم.
          </span>,
        ]}
      />
      <SectionHeading>4. جودة الطعام والحساسية</SectionHeading>
      <BulletedList
        items={[
          <span key="1">
            تطبيق زاجل هو وسيط لتوصيل الطعام فقط. المطعم الشريك هو المسؤول
            الأول والأخير عن جودة الطعام، طريقة تحضيره، وسلامة مكوناته (بما في
            ذلك حالات الحساسية من الأطعمة).
          </span>,
          <span key="2">
            في حال وصول الطلب تالفاً، خاطئاً، أو ناقصاً، يرجى تصوير الطلب
            والتواصل مع الدعم الفني عبر التطبيق خلال 30 دقيقة تفادياً لضياع
            حقك في التعويض.
          </span>,
        ]}
      />
    </div>
  );
}

function PrivacyAr() {
  return (
    <div
      dir="rtl"
      className="text-sm font-ProximaNovaThin leading-relaxed text-color-5"
    >
      <p className="font-ProximaNovaMed text-color-1">
        في تطبيق زاجل، نضع خصوصية بياناتك في مقدمة أولوياتنا. توضح هذه السياسة
        كيف نتعامل مع بياناتك الشخصية:
      </p>
      <SectionHeading>1. البيانات التي نجمعها</SectionHeading>
      <p>
        نحن نجمع فقط البيانات الأساسية الضرورية لإيصال الطلب إليك، وهي: الاسم،
        رقم الهاتف، عنوان التوصيل، والموقع الجغرافي (GPS) الدقيق.
      </p>
      <SectionHeading>2. كيف نستخدم بياناتك</SectionHeading>
      <BulletedList
        items={[
          <span key="1">
            يتم استخدام موقعك الجغرافي لتحديد مكانك بدقة، وللسماح لك بتتبع
            المندوب على الخريطة وحتى نضمن وصول الطعام ساخناً وبأسرع وقت.
          </span>,
          <span key="2">
            يتم مشاركة اسمك، رقم هاتفك، وعنوانك مع المطعم والمندوب المسؤولين عن
            طلبك فقط لإتمام عملية التحضير والتوصيل.
          </span>,
        ]}
      />
      <SectionHeading>3. أمن البيانات والمشاركة مع أطراف أخرى</SectionHeading>
      <BulletedList
        items={[
          <span key="1">
            نحن نحمي بياناتك باستخدام معايير أمان تقنية معتمدة، ونلتزم بعدم
            بيع، تأجير، أو مشاركة بياناتك الشخصية مع أي شركات إعلانية أو أطراف
            خارجية.
          </span>,
          <span key="2">
            في حال الدفع الإلكتروني، يتم معالجة بيانات بطاقتك بشكل مشفر وآمن عبر
            بوابات دفع معتمدة، ولا نقوم بتخزين تفاصيل بطاقتك على خوادمنا أبداً.
          </span>,
        ]}
      />
    </div>
  );
}

export default function TermsAndPrivacyPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale === "ar";
  const [tab, setTab] = useState<Tab>(() =>
    typeof window !== "undefined" && window.location.hash === "#privacy"
      ? "privacy"
      : "terms"
  );

  useEffect(() => {
    const onHashChange = () => {
      setTab(
        window.location.hash === "#privacy" ? "privacy" : "terms"
      );
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const tabs: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: "terms", label: t("TermsConditions"), icon: FileText },
    { key: "privacy", label: t("PrivacyPolicy"), icon: ShieldCheck },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pb-40 pt-6 sm:px-6 lg:pt-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          aria-label={t("Back")}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-color-7 bg-card text-color-6 transition-colors hover:bg-color-7/40"
        >
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <div className="flex-1">
          <h1 className="font-Beiruti text-3xl leading-none text-color-1 sm:text-4xl">
            {t("TermsAndPrivacy")}
          </h1>
          <p className="mt-1.5 text-sm font-ProximaNovaThin text-color-8">
            {t("TermsAndPrivacySubtitle")}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = item.key === tab;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              aria-pressed={active}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border py-3 font-ProximaNovaSemiBold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-color-2/50 outline-none",
                active
                  ? "border-color-2 bg-color-2 text-white"
                  : "border-color-7 bg-card text-color-6 hover:bg-color-7/40"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border border-color-7 bg-card p-6 shadow-sm">
        {tab === "terms"
          ? isAr
            ? <TermsAr />
            : <TermsEn />
          : isAr
            ? <PrivacyAr />
            : <PrivacyEn />}
      </div>
    </div>
  );
}
