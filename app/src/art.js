// GTA Cover Art Renderer

export function panelRects(layout, W, H) {
  if (layout === 'solo') {
    return [
      { x: W * 0.06, y: H * 0.06, w: W * 0.88, h: H * 0.52, angle: -0.015 }
    ];
  } else if (layout === 'duo') {
    return [
      { x: W * 0.05, y: H * 0.06, w: W * 0.43, h: H * 0.50, angle: -0.025 },
      { x: W * 0.52, y: H * 0.08, w: W * 0.43, h: H * 0.48, angle: 0.02 }
    ];
  } else if (layout === 'trio') {
    return [
      { x: W * 0.05, y: H * 0.05, w: W * 0.43, h: H * 0.28, angle: -0.02 },
      { x: W * 0.52, y: H * 0.06, w: W * 0.43, h: H * 0.28, angle: 0.02 },
      { x: W * 0.15, y: H * 0.35, w: W * 0.70, h: H * 0.22, angle: 0.01 }
    ];
  } else { // quad
    return [
      { x: W * 0.05, y: H * 0.05, w: W * 0.43, h: H * 0.25, angle: -0.02 },
      { x: W * 0.52, y: H * 0.05, w: W * 0.43, h: H * 0.25, angle: 0.02 },
      { x: W * 0.07, y: H * 0.32, w: W * 0.43, h: H * 0.24, angle: 0.015 },
      { x: W * 0.50, y: H * 0.31, w: W * 0.43, h: H * 0.24, angle: -0.015 }
    ];
  }
}

const GRADES = {
  sunset: {
    skyTop: '#1e0a2a',
    skyBottom: '#f97316',
    sun1: '#fef08a',
    sun2: '#f43f5e',
    skyline: '#11051c',
    palm: '#0c0314',
    duoHighlight: 'rgba(249, 115, 22, 0.25)',
    duoShadow: 'rgba(30, 10, 38, 0.5)',
  },
  vice: {
    skyTop: '#2e0854',
    skyBottom: '#06b6d4',
    sun1: '#fef08a',
    sun2: '#ec4899',
    skyline: '#17042b',
    palm: '#0f0220',
    duoHighlight: 'rgba(6, 182, 212, 0.25)',
    duoShadow: 'rgba(46, 8, 84, 0.5)',
  },
  neon: {
    skyTop: '#100b2e',
    skyBottom: '#ec4899',
    sun1: '#fef08a',
    sun2: '#8b5cf6',
    skyline: '#080517',
    palm: '#05030f',
    duoHighlight: 'rgba(236, 72, 153, 0.25)',
    duoShadow: 'rgba(16, 11, 46, 0.5)',
  },
  heist: {
    skyTop: '#0f1015',
    skyBottom: '#f59e0b',
    sun1: '#fef08a',
    sun2: '#b45309',
    skyline: '#08080a',
    palm: '#050507',
    duoHighlight: 'rgba(245, 158, 11, 0.25)',
    duoShadow: 'rgba(15, 16, 21, 0.5)',
  }
};

export function render(canvas, opts) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const gradeKey = GRADES[opts.grade] ? opts.grade : 'sunset';
  const g = GRADES[gradeKey];

  // 1) Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, g.skyTop);
  skyGrad.addColorStop(0.6, g.skyBottom);
  skyGrad.addColorStop(1, '#0d0614');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // 2) Big sun disk with horizontal synthwave slit bands
  ctx.save();
  const sunX = W * 0.72;
  const sunY = H * 0.35;
  const sunR = W * 0.20;
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
  sunGrad.addColorStop(0, g.sun1);
  sunGrad.addColorStop(0.7, g.sun2);
  sunGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  // Synthwave slit bands across sun
  ctx.fillStyle = g.skyTop;
  let bandY = sunY + sunR * 0.1;
  let bandH = H * 0.003;
  let gap = H * 0.006;
  while (bandY < sunY + sunR) {
    ctx.fillRect(sunX - sunR * 1.2, bandY, sunR * 2.4, bandH);
    bandY += bandH + gap;
    bandH *= 1.25;
    gap *= 1.15;
  }
  ctx.restore();

  // 3) City skyline silhouette band
  ctx.save();
  ctx.fillStyle = g.skyline;
  const skylineY = H * 0.52;
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, skylineY + H * 0.05);
  let bx = 0;
  while (bx < W) {
    const bw = W * (0.02 + Math.sin(bx * 0.05) * 0.015 + 0.02);
    const bh = H * (0.05 + Math.cos(bx * 0.03) * 0.04 + 0.03);
    ctx.lineTo(bx, skylineY - bh);
    ctx.lineTo(bx + bw, skylineY - bh);
    bx += bw;
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 4) Palm tree silhouettes in bottom corners (drawn after panels or nudged outside)
  drawPalmTrees(ctx, W, H, g.palm);

  // 5) Photo panels
  const rects = panelRects(opts.layout, W, H);
  rects.forEach((r, idx) => {
    const photo = opts.photos && opts.photos[idx];
    const pState = (opts.states && opts.states[idx]) || { zoom: 1, ox: 0, oy: 0 };

    ctx.save();
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(r.angle);

    // Panel shadow & rounded rect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 12;

    const cornerRadius = 16;
    ctx.beginPath();
    ctx.roundRect(-r.w / 2, -r.h / 2, r.w, r.h, cornerRadius);
    ctx.fillStyle = '#111';
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.clip();

    if (photo && photo.complete && photo.naturalWidth) {
      const imgW = photo.naturalWidth;
      const imgH = photo.naturalHeight;
      const baseScale = Math.max(r.w / imgW, r.h / imgH);
      const scale = baseScale * pState.zoom;
      const drawW = imgW * scale;
      const drawH = imgH * scale;

      // Clamp pan so image never leaves a gap
      const maxOx = Math.max(0, (drawW - r.w) / 2);
      const maxOy = Math.max(0, (drawH - r.h) / 2);
      const clampedOx = Math.max(-maxOx, Math.min(maxOx, pState.ox));
      const clampedOy = Math.max(-maxOy, Math.min(maxOy, pState.oy));

      const dx = -r.w / 2 + (r.w - drawW) / 2 + clampedOx;
      const dy = -r.h / 2 + (r.h - drawH) / 2 + clampedOy;

      ctx.drawImage(photo, dx, dy, drawW, drawH);
    } else {
      // Fallback placeholder pattern inside panel
      ctx.fillStyle = '#222';
      ctx.fillRect(-r.w / 2, -r.h / 2, r.w, r.h);
      ctx.fillStyle = '#444';
      ctx.font = `bold ${Math.floor(r.h * 0.1)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('NO PHOTO', 0, 0);
    }

    // Duotone grade overlay
    const overlay = ctx.createLinearGradient(-r.w / 2, -r.h / 2, r.w / 2, r.h / 2);
    overlay.addColorStop(0, g.duoHighlight);
    overlay.addColorStop(1, g.duoShadow);
    ctx.fillStyle = overlay;
    ctx.fillRect(-r.w / 2, -r.h / 2, r.w, r.h);

    // White border
    ctx.lineWidth = Math.max(4, W * 0.008);
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-r.w / 2, -r.h / 2, r.w, r.h, cornerRadius);
    ctx.stroke();

    ctx.restore();
  });

  // 6) Huge italic lettering: title with white->hot gradient, dark offset block shadow, outline, numeral badge
  ctx.save();
  const titleText = (opts.title || 'VICE').toUpperCase();
  let titleFontSize = Math.floor(W * 0.12);
  ctx.font = `italic 900 ${titleFontSize}px "Impact", "Arial Black", sans-serif`;

  // Auto-fit title width if too wide
  let metrics = ctx.measureText(titleText);
  while (metrics.width > W * 0.82 && titleFontSize > 30) {
    titleFontSize -= 4;
    ctx.font = `italic 900 ${titleFontSize}px "Impact", "Arial Black", sans-serif`;
    metrics = ctx.measureText(titleText);
  }

  const titleX = W * 0.08;
  const titleY = H * 0.72;

  // Block shadow
  ctx.fillStyle = '#0a0a0e';
  ctx.lineWidth = titleFontSize * 0.12;
  ctx.strokeStyle = '#0a0a0e';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 2;
  ctx.strokeText(titleText, titleX + 6, titleY + 6);
  ctx.fillText(titleText, titleX + 6, titleY + 6);

  // Outline stroke
  ctx.strokeStyle = '#000000';
  ctx.strokeText(titleText, titleX, titleY);

  // Gradient fill
  const titleGrad = ctx.createLinearGradient(titleX, titleY - titleFontSize, titleX, titleY);
  titleGrad.addColorStop(0, '#ffffff');
  titleGrad.addColorStop(0.5, '#fef08a');
  titleGrad.addColorStop(1, '#ff2a85');
  ctx.fillStyle = titleGrad;
  ctx.fillText(titleText, titleX, titleY);

  // Small rotated numeral badge after title
  const badgeX = titleX + metrics.width + W * 0.025;
  const badgeY = titleY - titleFontSize * 0.55;
  const badgeSize = titleFontSize * 0.42;
  ctx.save();
  ctx.translate(badgeX, badgeY);
  ctx.rotate(0.12);
  ctx.beginPath();
  ctx.roundRect(0, 0, badgeSize, badgeSize, badgeSize * 0.25);
  ctx.fillStyle = '#111118';
  ctx.fill();
  ctx.lineWidth = badgeSize * 0.08;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.fillStyle = '#ffd700';
  ctx.font = `bold ${Math.floor(badgeSize * 0.55)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('01', badgeSize / 2, badgeSize / 2);
  ctx.restore();
  ctx.restore();

  // 7) Caption strip & Tagline (two-row when wide or multi-part, fully inside bottom margin)
  ctx.save();
  const captionText = (opts.caption || '').toUpperCase();
  const taglineText = (opts.tagline || '').toUpperCase();

  if (captionText || taglineText) {
    const stripY = H * 0.81;
    const stripX = W * 0.08;
    const maxStripW = W * 0.84;

    ctx.font = `bold ${Math.floor(W * 0.032)}px "Impact", sans-serif`;
    const capWidth = ctx.measureText(captionText).width;
    const tagDisplay = taglineText ? (taglineText.startsWith('—') ? taglineText : `— ${taglineText}`) : '';
    const tagWidth = tagDisplay ? ctx.measureText(tagDisplay).width : 0;
    const totalTextWidth = capWidth + (tagWidth ? tagWidth + W * 0.03 : 0);

    const isWide = (W / H) > 1.2;
    if (isWide || totalTextWidth > maxStripW || taglineText.length > 18) {
      // Two-row caption block when wide or long
      drawPill(ctx, stripX, stripY, Math.min(maxStripW, capWidth + W * 0.04), H * 0.052, '#0f0f14', '#ffd700', captionText, W * 0.025);
      if (taglineText) {
        drawPill(ctx, stripX, stripY + H * 0.058, Math.min(maxStripW, tagWidth + W * 0.04), H * 0.042, 'rgba(15,15,20,0.85)', '#00f0ff', tagDisplay, W * 0.020);
      }
    } else {
      // Single line pill
      const fullText = taglineText ? `${captionText}  //  ${taglineText}` : captionText;
      drawPill(ctx, stripX, stripY, Math.min(maxStripW, totalTextWidth + W * 0.06), H * 0.058, '#0f0f14', '#ffd700', fullText, W * 0.025);
    }
  }
  ctx.restore();

  // 8) Film grain and vignette
  applyFilmGrainAndVignette(ctx, W, H, opts.grainAmt);
}

function drawPill(ctx, x, y, w, h, bgColor, textColor, text, fontSize) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fillStyle = bgColor;
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.font = `bold ${Math.floor(fontSize)}px "Impact", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + h * 0.4, y + h / 2);
  ctx.restore();
}

function drawPalmTrees(ctx, W, H, color) {
  ctx.save();
  ctx.fillStyle = color;

  // Bottom-left palm - nudged further left to avoid photo panel overlap
  drawPalm(ctx, W * 0.02, H * 0.92, W * 0.09, H * 0.35, -0.28);
  // Bottom-right palm - nudged right
  drawPalm(ctx, W * 0.98, H * 0.92, W * 0.09, H * 0.35, 0.28);

  ctx.restore();
}

function drawPalm(ctx, baseX, baseY, trunkW, height, lean) {
  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.rotate(lean);

  // Trunk
  ctx.beginPath();
  ctx.moveTo(-trunkW / 2, 0);
  ctx.quadraticCurveTo(-trunkW * 0.2, -height * 0.5, -trunkW * 0.1, -height);
  ctx.lineTo(trunkW * 0.1, -height);
  ctx.quadraticCurveTo(trunkW * 0.2, -height * 0.5, trunkW / 2, 0);
  ctx.closePath();
  ctx.fill();

  // Fronds
  const topX = 0;
  const topY = -height;
  for (let i = 0; i < 7; i++) {
    const angle = (i / 6) * Math.PI - Math.PI / 2;
    const frondLen = height * 0.45;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(angle) * frondLen * 0.5,
      topY + Math.sin(angle) * frondLen * 0.5 - height * 0.1,
      topX + Math.cos(angle) * frondLen,
      topY + Math.sin(angle) * frondLen + height * 0.1
    );
    ctx.lineWidth = height * 0.035;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  ctx.restore();
}

function applyFilmGrainAndVignette(ctx, W, H, grainAmt) {
  if (grainAmt > 0) {
    ctx.save();
    const imageData = ctx.getImageData(0, 0, W, H);
    const data = imageData.data;
    const intensity = (grainAmt / 100) * 35;
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < 0.25) {
        const noise = (Math.random() - 0.5) * intensity;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
    }
    ctx.putImageData(imageData, 0, 0);
    ctx.restore();
  }

  // Vignette
  ctx.save();
  const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.8);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
