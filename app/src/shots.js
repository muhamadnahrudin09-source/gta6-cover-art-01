// Shot runner for automated rendering and screenshot generation

import { state } from './state.js';
import { render } from './art.js';

export function runShot(name, params) {
  // Parse query parameters
  const shotType = params.get('shot') || 'editor';
  const photoKey = params.get('photo');
  if (photoKey) {
    if (photoKey === 'pier') state.photoUrls[0] = '/samples/pier.jpg';
    else if (photoKey === 'boulevard') state.photoUrls[0] = '/samples/boulevard.jpg';
    else state.photoUrls[0] = photoKey;
  }

  const caption = params.get('caption');
  if (caption !== null) state.caption = caption;

  const title = params.get('title');
  if (title !== null) state.title = title;

  const tagline = params.get('tagline');
  if (tagline !== null) state.tagline = tagline;

  const grade = params.get('grade');
  if (grade !== null) state.grade = grade;

  const layout = params.get('layout');
  if (layout !== null) state.layout = layout;

  const size = params.get('size');
  if (size) {
    const parts = size.split('x');
    if (parts.length === 2) {
      const w = parseInt(parts[0], 10);
      const h = parseInt(parts[1], 10);
      if (w > 0 && h > 0) {
        state.W = w;
        state.H = h;
      }
    }
  }

  // Handle 'cover' or shot hiding UI
  if (shotType === 'cover' || name.includes('cover')) {
    const uiEl = document.getElementById('ui-container');
    if (uiEl) uiEl.style.display = 'none';
    const canvasWrap = document.getElementById('canvas-wrap');
    if (canvasWrap) {
      canvasWrap.style.position = 'fixed';
      canvasWrap.style.inset = '0';
      canvasWrap.style.margin = '0';
      canvasWrap.style.padding = '0';
      canvasWrap.style.background = '#000';
    }
  }

  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  canvas.width = state.W;
  canvas.height = state.H;

  // Load photos and render
  const loadPromises = state.photoUrls.map((url, idx) => {
    if (!url) return Promise.resolve(null);
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        state.photos[idx] = img;
        resolve(img);
      };
      img.onerror = () => {
        state.photos[idx] = null;
        resolve(null);
      };
      img.src = url;
    });
  });

  Promise.all(loadPromises).then(() => {
    render(canvas, state);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.__shotReady = true;
      });
    });
  });
}
