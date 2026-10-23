/**
 * Ambient background.
 *
 * This is deliberately *behind* every panel: Liquid Glass only reads as glass
 * when there is high-frequency, colourful content flowing underneath it.
 * Drifting colour orbs supply the colour, the grid supplies the detail that
 * makes refraction and blur legible.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
      <div className="orb orb-d" />
      <div className="bg-grid" />
    </div>
  );
}