# PWA Icons Setup

This app requires PWA icons for proper installation on mobile devices.

## Required Icons

The following icons need to be created and placed in the `public` directory:

1. **pwa-192x192.png** - 192x192 pixels (for Android)
2. **pwa-512x512.png** - 512x512 pixels (for Android and iOS)
3. **apple-touch-icon.png** - 180x180 pixels (for iOS)
4. **favicon.ico** - 32x32 pixels (browser favicon)

## Icon Design Guidelines

- Use a simple, recognizable design that represents the election platform
- Ensure icons work well on both light and dark backgrounds
- Use high contrast colors (red/white theme matches the app)
- Icons should be square with rounded corners (iOS will add mask automatically)

## Quick Setup

You can use online tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Or create them manually using:
- Figma
- Adobe Illustrator
- Canva

## Testing

After adding icons:
1. Run `npm run build`
2. Test PWA installation on:
   - Android Chrome (should show "Add to Home Screen")
   - iOS Safari (Share > Add to Home Screen)
3. Verify icons appear correctly in:
   - App launcher
   - Splash screen
   - Browser tabs

## Current Status

Icons are referenced in:
- `vite.config.ts` (PWA manifest)
- `index.html` (apple-touch-icon meta tag)

The app will work without icons, but installation experience will be degraded.
