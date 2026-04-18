import { execa } from "execa";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Provider, GenerationRequest, GenerationResult } from "./types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DOUBAO_ENDPOINT =
  process.env.DOUBAO_ENDPOINT ?? "https://ark.cn-beijing.volces.com/api/v3/images/generations";
const DOUBAO_MODEL = process.env.DOUBAO_MODEL ?? "doubao-seedance-1-0-pro";

export class DoubaoProvider implements Provider {
  name = "doubao";
  private key: string;
  private runtime: "ts" | "python";
  constructor() {
    const k = process.env.DOUBAO_API_KEY;
    if (!k) throw new Error("DOUBAO_API_KEY missing");
    this.key = k;
    this.runtime = process.env.DOUBAO_RUNTIME === "python" ? "python" : "ts";
  }

  async generate(req: GenerationRequest): Promise<GenerationResult> {
    return this.runtime === "python" ? this.viaPython(req) : this.viaHttp(req);
  }

  private async viaHttp(req: GenerationRequest): Promise<GenerationResult> {
    const r = await fetch(DOUBAO_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: DOUBAO_MODEL,
        prompt: req.prompt,
        size: `${req.width}x${Math.round(req.width * heightFromAspect(req.aspect))}`,
        response_format: "b64_json",
      }),
    });
    if (!r.ok) throw new Error(`doubao http ${r.status}: ${await r.text()}`);
    const data = (await r.json()) as { data: { b64_json: string }[] };
    const b64 = data.data[0]?.b64_json;
    if (!b64) throw new Error("doubao returned no image");
    return { bytes: Buffer.from(b64, "base64"), mime: "image/png", providerNote: "doubao-http" };
  }

  private async viaPython(req: GenerationRequest): Promise<GenerationResult> {
    const runner = path.resolve(__dirname, "doubao_runner.py");
    const { stdout } = await execa("conda", [
      "run", "-n", "pet-pipeline", "python", runner,
      "--prompt", req.prompt, "--aspect", req.aspect, "--width", String(req.width),
    ], { env: { ...process.env, DOUBAO_API_KEY: this.key } });
    const trimmed = stdout.trim();
    return { bytes: Buffer.from(trimmed, "base64"), mime: "image/png", providerNote: "doubao-python" };
  }
}

function heightFromAspect(a: string): number {
  const parts = a.split(":").map(Number);
  const w = parts[0] ?? 1;
  const h = parts[1] ?? 1;
  return h / w;
}
