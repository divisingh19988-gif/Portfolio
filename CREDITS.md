# Credits

Original code, copy, and graphics. The interaction model is a reimplementation, not a copy of anyone else's source, images, or brand.

## Background video

The hero ink reveals `public/hero/berlin-hero.webm` and `public/hero/berlin-hero.mp4`, a 9 second seamless loop of the Siegessäule in Berlin at dusk.

- **Source:** Pexels, supplied with this project
- **License:** [Pexels License](https://www.pexels.com/license/)
- **Poster:** `public/hero/berlin-hero-poster.jpg`

An earlier Potsdamer Platz clip from Pexels (Ivan Chumak, video 40194924) is no longer used as the hero.

## Sound

The sound button starts a two-oscillator drone generated in the browser with the Web Audio API. Nothing is downloaded, and nothing plays until the button is pressed.

## Generated card art

GetMeHired, Guru, and Grok Bot have no footage. Their gallery cards are original abstract frames drawn for this site, in `public/work/<slug>/poster-1.jpg`.

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
