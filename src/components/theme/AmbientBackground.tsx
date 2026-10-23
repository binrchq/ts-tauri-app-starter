/**
 * Ambient background.
 *
 * The colour itself lives on <body> as very large, very low-opacity washes —
 * anchored off-canvas so only their falloff is visible. That reads as tinted
 * light rather than as blobs, and crucially it gives the glass something to
 * refract; over a flat grey page any glass treatment is invisible.
 *
 * This layer adds what the washes cannot:
 *   grid      high-frequency straight lines — the thing edge-refraction bends
 *   vignette  settles the corners, adds depth
 *   grain     kills banding on wide gradients, adds physical texture
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-grid" />
      <div className="bg-vignette" />
      <div className="bg-grain" />
    </div>
  );
}