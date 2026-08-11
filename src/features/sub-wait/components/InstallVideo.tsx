import type { ReactElement } from 'react'
import styles from '../sub-wait.module.css'
import { assetUrl } from '../utils/assetUrl'

type InstallVideoProps = {
  platform: 'iphone' | 'android'
  label: string
}

export default function InstallVideo({
  platform,
  label,
}: InstallVideoProps): ReactElement {
  const assetPrefix = `sub-wait/install/${platform}-walkthrough`

  return (
    <video
      className={styles.installVideo}
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
        default
      />
      Your browser does not support embedded videos.
    </video>
  )
}
