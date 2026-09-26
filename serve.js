/**
 * Linkbio - Local Preview Server
 * Zero dependencies, built-in Node.js HTTP server.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') {
    reqPath = '/index.html';
  } else if (!path.extname(reqPath)) {
    // ディレクトリなら index.html を補完
    if (fs.existsSync(path.join(DIST_DIR, reqPath, 'index.html'))) {
      reqPath = path.join(reqPath, 'index.html');
    }
  }

  let filePath = path.join(DIST_DIR, reqPath);

  // パストラバーサル防止
  if (!filePath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const notFoundPath = path.join(DIST_DIR, '404.html');
      if (fs.existsSync(notFoundPath)) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(notFoundPath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`📡 ローカルプレビューサーバーが起動しました: http://localhost:${PORT}`);
  console.log(`   - ポータル一覧: http://localhost:${PORT}/`);
  console.log(`   - siyou プロフィール: http://localhost:${PORT}/siyou/`);
  console.log(`   - game プロフィール: http://localhost:${PORT}/game/`);
  console.log(`   - sns プロフィール: http://localhost:${PORT}/sns/`);
  console.log(`   - 404 テスト: http://localhost:${PORT}/nonexistent/`);
});
