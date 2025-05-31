import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// アイコンサイズ
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

/**
 * 外部画像ファイルからPWAアイコンを生成
 * @param {string} imagePath - 元画像のパス
 */
async function generateIconsFromImage(imagePath) {
  try {
    console.log('画像を読み込み中:', imagePath);
    const image = await loadImage(imagePath);
    
    const iconsDir = path.join(__dirname, '../public/icons');
    
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // 背景を透明に設定
      ctx.clearRect(0, 0, size, size);
      
      // 画像をリサイズして描画
      ctx.drawImage(image, 0, 0, size, size);
      
      // PNGとして保存
      const filename = `icon-${size}x${size}.png`;
      const buffer = canvas.toBuffer('image/png');
      
      fs.writeFileSync(path.join(iconsDir, filename), buffer);
      console.log(`✓ ${filename} を生成しました`);
    }
    
    console.log('🎉 アイコン生成完了！');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
    console.log('使用方法: node scripts/replace-icons.js <画像ファイルパス>');
  }
}

/**
 * 丸角の背景付きアイコンを生成
 * @param {string} imagePath - 元画像のパス
 * @param {string} backgroundColor - 背景色
 */
async function generateRoundedIconsFromImage(imagePath, backgroundColor = '#ffffff') {
  try {
    console.log('丸角アイコンを生成中:', imagePath);
    const image = await loadImage(imagePath);
    
    const iconsDir = path.join(__dirname, '../public/icons');
    
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // 丸角の背景を描画
      const radius = size * 0.2;
      ctx.fillStyle = backgroundColor;
      ctx.roundRect(0, 0, size, size, radius);
      ctx.fill();
      
      // 画像を中央に配置（パディング付き）
      const padding = size * 0.1;
      const imageSize = size - padding * 2;
      ctx.drawImage(image, padding, padding, imageSize, imageSize);
      
      // PNGとして保存
      const filename = `icon-${size}x${size}.png`;
      const buffer = canvas.toBuffer('image/png');
      
      fs.writeFileSync(path.join(iconsDir, filename), buffer);
      console.log(`✓ ${filename} を生成しました`);
    }
    
    console.log('🎉 丸角アイコン生成完了！');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

// コマンドライン引数から画像パスを取得
const args = process.argv.slice(2);
const imagePath = args[0];
const isRounded = args.includes('--rounded');
const backgroundColor = args.find(arg => arg.startsWith('--bg='))?.split('=')[1] || '#ffffff';

if (!imagePath) {
  console.log('使用方法:');
  console.log('  基本: node scripts/replace-icons.js <画像ファイルパス>');
  console.log('  丸角: node scripts/replace-icons.js <画像ファイルパス> --rounded');
  console.log('  背景色指定: node scripts/replace-icons.js <画像ファイルパス> --rounded --bg=#ff0000');
  console.log('');
  console.log('例:');
  console.log('  node scripts/replace-icons.js ./my-icon.png');
  console.log('  node scripts/replace-icons.js ./my-icon.svg --rounded --bg=#3b82f6');
  process.exit(1);
}

// アイコン生成実行
if (isRounded) {
  await generateRoundedIconsFromImage(imagePath, backgroundColor);
} else {
  await generateIconsFromImage(imagePath);
} 