#!/usr/bin/env bash
# 构建网页版并推到 gh-pages（GitHub Pages 从这里发布）
set -euo pipefail
cd "$(dirname "$0")/../web"

npm run packs
npx vite build

cd ..
rm -rf /tmp/budong-gh
mkdir -p /tmp/budong-gh
cp -R web/dist/* /tmp/budong-gh/
cd /tmp/budong-gh
git init -q
git checkout -q -b gh-pages
git add -A
git -c user.name="ChloeChen0709" -c user.email="1677181179@qq.com" commit -q -m "网页版构建 $(date '+%Y-%m-%d %H:%M')"
git remote add origin https://github.com/ChloeChen0709/budong.git
git push -f origin gh-pages
echo "已发布：https://chloechen0709.github.io/budong/"
