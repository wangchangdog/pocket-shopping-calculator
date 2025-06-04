import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const Filename = fileURLToPath(import.meta.url);
const Dirname = path.dirname(Filename);

// SVGアイコンのベーステンプレート（買い物計算機のアイコン）
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景 -->
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  
  <!-- 電卓本体 -->
  <rect x="96" y="96" width="320" height="320" rx="24" fill="#ffffff" opacity="0.95"/>
  
  <!-- 画面 -->
  <rect x="128" y="128" width="256" height="64" rx="8" fill="#1f2937"/>
  
  <!-- 画面の数字 -->
  <text x="360" y="172" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#10b981" text-anchor="end">¥1,280</text>
  
  <!-- ボタン配置 -->
  <!-- 1行目 -->
  <circle cx="160" cy="240" r="20" fill="#e5e7eb"/>
  <circle cx="224" cy="240" r="20" fill="#e5e7eb"/>
  <circle cx="288" cy="240" r="20" fill="#e5e7eb"/>
  <circle cx="352" cy="240" r="20" fill="#fbbf24"/>
  
  <!-- 2行目 -->
  <circle cx="160" cy="304" r="20" fill="#e5e7eb"/>
  <circle cx="224" cy="304" r="20" fill="#e5e7eb"/>
  <circle cx="288" cy="304" r="20" fill="#e5e7eb"/>
  <circle cx="352" cy="304" r="20" fill="#fbbf24"/>
  
  <!-- 3行目 -->
  <circle cx="160" cy="368" r="20" fill="#e5e7eb"/>
  <circle cx="224" cy="368" r="20" fill="#e5e7eb"/>
  <circle cx="288" cy="368" r="20" fill="#e5e7eb"/>
  <circle cx="352" cy="368" r="20" fill="#ef4444"/>
  
  <!-- カメラアイコン（OCR機能を表現） -->
  <rect x="200" y="320" width="32" height="24" rx="4" fill="#3b82f6" opacity="0.8"/>
  <circle cx="216" cy="332" r="6" fill="#ffffff"/>
  <rect x="212" y="320" width="8" height="4" fill="#3b82f6"/>
</svg>`;

// アイコンサイズ
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.info("PWA用アイコンを生成中...");

// publicディレクトリにSVGファイルとして保存
const publicDir = path.join(Dirname, "../public");
const iconsDir = path.join(publicDir, "icons");

// SVGファイルを保存
fs.writeFileSync(path.join(iconsDir, "icon.svg"), iconSvg.trim());

// 各サイズ用のプレースホルダーファイルを作成
for (const size of sizes) {
  const filename = `icon-${size}x${size}.png`;
  const filePath = path.join(iconsDir, filename);

  // プレースホルダーファイル作成（実際の画像変換は別途必要）
  const placeholder = `<!-- ${size}x${size} PWA Icon Placeholder -->
<!-- 本番環境では実際のPNG画像に置き換えてください -->
<!-- SVGからPNG変換: https://cloudconvert.com/svg-to-png -->`;

  fs.writeFileSync(filePath.replace(".png", ".placeholder"), placeholder);
  console.info(`アイコンプレースホルダーを作成: ${filename}`);
}

console.info("アイコン生成完了！");
console.info("SVGファイル: public/icons/icon.svg");
console.info(
  "注意: PNGファイルは手動で作成するか、オンライン変換ツールを使用してください"
);
