import { forwardRef } from "react";

export type VideoPlayerProps = {
  src: string;
  poster?: string;
  /** Hero-mode defaults: muted, loop, autoplay, playsInline, no controls. iOS Safari
   *  silently blocks autoplay without muted+playsInline, which would kill the live demo. */
  hero?: boolean;
  className?: string;
  onTimeUpdate?: (currentTimeSeconds: number) => void;
};

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, poster, hero = false, className, onTimeUpdate }, ref) => {
    return (
      <video
        data-testid="video-player"
        ref={ref}
        className={className}
        poster={poster}
        muted={hero}
        loop={hero}
        autoPlay={hero}
        playsInline={hero}
        controls={!hero}
        preload="metadata"
        onTimeUpdate={
          onTimeUpdate ? (e) => onTimeUpdate((e.target as HTMLVideoElement).currentTime) : undefined
        }
      >
        <source src={src} type="video/mp4" />
      </video>
    );
  },
);
VideoPlayer.displayName = "VideoPlayer";
