// components/ClipCard.tsx
import Link from "next/link";
import { SchematicOverlay } from "@purrai/ui";
import type { ClipManifest } from "@/lib/artifacts";
import { SourceBadge } from "./SourceBadge";

export function ClipCard({ clip }: { clip: ClipManifest }) {
  return (
    <Link href={`/playground/${clip.slug}`} className="block rounded-lg border border-bone p-4">
      <div className="aspect-video bg-ink/5 mb-3 relative">
        <SchematicOverlay className="absolute inset-0">
          <SourceBadge source={clip.source} />
        </SchematicOverlay>
      </div>
      <h3 className="font-serif text-ink">{clip.title}</h3>
    </Link>
  );
}
