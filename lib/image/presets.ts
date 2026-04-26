
import { composeCard } from "./compose-card";

export async function applyPreset(
	preset: "plain" | "branded",
	qrBuffer: Buffer,
	label?: string
): Promise<Buffer> {
	if (preset === "plain") {
		return qrBuffer;
	}
	if (preset === "branded") {
		return composeCard(qrBuffer, label);
	}
	throw new Error(`Unknown preset: ${preset}`);
}
