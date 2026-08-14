/*
 * Builds a single self-contained .html file from PRVQuoteTool.jsx.
 *
 * React, ReactDOM and the scheduler are bundled in from node_modules rather
 * than pulled from a CDN, so the finished file needs no internet at all — it
 * runs by double-clicking, from a network drive, or from SharePoint.
 *
 *   node build-standalone.mjs
 *   -> PRV-Quote-Tool.html
 */

import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { dirname } from 'path';
import ts from 'typescript';

const SRC = './src/App.jsx';
const OUT = './PRV-Quote-Tool.html';

/*
 * Locating the CommonJS builds.
 *
 * Two things make this fiddly. React's package.json "exports" map does not
 * expose ./cjs/*, so require.resolve('react/cjs/react.production.js') throws
 * ERR_PACKAGE_PATH_NOT_EXPORTED — resolve the package entry point instead and
 * walk from its directory. And npm hoists scheduler to the top level on some
 * installs but nests it under react-dom on others, so if the top-level lookup
 * misses, resolve it from react-dom's own perspective.
 */
const require = createRequire(import.meta.url);

function packageDir(spec, from) {
  const req = from ? createRequire(from) : require;
  return dirname(req.resolve(spec));
}

const reactEntry = require.resolve('react');
const reactDomEntry = require.resolve('react-dom');
const reactDir = dirname(reactEntry);
const reactDomDir = dirname(reactDomEntry);

let schedulerDir;
try {
  schedulerDir = packageDir('scheduler');            // hoisted to the top level
} catch {
  schedulerDir = packageDir('scheduler', reactDomEntry); // nested under react-dom
}

/* ---- 1. compile the component to CommonJS with the automatic JSX runtime ---- */
const appSource = readFileSync(SRC, 'utf8');
const parsed = ts.createSourceFile('App.jsx', appSource, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
if (parsed.parseDiagnostics && parsed.parseDiagnostics.length) {
  for (const d of parsed.parseDiagnostics) {
    const p = parsed.getLineAndCharacterOfPosition(d.start);
    console.error(`parse error line ${p.line + 1}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
  }
  process.exit(1);
}
const appCjs = ts.transpileModule(appSource, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    jsxImportSource: 'react',
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS,
    esModuleInterop: true,
  },
}).outputText;

/* ---- 2. collect the CommonJS modules, keyed by their require() specifier ---- */
const modules = {
  'react': `${reactDir}/cjs/react.production.js`,
  'react/jsx-runtime': `${reactDir}/cjs/react-jsx-runtime.production.js`,
  'scheduler': `${schedulerDir}/cjs/scheduler.production.js`,
  'react-dom': `${reactDomDir}/cjs/react-dom.production.js`,
  'react-dom/client': `${reactDomDir}/cjs/react-dom-client.production.js`,
};

const wrap = (name, code) =>
  `__def(${JSON.stringify(name)}, function (module, exports, require) {\n${code}\n});`;

const bundled = Object.entries(modules)
  .map(([name, path]) => wrap(name, readFileSync(path, 'utf8')))
  .join('\n');

/* A script element ends at the first literal </script, wherever it appears —
   including inside a string. Nothing in the sources has one today, but split
   any that appear later rather than shipping a file that silently truncates. */
const guard = (s) => s.replace(/<\/(script)/gi, '<\\/$1');

const runtime = `
(function () {
  'use strict';
  var __mods = {}, __cache = {};
  function __def(name, fn) { __mods[name] = fn; }
  function __req(name) {
    if (__cache[name]) return __cache[name].exports;
    var fn = __mods[name];
    if (!fn) throw new Error('module not bundled: ' + name);
    var m = { exports: {} };
    __cache[name] = m;
    fn(m, m.exports, __req);
    return m.exports;
  }
  /* React's production builds touch process.emit when reporting errors. */
  var process = { env: { NODE_ENV: 'production' }, emit: function () { return false; } };

${guard(bundled)}

${wrap('app', guard(appCjs))}

  var App = __req('app').default;
  var jsx = __req('react/jsx-runtime');
  var client = __req('react-dom/client');
  var el = document.getElementById('root');
  try {
    client.createRoot(el).render(jsx.jsx(App, {}));
  } catch (err) {
    el.innerHTML = '<div style="font:14px Arial;padding:24px;color:#b3261e">' +
      'The tool failed to start: ' + String(err && err.message ? err.message : err) +
      '<br><br>Please try Chrome or Edge.</div>';
    throw err;
  }
})();
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PRV Station Sizing &amp; Budget Quote — Victaulic VDC</title>
<meta name="description" content="Sizes Victaulic 386-SB PRV stations and 935-H direct-acting valves and produces budget quotations at PL2026 list pricing.">
<!--
  Victaulic VDC — PRV Station Sizing & Budget Quote
  Self-contained. React is bundled in, so no internet connection is required.
  Open in Chrome or Edge. Pricing: PL2026.
-->
<style>
  html, body { margin: 0; padding: 0; background: #f5f5f5; }
  #boot { font: 14px Arial, Helvetica, sans-serif; color: #787878; padding: 28px; }
</style>
</head>
<body>
<div id="root"><div id="boot">Loading PRV Quote Tool&hellip;</div></div>
<script>${runtime}</script>
</body>
</html>
`;

writeFileSync(OUT, html);
console.log(`wrote ${OUT}`);
console.log(`  ${(html.length / 1024).toFixed(0)} KB total`);
console.log(`  bundled: ${Object.keys(modules).join(', ')}, app`);
