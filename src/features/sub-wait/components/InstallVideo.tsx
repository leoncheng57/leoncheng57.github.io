import type { ReactElement } from 'react'
import styles from '../sub-wait.module.css'
import { assetUrl } from '../utils/assetUrl'

export type InstallPlatform = 'iphone' | 'android'
export type InstallMediaKind = 'animation' | 'recording'

/**
 * Physical-device recordings that exist under public/sub-wait/install/.
 * Flip a platform to true once its <platform>-recording.{mp4,webm,vtt} and
 * <platform>-recording-poster.png assets are committed.
 */
export const INSTALL_RECORDING_AVAILABLE: Record<InstallPlatform, boolean> = {
  iphone: true,
  android: false,
}

type InstallVideoProps = {
  platform: InstallPlatform
  kind: InstallMediaKind
  label: string
  className?: string
}

export default function InstallVideo({
  platform,
  kind,
  label,
  className,
}: InstallVideoProps): ReactElement {
  const assetPrefix = `sub-wait/install/${platform}-${kind}`
  const kindClass =
    kind === 'recording' ? styles.installVideoRecording : undefined

  return (
    <video
      className={[styles.installVideo, kindClass, className]
        .filter(Boolean)
        .join(' ')}
      aria-label={label}
      controls
      playsInline
      preload="metadata"
      poster={assetUrl(`${assetPrefix}-poster.png`)}
    >
      <source src={assetUrl(`${assetPrefix}.webm`)} type="video/webm" />
      <source src={assetUrl(`${assetPrefix}.mp4`)} type="video/mp4" />
      <track
        kind="captions"
        src={assetUrl(`${assetPrefix}.vtt`)}
        srcLang="en"
        label="English"
      />
      Your browser does not support embedded videos.
    </video>
  )
}
