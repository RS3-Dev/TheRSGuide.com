import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { thirdPartyMediaAllowed } from '@/lib/privacy-preferences';

interface YouTubeEmbedProps {
  id: string;
  title?: string;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  id,
  title = "YouTube video",
}) => {
  const [loaded, setLoaded] = useState(() => thirdPartyMediaAllowed());

  return (
    <div className="my-6 w-full">
      <div
        className="relative w-full overflow-hidden rounded-lg border border-border"
        style={{
          paddingBottom: "56.25%", // 16:9 aspect ratio
          height: 0,
        }}
      >
        {loaded ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-card px-6 text-center">
            <div>
              <p className="mt-0 mb-4 text-sm text-muted-foreground">
                YouTube will receive connection information when you load this video.
              </p>
              <Button type="button" variant="outline" onClick={() => setLoaded(true)}>
                Load video
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
