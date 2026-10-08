// Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
// help@batesai.org · https://batesai.org
//
// Client-side avatar resize: centre-crop to a square and re-encode until the
// data URL fits the contract limit (64 KB). Nothing is uploaded anywhere except
// as part of the profile document.

import { MAX_AVATAR_BYTES } from './profile.js';

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('That file could not be read as an image.'));
    img.src = url;
  });
}

export async function imageFileToAvatar(file, { maxBytes = MAX_AVATAR_BYTES } = {}) {
  if (!file || !/^image\/(png|jpeg|webp|gif|heic|heif|avif)$/i.test(file.type || '')) {
    throw new Error('Please choose a PNG, JPEG or WebP image.');
  }
  if (file.size > 15 * 1024 * 1024) throw new Error('That image is too large. Please pick one under 15 MB.');
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const w = img.naturalWidth;
    const hgt = img.naturalHeight;
    if (!w || !hgt) throw new Error('That image is empty.');
    const side = Math.min(w, hgt);
    const sx = (w - side) / 2;
    const sy = (hgt - side) / 2;
    for (const size of [192, 160, 128, 96]) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const c = canvas.getContext('2d');
      c.fillStyle = '#ffffff';
      c.fillRect(0, 0, size, size);
      c.imageSmoothingQuality = 'high';
      c.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      for (const q of [0.86, 0.72, 0.58, 0.45]) {
        let data = canvas.toDataURL('image/webp', q);
        if (!data.startsWith('data:image/webp')) data = canvas.toDataURL('image/jpeg', q);
        if (data.length <= maxBytes) return data;
      }
    }
    throw new Error('That image could not be made small enough. Try a different one.');
  } finally {
    URL.revokeObjectURL(url);
  }
}
