interface SceneCaptionProps {
  heading?: string
  body?: string
}

/** Bottom-gradient heading/body caption shared by every full-bleed media layout (image, video, photo gallery). */
export function SceneCaption({ heading, body }: SceneCaptionProps) {
  if (!heading && !body) return null
  return (
    <div className="absolute inset-x-0 bottom-0 px-8 pb-16 pt-32"
      style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.72) 0%, transparent 100%)' }}>
      {heading && (
        <p className="font-display text-2xl font-semibold text-white leading-snug mb-1.5">{heading}</p>
      )}
      {body && (
        <p className="text-sm text-white/80 leading-relaxed">{body}</p>
      )}
    </div>
  )
}
