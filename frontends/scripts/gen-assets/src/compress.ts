import sharp from "sharp";

export async function toAvif(input: Buffer, targetWidth: number): Promise<Buffer> {
  return sharp(input).resize({ width: targetWidth, withoutEnlargement: true }).avif({ quality: 60 }).toBuffer();
}
