"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center" dir="rtl">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">أنت غير متصل بالإنترنت</h1>
        <p className="text-muted-foreground mb-6">
          يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
