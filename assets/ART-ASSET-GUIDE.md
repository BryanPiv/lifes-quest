# Life's Quest premium art assets

Every shipped premium image has two roles:

- `source`: the full-resolution PNG kept for future edits or regeneration.
- `runtime`: the optimized WebP loaded by the app.

The app's paths live in `journey-config-v95.js`. Change a source or runtime path there; do not add one-off CSS image overrides.

## Dashboard environment

- Source: `journey/premium-alpine-source-v98.png`
- Runtime: `journey/premium-alpine-v94.webp`
- UI, trail, companion, waterfall flow, tree motion, mist, lighting, particles, and the subtle camera-breathe effect remain separate code layers. They are not baked into the background.

Environment animation timing and intensity are editable in the `motion` object in `journey-config-v95.js`. The matching animation definitions live together in `journey-live-v93.css`. The system automatically disables motion for people who request reduced motion.

Art direction: a vertical premium fantasy alpine valley at golden sunrise, with a stone ledge at lower left for the companion, a clear mountain face on the right for the trail, blue lakes, waterfalls, evergreens, wildflowers, and clean open areas for interface overlays. No character, words, interface, trail, markers, labels, or logo in the background art.

## Companion sources

| Companion | Source PNG | Runtime WebP |
| --- | --- | --- |
| Nimbus | `characters/nimbus/nimbus-idle-premium-v94.png` | `characters/nimbus/nimbus-idle-premium-v95.webp` |
| Ember | `characters/ember/ember-idle-premium-v98.png` | `characters/ember/ember-idle-premium-v98.webp` |
| Aurora | `characters/aurora/aurora-idle-premium-v98.png` | `characters/aurora/aurora-idle-premium-v98.webp` |
| Volt | `characters/volt/volt-idle-premium-v98.png` | `characters/volt/volt-idle-premium-v98.webp` |
| Nightfall | `characters/nightfall/nightfall-idle-premium-v98.png` | `characters/nightfall/nightfall-idle-premium-v98.webp` |

All companion source files use a transparent background, full-body front-facing framing, and generous clear margins. The universal character rig in `character-bases.js` supplies shared positioning, movement, states, and evolution scale.

## Safe update workflow

1. Edit or regenerate the source PNG without baking in UI or scenery.
2. Export an alpha-preserving WebP at the same dimensions for runtime use.
3. Point `journey-config-v95.js` at both files and increment its version.
4. Increment asset query versions and the service-worker cache version.
5. Verify transparency, mobile framing, every companion choice, and reduced-motion behavior.
