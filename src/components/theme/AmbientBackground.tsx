/**
 * Ambient background.
 *
 * Deliberately restrained — no coloured blobs. Loud colour behind the panels
 * made the glass look like stained plastic, and it fought the UI for attention.
 *
 * What remains:
 *   grid      the one high-frequency element; glass edge-refraction is only
 *             visible because there are straight lines to bend
 *   glow      a single soft light source, top-centre, very low opacity
 *   vignette  settles the edges and gives the surface depth
 *   grain     fine noise that kills banding on wide gradients
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-glow" />
      <div className="bg-grid" />
      <div className="bg-vignette" />
      <div className="bg-grain" />
    </div>
  );
}