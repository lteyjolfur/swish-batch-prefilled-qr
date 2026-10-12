import SiteFooter from "@/components/site-footer";
import UploadForm from "@/components/upload-form";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <article className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-md sm:p-8">
          <header className="mb-4 space-y-2 text-center">
            <h1 className="text-xl font-bold text-balance sm:text-2xl">
              Batch generate branded Swish QR codes
            </h1>
            <p className="text-foreground-soft text-pretty">
              Generate Swish QR codes in bulk from a CSV file, with clean
              branded output ready for sharing or printing.
            </p>
            <p>
              <a
                href="/sample/sample.csv"
                download
                className="focus-ring inline-block rounded py-1 text-sm text-link underline hover:text-link-hover"
              >
                Download sample CSV
              </a>
            </p>
          </header>
          <UploadForm />
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
