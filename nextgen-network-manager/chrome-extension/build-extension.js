import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 构建Vite项目（用于popup等React组件）
console.log('Building Vite project...');
execSync('npm run build', { stdio: 'inherit' });

// 创建必要的目录
const distDir = path.join(process.cwd(), 'dist-extension');
const distSrcDir = path.join(distDir, 'dist');

// 复制Vite构建输出
console.log('Copying Vite build output...');
fs.cpSync(path.join(process.cwd(), 'dist'), distSrcDir, { recursive: true });

// 复制manifest.json
console.log('Copying manifest.json...');
fs.copyFileSync(
  path.join(process.cwd(), 'manifest.json'),
  path.join(distDir, 'manifest.json')
);

// 复制图标
console.log('Copying icons...');
const iconsSrcDir = path.join(process.cwd(), 'src', 'assets');
const iconsDistDir = path.join(distDir, 'src', 'assets');
fs.mkdirSync(iconsDistDir, { recursive: true });

// 复制实际的图标文件
if (fs.existsSync(iconsSrcDir)) {
  const iconFiles = fs.readdirSync(iconsSrcDir);
  iconFiles.forEach(iconFile => {
    const srcIconPath = path.join(iconsSrcDir, iconFile);
    const distIconPath = path.join(iconsDistDir, iconFile);
    fs.copyFileSync(srcIconPath, distIconPath);
    console.log(`Copied icon: ${iconFile}`);
  });
}

// 编译内容脚本和背景脚本
const srcDirs = ['content', 'background'];
srcDirs.forEach(dir => {
  const srcPath = path.join(process.cwd(), 'src', dir);
  const compileDistPath = path.join(process.cwd(), 'dist', dir);
  const finalDistPath = path.join(distDir, 'dist', dir);

  if (fs.existsSync(srcPath)) {
    console.log(`Compiling ${dir} scripts with TypeScript...`);

    // 使用TypeScript编译器编译
    try {
      execSync(`npx tsc -p ${path.join(srcPath, 'tsconfig.json')}`, { stdio: 'inherit' });
      console.log(`Compiled ${dir} scripts successfully`);

      // 复制编译后的文件到最终目录
      if (fs.existsSync(compileDistPath)) {
        console.log(`Copying ${dir} scripts to final location...`);
        fs.cpSync(compileDistPath, finalDistPath, { recursive: true });
      }
    } catch (error) {
      console.error(`Failed to compile ${dir} scripts:`, error.message);
    }
  }
});

console.log('Chrome extension build completed!');
console.log('Extension files are located in: dist-extension');