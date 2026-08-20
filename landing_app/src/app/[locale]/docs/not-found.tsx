import { Link } from "@/i18n/routing";
import { FileX } from "lucide-react";
import { DOCS_PATH } from "@/lib/constants";

export default function DocNotFound() {
  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
          <FileX className="w-8 h-8 text-white/30" />
        </div>
        <h1 className="text-2xl font-bold text-white font-display mb-2">
          Document not found
        </h1>
        <p className="text-white/50 mb-8">
          The documentation page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href={DOCS_PATH}
          className="inline-flex px-6 py-3 bg-brand-orange text-white text-sm font-semibold rounded-full hover:bg-brand-orange/90 transition-colors"
        >
          Back to Docs
        </Link>
      </div>
    </div>
  );
}
