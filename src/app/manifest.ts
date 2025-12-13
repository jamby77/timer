import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Advanced Workout Timer',
    short_name: 'Timer',
    description: 'A versatile timer application for workouts and productivity',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#020618',
    orientation: 'portrait-primary',
    categories: ['fitness', 'health', 'utilities'],
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    screenshots: [
      {
        src: '/screenshots/app-mobile.png',
        sizes: '895x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Timer configuration',
      },
      {
        src: '/screenshots/app-desktop.png',
        sizes: '1920x884',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Timer running',
      },
    ],
  }
}

/*

<meta name="apple-mobile-web-app-title" content="Advanced Workout Timer" />
 */
