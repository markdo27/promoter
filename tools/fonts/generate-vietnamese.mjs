// Run the owner's VinaDau engine without copying its private implementation.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

if (process.argv.length !== 6) {
  throw new Error('Usage: node generate-vietnamese.mjs ENGINE SOURCE OUTPUT.otf REPORT.json');
}
const [engine, sourcePath, outputPath, reportPath] = process.argv.slice(2).map(value => path.resolve(value));
const load = relative => import(pathToFileURL(path.join(engine, relative)).href);
const requireEngine = createRequire(path.join(engine, 'package.json'));
const opentype = requireEngine('opentype.js');
const { analyzeFont } = await load('src/engine/fontAnalyzer.js');
const { processFont, buildExportFont, compileFont, libraryQueryOf, describeExportLosses } = await load('src/engine/glyphComposer.js');
const { ensureLibraryMatch } = await load('src/engine/accentKnowledgeBase.js');
const { auditGeneratedFont } = await load('src/engine/qualityAudit.js');
const { default: vietnamese } = await load('src/utils/vietnameseMap.js');
const bytes = fs.readFileSync(sourcePath);
const source = opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
const analysis = analyzeFont(source);
const query = libraryQueryOf(source, analysis);
await ensureLibraryMatch(query.metrics, query.category, query.marks);
const result = processFont(source, analysis);
if (result.errors.length) throw new Error(JSON.stringify(result.errors));
const exported = buildExportFont(source, result.glyphs);
const { buffer, dropped } = compileFont(exported);
const losses = describeExportLosses(source, dropped);
// VinaDau rebuilds outlines without source hinting; layout losses must block export.
if (losses.some(loss => loss.id !== 'hinting')) throw new Error(`Unexpected export losses: ${JSON.stringify(losses)}`);
const checked = opentype.parse(buffer);
const missing = vietnamese.filter(entry => !checked.charToGlyphIndex(entry.char));
if (missing.length) throw new Error(`Missing Vietnamese: ${missing.map(entry => entry.char).join('')}`);
const audit = auditGeneratedFont({ analysis, result, losses });
const report = {
  engine: 'VinaDau',
  engineCommit: execFileSync('git', ['-C', engine, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  source: path.basename(sourcePath),
  sourceSha256: createHash('sha256').update(bytes).digest('hex'),
  generated: result.glyphs.length,
  existing: result.skipped.length,
  vietnameseCoverage: vietnamese.length,
  errors: result.errors,
  losses,
  accentSources: result.accentSources,
  accentMatch: result.accentMatch ? {
    matchedFamily: result.accentMatch.matchedFamily,
    score: result.accentMatch.score,
    method: result.accentMatch.method,
    credits: result.accentMatch.credits,
  } : null,
  conventions: result.conventions,
  audit,
};
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(outputPath, Buffer.from(buffer));
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ generated: report.generated, existing: report.existing, coverage: report.vietnameseCoverage, score: audit.score, checks: audit.checks }));
