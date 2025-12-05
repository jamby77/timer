import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Advanced Workout Timer',
    short_name: 'Timer',
    description: 'A progressive web app for Advanced Workout Timer',
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
    screenshots: [
      {
        src: '/screenshot1.png',
        type: 'image/png',
        sizes: '1080x1920',
        form_factor: 'narrow',
      },
    ],
  }
}

/*
{
  "icons": [
    {
      "src": "/web-app-manifest-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/web-app-manifest-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "theme_color": "#020618",
  "background_color": "#F8FAFC",
  "display": "standalone"
}

<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-title" content="Advanced Workout Timer" />
<link rel="manifest" href="/site.webmanifest" />
 */
