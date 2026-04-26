import UploadForm from "@/components/upload-form";
import PresetSelector from "@/components/preset-selector";
import ResultSummary from "@/components/result-summary";

export default function Home() {
  return (
    <main style={{ maxWidth: 600, margin: "2rem auto", padding: 24 }}>
      <h1>Swish Batch QR Generator</h1>
      <p>
        Batch-generate branded Swish QR codes from CSV and download as a ZIP
        file.
      </p>
      <div style={{ margin: "2rem 0" }}>
        <UploadForm />
      </div>
      <div style={{ margin: "2rem 0" }}>
        <PresetSelector />
      </div>
      <div style={{ margin: "2rem 0" }}>
        <ResultSummary />
      </div>
    </main>
  );
}
