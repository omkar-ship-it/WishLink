import type { TargetAndTransition, Transition } from 'framer-motion'
import type { SceneTransition } from '@/lib/types'

/**
 * A deliberately small, curated set of transitions — every scene in every
 * template picks from this list. Keeping it small (rather than fully generic)
 * is what keeps arbitrary user-composed scenes still feeling cinematic
 * instead of a generic slideshow.
 */
export const SCENE_TRANSITIONS: SceneTransition[] = ['fade', 'slide-up', 'zoom-reveal', 'curtain', 'iris']

interface SceneMotion {
  /** Plain targets passed directly as motion.div's initial/animate/exit props (not framer-motion's named-variants pattern, so deliberately not typed as `Variants` — that type also allows function resolvers, which isn't what's happening here). */
  variants: {
    initial: TargetAndTransition
    animate: TargetAndTransition
    exit: TargetAndTransition
  }
  transition: Transition
}

export function getSceneMotion(transition: SceneTransition): SceneMotion {
  switch (transition) {
    case 'slide-up':
      return {
        variants: {
          initial: { opacity: 0, y: 48 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -32 },
        },
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      }
    case 'zoom-reveal':
      return {
        variants: {
          initial: { opacity: 0, scale: 1.18 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.92 },
        },
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
      }
    case 'curtain':
      return {
        variants: {
          initial: { clipPath: 'inset(0 50% 0 50%)', opacity: 1 },
          animate: { clipPath: 'inset(0 0% 0 0%)', opacity: 1 },
          exit: { clipPath: 'inset(0 50% 0 50%)', opacity: 1 },
        },
        transition: { duration: 0.9, ease: [0.65, 0, 0.35, 1] },
      }
    case 'iris':
      return {
        variants: {
          initial: { clipPath: 'circle(0% at 50% 50%)', opacity: 1 },
          animate: { clipPath: 'circle(75% at 50% 50%)', opacity: 1 },
          exit: { clipPath: 'circle(0% at 50% 50%)', opacity: 1 },
        },
        transition: { duration: 0.9, ease: [0.65, 0, 0.35, 1] },
      }
    case 'fade':
    default:
      return {
        variants: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        },
        transition: { duration: 0.6, ease: 'easeInOut' },
      }
  }
}
