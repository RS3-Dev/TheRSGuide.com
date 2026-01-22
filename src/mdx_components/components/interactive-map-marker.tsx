"use client";

import React, { useRef, useState } from "react";

interface InteractiveMapMarkerProps {
  src: string;
  alt?: string;
  markerIcon?: React.ReactNode;
  className?: string;
}

const defaultMarker = (
  <img
    src="https://www.thersguide.com/images/gui/mapmarker.png"
    alt="Map Marker"
    style={{
      width: 32,
      height: 32,
      transform: "translate(-50%, -100%)",
      pointerEvents: "none",
      userSelect: "none",
    }}
    draggable={false}
  />
);

export const InteractiveMapMarker: React.FC<InteractiveMapMarkerProps> = ({
  src,
  alt,
  markerIcon,
  className,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null);

  const handleDoubleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top + 16; // Add marker height (32px) to account for transform(-100%)
    setMarker({ x, y });
  };

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        overflow: "visible",
      }}
      className={`select-none w-full ${className || ""}`}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          cursor: "pointer",
        }}
        onDoubleClick={handleDoubleClick}
        draggable={false}
        className="select-none rounded-lg"
      />
      {marker && (
        <div
          style={{
            position: "absolute",
            left: `${marker.x}px`,
            top: `${marker.y}px`,
            zIndex: 2,
            pointerEvents: "none",
            width: "32px",
            height: "32px",
            flexShrink: 0,
          }}
        >
          {markerIcon || defaultMarker}
        </div>
      )}
    </div>
  );
};
