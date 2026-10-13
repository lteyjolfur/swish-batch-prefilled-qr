import { notFound } from "next/navigation";
import SiteFooter from "@/components/site-footer";
import UploadForm from "@/components/upload-form";
import { hasLocale } from "../../lib/i18n/config";
import { getDictionary } from "../../lib/i18n";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <article className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-md sm:p-8">
          <header className="mb-4 space-y-2 text-center">
            <h1 className="text-xl font-bold text-balance sm:text-2xl">
              {t.header.title}
            </h1>
            <p className="text-foreground-soft text-pretty">{t.header.intro}</p>
            <p>
              <a
                href="/sample/sample.csv"
                download
                className="focus-ring inline-block rounded py-1 text-sm text-link underline hover:text-link-hover"
              >
                {t.header.sampleCsv}
              </a>
            </p>
          </header>
          <UploadForm
            t={{ form: t.form, result: t.result, errors: t.errors }}
          />
        </article>
      </main>
      <SiteFooter t={t.footer} />
    </div>
  );
}
