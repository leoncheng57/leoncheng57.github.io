export type InstallPlatform = 'iphone' | 'android'

export type InstallStep = {
  title: string
  body: string
}

export type InstallPlatformGuide = {
  id: InstallPlatform
  title: string
  note: string
  steps: InstallStep[]
}

export function isAppleMobileDevice(
  userAgent: string,
  platform = '',
  maxTouchPoints = 0,
): boolean {
  return (
    /iphone|ipad|ipod/i.test(userAgent) ||
    (platform === 'MacIntel' && maxTouchPoints > 1)
  )
}

export function detectInstallPlatforms(
  userAgent: string,
  platform = '',
  maxTouchPoints = 0,
): InstallPlatform[] {
  if (isAppleMobileDevice(userAgent, platform, maxTouchPoints)) return ['iphone']
  if (/android/i.test(userAgent)) return ['android']
  return ['iphone', 'android']
}

export function isInstallPlatformDevice(
  userAgent: string,
  platform = '',
  maxTouchPoints = 0,
): boolean {
  return (
    isAppleMobileDevice(userAgent, platform, maxTouchPoints) ||
    /android/i.test(userAgent)
  )
}

export function createInstallPlatformGuides(
  appName: string,
): Record<InstallPlatform, InstallPlatformGuide> {
  return {
    iphone: {
      id: 'iphone',
      title: 'iPhone or iPad',
      note: 'Use Safari. The toolbar position can vary slightly by iOS or iPadOS version.',
      steps: [
        {
          title: 'Tap Share in Safari',
          body: `Open ${appName} in Safari, then tap the Share button in the toolbar.`,
        },
        {
          title: 'Choose Add to Home Screen',
          body: 'Scroll the share sheet if needed, then tap Add to Home Screen.',
        },
        {
          title: 'Confirm with Add',
          body: `Keep the ${appName} name and tap Add. Its icon will appear on your home screen.`,
        },
      ],
    },
    android: {
      id: 'android',
      title: 'Android',
      note: 'Use Chrome. Menu wording can vary by browser and Android version.',
      steps: [
        {
          title: 'Open the Chrome menu',
          body: `Open ${appName} in Chrome, then tap the three-dot menu beside the address bar.`,
        },
        {
          title: 'Choose Install app',
          body: 'Tap Install app. Some Android versions call this Add to Home screen.',
        },
        {
          title: 'Confirm installation',
          body: `Tap Install. ${appName} will open like a standalone app from your home screen.`,
        },
      ],
    },
  }
}
