import UploadForm from "@/components/upload-form";

export default function Home() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-gray-100 dark:bg-gray-950 px-4 py-8 sm:py-12">
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-6 sm:p-8 w-full max-w-md mx-auto border border-gray-200 dark:border-gray-800">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center text-balance text-gray-900 dark:text-gray-100">
          Batch generate branded Swish QR codes
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-center text-pretty">
          Generate Swish QR codes in bulk from a CSV file, with clean branded
          output ready for sharing or printing.
        </p>
        <div className="mb-4 text-center">
          <a
            href="/sample/sample.csv"
            download
            className="inline-block py-1 text-blue-700 dark:text-blue-400 underline hover:text-blue-900 dark:hover:text-blue-300 text-sm rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Download sample CSV
          </a>
        </div>
        <UploadForm />
      </div>
    </main>
  );
}
