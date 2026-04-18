export interface GenerationRequest {
  prompt: string;
  aspect: string;
  width: number;
}

export interface GenerationResult {
  bytes: Buffer;
  mime: "image/jpeg" | "image/png" | "image/webp";
  providerNote?: string;
}

export interface Provider {
  name: string;
  generate(req: GenerationRequest): Promise<GenerationResult>;
}
