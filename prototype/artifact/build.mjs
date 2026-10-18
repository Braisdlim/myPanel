// Compone una página HTML autocontenida a partir del paquete IIFE y su CSS.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const dir = "artifact/dist";
const js = readFileSync(`${dir}/app.js`, "utf8").replaceAll("</script", "<\\/script");
const cssFile = readdirSync(dir).find((f) => f.endsWith(".css"));
const css = readFileSync(`${dir}/${cssFile}`, "utf8");
const out = process.argv[2];
writeFileSync(out, `<title>myPanel prototipo</title>
<meta name="theme-color" content="#111318">
<style>${css}</style>
<div id="app"></div>
<script>${js}</script>
`);
console.log(out, (Buffer.byteLength(readFileSync(out)) / 1024).toFixed(0) + " KB");
