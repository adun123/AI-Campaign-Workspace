"use client";

import { useEffect, useRef, useState } from "react";
import type { LogoPosition } from "@/types/domain";

export type LogoOverlayData = {
  logoUrl: string;
  position: LogoPosition;
  sizePercent: number;
};

/**
 * Renders an image with a logo overlay applied via canvas.
 * The logo is composited on top of the source image at the specified position.
 */
export function ImageWithLogo({
  src,
  alt,
  logoOverlay,
  className,
}: {
  src: string;
  alt: string;
  logoOverlay?: LogoOverlayData;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!logoOverlay || !src) {
      setReady(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      // Load logo
      const logo = new Image();
      logo.crossOrigin = "anonymous";
      logo.onload = () => {
        const logoSize = Math.min(canvas.width, canvas.height) * (logoOverlay.sizePercent / 100);
        const logoAspect = logo.naturalWidth / logo.naturalHeight;
        const drawW = logoSize * logoAspect;
        const drawH = logoSize;

        const pos = getLogoPosition(logoOverlay.position, canvas.width, canvas.height, drawW, drawH);
        ctx.drawImage(logo, pos.x, pos.y, drawW, drawH);
        setReady(true);
      };
      logo.onerror = () => {
        // If logo fails to load, just show the original image
        setReady(true);
      };
      logo.src = logoOverlay.logoUrl;
    };
    img.onerror = () => {
      setReady(true);
    };
    img.src = src;
  }, [src, logoOverlay]);

  // If no overlay, just render a normal img
  if (!logoOverlay) {
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: ready ? "block" : "none" }}
    />
  );
}

function getLogoPosition(
  position: LogoPosition,
  canvasW: number,
  canvasH: number,
  logoW: number,
  logoH: number,
): { x: number; y: number } {
  const padding = Math.min(canvasW, canvasH) * 0.03;

  switch (position) {
    case "top-left":
      return { x: padding, y: padding };
    case "top-center":
      return { x: (canvasW - logoW) / 2, y: padding };
    case "top-right":
      return { x: canvasW - logoW - padding, y: padding };
    case "center":
      return { x: (canvasW - logoW) / 2, y: (canvasH - logoH) / 2 };
    case "bottom-left":
      return { x: padding, y: canvasH - logoH - padding };
    case "bottom-center":
      return { x: (canvasW - logoW) / 2, y: canvasH - logoH - padding };
    case "bottom-right":
      return { x: canvasW - logoW - padding, y: canvasH - logoH - padding };
  }
}
