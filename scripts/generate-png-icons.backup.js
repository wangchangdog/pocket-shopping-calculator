import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// アイコンサイズ
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// アイコンの基本デザインをCanvasで描画
function drawIcon(canvas, size) {
  const ctx = canvas.getContext('2d');
  
  // 背景グラデーション
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3b82f6');
  gradient.addColorStop(1, '#1d4ed8');
  
  // 背景
  ctx.fillStyle = gradient;
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();
  
  // 電卓本体
  const padding = size * 0.2;
  const calcSize = size - padding * 2;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.roundRect(padding, padding, calcSize, calcSize, size * 0.05);
  ctx.fill();
  
  // 画面
  const screenPadding = size * 0.25;
  const screenWidth = size * 0.5;
  const screenHeight = size * 0.125;
  ctx.fillStyle = '#1f2937';
  ctx.roundRect(screenPadding, screenPadding, screenWidth, screenHeight, size * 0.015);
  ctx.fill();
  
  // 画面の数字
  ctx.fillStyle = '#10b981';
  ctx.font = `bold ${size * 0.06}px Arial`;
  ctx.textAlign = 'right';
  ctx.fillText('¥1,280', screenPadding + screenWidth - size * 0.02, screenPadding + screenHeight * 0.7);
  
  // ボタン配置（簡略化）
  const buttonSize = size * 0.04;
  const buttonSpacing = size * 0.13;
  const startX = size * 0.3;
  const startY = size * 0.45;
  
  // 電卓ボタン
  ctx.fillStyle = '#e5e7eb';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = startX + col * buttonSpacing;
      const y = startY + row * buttonSpacing;
      ctx.beginPath();
      ctx.arc(x, y, buttonSize, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
  
  // カメラアイコン（OCR機能を表現）
  const cameraX = size * 0.4;
  const cameraY = size * 0.62;
  const cameraW = size * 0.065;
  const cameraH = size * 0.048;
  
  ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
  ctx.roundRect(cameraX, cameraY, cameraW, cameraH, size * 0.008);
  ctx.fill();
  
  // カメラレンズ
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cameraX + cameraW/2, cameraY + cameraH/2, size * 0.012, 0, 2 * Math.PI);
  ctx.fill();
}

console.log('PNG アイコンを生成中...');

const iconsDir = path.join(__dirname, '../public/icons');

// 各サイズのPNGアイコンを生成
sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  drawIcon(canvas, size);
  
  const filename = `icon-${size}x${size}.png`;
  const buffer = canvas.toBuffer('image/png');
  
  fs.writeFileSync(path.join(iconsDir, filename), buffer);
  console.log(`✓ ${filename} を生成しました`);
});

console.log('PNG アイコン生成完了！'); 