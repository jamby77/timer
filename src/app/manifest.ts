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
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}

/*

<meta name="apple-mobile-web-app-title" content="Advanced Workout Timer" />
 */
