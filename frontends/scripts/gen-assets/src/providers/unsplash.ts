import type { Provider, GenerationRequest, GenerationResult } from "./types";

export class UnsplashProvider implements Provider {
  name = "unsplash";
  private key: string;
  constructor() {
    const k = process.env.UNSPLASH_ACCESS_KEY;
    if (!k) throw new Error("UNSPLASH_ACCESS_KEY missing");
    this.key = k;
  }
  async generate(req: GenerationRequest): Promise<GenerationResult> {
    const search = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(req.prompt)}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${this.key}` } }
    );
    if (!search.ok) throw new Error(`unsplash search ${search.status}`);
    const data = (await search.json()) as { urls: { full: string } };
    const img = await fetch(data.urls.full);
    if (!img.ok) throw new Error(`unsplash image ${img.status}`);
    const bytes = Buffer.from(await img.arrayBuffer());
    return { bytes, mime: "image/jpeg", providerNote: data.urls.full };
  }
}
