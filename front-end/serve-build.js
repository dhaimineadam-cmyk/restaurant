const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3001;
const buildDir = path.join(__dirname, "build");

const contentTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
};

http.createServer((request, response) => {
    const requestedPath = decodeURIComponent(request.url.split("?")[0]);
    const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
    let filePath = path.join(buildDir, safePath);

    if (requestedPath === "/" || !path.extname(filePath)) {
        filePath = path.join(buildDir, "index.html");
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            fs.readFile(path.join(buildDir, "index.html"), (fallbackError, fallbackContent) => {
                if (fallbackError) {
                    response.writeHead(404);
                    response.end("Not found");
                    return;
                }
                response.writeHead(200, { "Content-Type": "text/html" });
                response.end(fallbackContent);
            });
            return;
        }

        response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
        response.end(content);
    });
}).listen(port, () => {
    console.log(`SRMS frontend ready on http://localhost:${port}`);
});
