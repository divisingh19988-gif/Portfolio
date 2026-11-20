# Credits

Original code, copy, and graphics. The interaction model is a reimplementation, not a copy of anyone else's source, images, or brand.

## Background video

- **Title:** Bustling Evening at Potsdamer Platz, Berlin
- **Author:** Ivan Chumak
- **Source:** https://www.pexels.com/video/bustling-evening-at-potsdamer-platz-berlin-40194924/
- **License:** [Pexels License](https://www.pexels.com/license/) — free to use, including commercially. Attribution is not required; it is included here anyway.
- **File:** `public/video/berlin.mp4` and `public/video/berlin.webm`
- **Edit:** trimmed to a 10 second loop, scaled to 1920×1080, 24 fps, graded darker and less saturated for the ink reveal. Poster frame: `public/video/berlin-poster.jpg`.

## Fonts

- **Anton** by Vernon Adams. SIL Open Font License. Self-hosted from the Google Fonts files.
- **Permanent Marker** by Font Diner. SIL Open Font License. Used as the handwritten marker (the stand-in for a paid brush script).
- **Satoshi** by Indian Type Foundry, distributed free on Fontshare. Self-hosted woff2 files from the Fontshare CDN.

## Fluid

The cursor ink is an original WebGL2 stable-fluids solver based on the published method in Jos Stam, “Stable Fluids”, SIGGRAPH 1999. The same method is popularized by Pavel Dobryakov’s MIT-licensed [WebGL Fluid Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation). This site does not copy that repository; `src/scripts/fluid.ts` was written for this project. The dye field is used as a mask that reveals the Berlin video.

## Motion

[GSAP 3](https://gsap.com/) (GreenSock), including ScrollTrigger, ScrollSmoother, SplitText, Flip, Draggable, InertiaPlugin, and Observer. These plugins are free to use as of GSAP 3.13.

## Portrait and project media

`public/portrait/digvijay.png` is a generated monogram, not a photograph. Replace it with the cut-out portrait (see README).

Everything under `public/work/` is a labeled placeholder. It is not client work, a screenshot, or stock footage of a product.
