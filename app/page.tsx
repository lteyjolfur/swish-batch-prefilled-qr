import UploadForm from "@/components/upload-form";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-8 w-full max-w-md mx-auto border border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-gray-100">
          Batch generate branded Swish QR codes
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
          Generate Swish QR codes in bulk from a CSV file, with clean branded
          output ready for sharing or printing.
        </p>
        <div className="mb-4 text-center">
          <a
            href="/sample/sample.csv"
            download
            className="inline-block text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 text-sm"
          >
            Download sample CSV
          </a>
        </div>
        <UploadForm />
      </div>
    </main>
  );
}
