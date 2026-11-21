// Shared application state for GTA Cover Art Maker
export const state = {
  W: 1080,
  H: 1080,
  layout: 'solo', // 'solo', 'duo', 'trio', 'quad'
  grade: 'sunset', // 'sunset', 'vice', 'neon', 'heist'
  photos: [null, null, null, null],
  photoUrls: ['/samples/pier.jpg', '/samples/boulevard.jpg', '/samples/pier.jpg', '/samples/boulevard.jpg'],
  states: [
    { zoom: 1, ox: 0, oy: 0 },
    { zoom: 1, ox: 0, oy: 0 },
    { zoom: 1, ox: 0, oy: 0 },
    { zoom: 1, ox: 0, oy: 0 }
  ],
  title: 'VICE',
  caption: 'PARADISE CITY',
  tagline: 'VOLUME I',
  grainAmt: 25,
  tilt: true
};
