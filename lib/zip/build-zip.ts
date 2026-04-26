import JSZip from "jszip";

export async function buildZip(
  files: { filename: string; buffer: Buffer }[],
): Promise<Buffer> {
  const zip = new JSZip();
  for (const { filename, buffer } of files) {
    zip.file(filename, buffer);
  }
  return await zip.generateAsync({ type: "nodebuffer" });
}
