import React from "react";
import { Img, staticFile } from "remotion";

/** The ONLY way a garment may appear in a video: the real photograph (a library cutout or photo),
 *  placed geometrically. Position, uniform scale, rotation and opacity for entrances/exits are allowed.
 *  There is deliberately no way to pass a filter, blend mode, tint or non-uniform scale.
 *  `src` is library-relative, e.g. "cut/hoodie-diamond/flat-back.png" (list it in the ad's assets.json). */
export const Product: React.FC<{
  src: string; width: number; x?: number; y?: number; scale?: number; rotate?: number; opacity?: number; flipX?: boolean; zIndex?: number; origin?: string;
}> = ({ src, width, x = 0, y = 0, scale = 1, rotate = 0, opacity = 1, flipX = false, zIndex, origin = "50% 50%" }) => (
  <Img
    src={staticFile("lib/" + src)}
    data-product={src}
    style={{ position: "absolute", left: 0, top: 0, width, height: "auto", zIndex, opacity, transformOrigin: origin,
      transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${flipX ? -scale : scale}, ${scale})`, willChange: "transform" }}
  />
);

/** A soft ground/contact shadow drawn as its own element, so the product layer itself is never filtered. */
export const GroundShadow: React.FC<{ x: number; y: number; width: number; height?: number; opacity?: number; blur?: number }> = ({ x, y, width, height = width * 0.12, opacity = 0.55, blur = 28 }) => (
  <div style={{ position: "absolute", left: x, top: y, width, height, borderRadius: "50%", background: `rgba(0,0,0,${opacity})`, filter: `blur(${blur}px)` }} />
);
