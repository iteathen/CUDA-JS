import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { parse as parseJavaScript } from 'acorn';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const ignoredDirectories = new Set(['.git', 'build', 'node_modules', 'docs/archive']);
const capabilityBlockStart = '<!-- CUDA-JS:BEGIN GENERATED CAPABILITY STATUS -->';
const capabilityBlockEnd = '<!-- CUDA-JS:END GENERATED CAPABILITY STATUS -->';
const interopBlockStart = '<!-- CUDA-JS:BEGIN GENERATED CUDA-MCGS INTEROP -->';
const interopBlockEnd = '<!-- CUDA-JS:END GENERATED CUDA-MCGS INTEROP -->';
const activePlanPaths = [
  'docs/plans/2026-08-12-native-and-platform-qualification-continuation.md',
  'docs/plans/2026-08-12-execution-capability-continuation.md',
  'docs/plans/2026-08-12-compatible-pair-continuation.md',
  'docs/plans/2026-08-13-capability-expansion-roadmap.md',
  'docs/plans/2026-08-13-capability-docs-67-handoff.md',
];
const proposalAuthorityPaths = [
  'docs/specs/SPEC-0014-long-lived-sideband.md',
  'docs/specs/SPEC-0017-device-selection-and-target-resolution.md',
  'docs/specs/SPEC-0018-bounded-multi-operation-scheduling.md',
  'docs/specs/SPEC-0019-host-memory-and-async-transfer.md',
  'docs/specs/SPEC-0020-prepared-batch-and-graph-execution.md',
  'docs/specs/SPEC-0021-extended-numeric-abi-and-device-views.md',
  'docs/specs/SPEC-0022-device-js-parallel-and-service-profiles.md',
  'docs/specs/SPEC-0023-context-bound-cuda-library-adapters.md',
  'docs/specs/SPEC-0024-multi-gpu-orchestration.md',
  'docs/specs/SPEC-0025-graphics-interop.md',
  'docs/specs/SPEC-0026-process-isolated-execution.md',
];
const expectedStatusRecords = [
  {
    id: 'SPEC-0003-disposal-failure',
    label: 'SPEC-0003 disposal-failure correction',
    authority: [
      'docs/specs/SPEC-0003-driver-actor-resource-lifecycle.md',
      'docs/specs/SPEC-0003-disposal-failure-addendum.md',
    ],
    architecturalDisposition: 'planned',
    architectureContext: 'accepted correction',
    implementation: { status: 'implemented', profile: 'portable/software' },
    qualification: { status: 'not-qualified', profile: 'destructive native cleanup failure partitions' },
    priority: { status: 'deferred', context: 'independent native qualification' },
    publicSurface: '`RESOURCE_DISPOSE_FAILED` preserves the underlying category, operation and health transition; failed resource capabilities become orphaned and unusable.',
    limit: 'Repeated close does not retry disposal by default; only bounded sanitized failure details are public.',
    issue: 66,
  },
  {
    id: 'SPEC-0006-target-policy',
    label: 'SPEC-0006 target-policy correction',
    authority: [
      'docs/specs/SPEC-0006-compiler-linker-cache.md',
      'docs/specs/SPEC-0006-target-syntax-addendum.md',
    ],
    architecturalDisposition: 'planned',
    architectureContext: 'accepted correction',
    implementation: { status: 'implemented', profile: 'portable/software/package' },
    qualification: { status: 'not-qualified', profile: 'newly represented targets; existing qualified targets unchanged' },
    priority: { status: 'deferred', context: 'independent native qualification' },
    publicSurface: 'No new export; compile, link and Device-JS target fields share canonical `compute_<base>` / `sm_<base>` parsing with optional structural `f` or `a` suffix recognition.',
    limit: 'Policy revision 1 admits only unsuffixed bases 75, 80, 86, 87, 88, 89, 90, 100, 103, 110, 120 and 121; syntax/policy admission is not provider, toolkit, GPU or qualification evidence.',
    issue: 65,
  },
  {
    id: 'SPEC-0010-relocatable-device-code',
    label: 'SPEC-0010 relocatable device code',
    authority: ['docs/specs/SPEC-0010-relocatable-device-code.md'],
    architecturalDisposition: 'planned',
    architectureContext: 'accepted capability',
    implementation: { status: 'implemented', profile: 'portable/software/package' },
    qualification: { status: 'not-qualified', profile: 'exact Windows public RDC compile/link/launch/oracle/lifecycle' },
    priority: { status: 'active', context: 'native qualification' },
    publicSurface: '`compile({ options: { relocatableDeviceCode: boolean } })` returns typed PTX marked `relocatableDeviceCode: true` when enabled; the existing `link()` consumes it.',
    limit: 'Default is `false`; relocatable PTX has no direct-execution promise and callers cannot provide native option text.',
    issue: 35,
  },
  {
    id: 'SPEC-0011-scalar-kernel-arguments',
    label: 'SPEC-0011 scalar kernel arguments',
    authority: ['docs/specs/SPEC-0011-scalar-kernel-arguments.md'],
    architecturalDisposition: 'planned',
    architectureContext: 'accepted capability',
    implementation: { status: 'implemented', profile: 'portable/software/package' },
    qualification: { status: 'not-qualified', profile: 'exact Windows mixed-scalar ABI/launch/oracle/lifecycle' },
    priority: { status: 'active', context: 'native qualification' },
    publicSurface: 'Function parameter kinds are exactly `device-memory`, `u32`, `u64`, `i32` and `f32`; facade launch values are validated and packed by their declared kind.',
    limit: 'No numeric coercion, raw parameter buffer, arbitrary ABI kind or non-finite `f32` value is accepted.',
    issue: null,
  },
  {
    id: 'SPEC-0012-device-lto',
    label: 'SPEC-0012 Device LTO',
    authority: ['docs/specs/SPEC-0012-device-lto.md'],
    architecturalDisposition: 'planned',
    architectureContext: 'accepted capability',
    implementation: { status: 'implemented', profile: 'portable/software/package' },
    qualification: { status: 'not-qualified', profile: 'exact Windows LTO-IR compile/link/launch/oracle/lifecycle' },
    priority: { status: 'active', context: 'native qualification' },
    publicSurface: '`compile({ output: "lto-ir" })` returns typed LTO-IR; `link()` accepts a homogeneous typed LTO-IR set and returns cubin.',
    limit: 'Raw LTO-IR, mixed PTX/LTO input, caller-selected native kinds/options and broad cross-target composition are rejected.',
    issue: 42,
  },
  {
    id: 'SPEC-0013-restricted-device-js',
    label: 'SPEC-0013 restricted Device-JS',
    authority: [
      'docs/specs/SPEC-0013-restricted-device-js.md',
      'docs/specs/SPEC-0013-public-surface-addendum.md',
    ],
    architecturalDisposition: 'planned',
    architectureContext: 'accepted capability',
    implementation: { status: 'implemented', profile: 'portable/software/package' },
    qualification: { status: 'not-qualified', profile: 'exact Windows generated-source/compiler/launch/oracle/lifecycle' },
    priority: { status: 'active', context: 'native qualification' },
    publicSurface: '`compileDeviceProgram(runtime, request)` validates restricted Device-JS and returns a bounded device-program descriptor plus the ordinary compiler result.',
    limit: 'Acorn 8.15.0 is syntax-only; the accepted subset is closed and generated CUDA, ASTs, native options, pointers and handles remain private.',
    issue: 43,
  },
  {
    id: 'SPEC-0016-operation-lifecycle',
    label: 'SPEC-0016 operation lifecycle',
    authority: ['docs/specs/SPEC-0016-operation-lifecycle.md'],
    architecturalDisposition: 'planned',
    architectureContext: 'accepted capability',
    implementation: { status: 'implemented', profile: 'portable/software/package' },
    qualification: { status: 'not-qualified', profile: 'exact Windows submit/status/wait/close/deferred-failure/lifecycle' },
    priority: { status: 'active', context: 'native qualification' },
    publicSurface: '`CudaFunction.submit()` returns an opaque `CudaOperation` with `status()`, `wait()` and `close()`; `launch()` remains the terminal convenience API.',
    limit: 'One pending operation and one private stream; pending-command gating remains conservative and there is no public stream/event or kernel-cancellation surface.',
    issue: 51,
  },
];

function exactStatusRecordsMatch(records) {
  return isDeepStrictEqual(records, expectedStatusRecords);
}

function markdownCell(value) {
  return String(value).replaceAll('|', '\\|').replace(/\s*\r?\n\s*/g, ' ').trim();
}

function renderCapabilityStatus(records) {
  const lines = [
    capabilityBlockStart,
    '| Capability | Architectural disposition | Implementation | Qualification / profile | Priority | Public surface | Limit | Issue |',
    '|---|---|---|---|---|---|---|---|',
  ];
  for (const record of records) {
    const issue = record.issue === null ? '—' : `#${record.issue}`;
    lines.push(`| ${markdownCell(record.label)} | ${markdownCell(`${record.architecturalDisposition} — ${record.architectureContext}`)} | ${markdownCell(`${record.implementation.status} — ${record.implementation.profile}`)} | ${markdownCell(`${record.qualification.status} — ${record.qualification.profile}`)} | ${markdownCell(`${record.priority.status} — ${record.priority.context}`)} | ${markdownCell(record.publicSurface)} | ${markdownCell(record.limit)} | ${issue} |`);
  }
  lines.push(capabilityBlockEnd);
  return lines.join('\n');
}

function renderCudaMcgsInterop(interop) {
  return [
    interopBlockStart,
    '| Boundary | Governance projection |',
    '|---|---|',
    `| Status | ${markdownCell(interop.status)} |`,
    `| External consumer owns | ${markdownCell(interop.externalConsumerOwns.join('; '))} |`,
    `| CUDA-JS owns | ${markdownCell(interop.cudaJsOwns.join('; '))} |`,
    `| Production authoring boundary | ${markdownCell(interop.productionAuthoringBoundary)} |`,
    `| Cross-repository deletion test | ${markdownCell(interop.deletionTest)} |`,
    `| Exact compatible pair | ${markdownCell(interop.compatiblePair)} |`,
    interopBlockEnd,
  ].join('\n');
}

function occurrences(text, needle) {
  return text.split(needle).length - 1;
}

function validateExactGeneratedBlock(relative, text, start, end, expected) {
  const startCount = occurrences(text, start);
  const endCount = occurrences(text, end);
  if (startCount !== 1 || endCount !== 1) {
    errors.push(`${relative}: expected exactly one generated block delimited by ${start} and ${end}`);
    return;
  }
  const startIndex = text.indexOf(start);
  const endIndex = text.indexOf(end, startIndex);
  if (endIndex < startIndex) {
    errors.push(`${relative}: generated block end precedes its start: ${start}`);
    return;
  }
  const actual = text.slice(startIndex, endIndex + end.length);
  if (actual !== expected) errors.push(`${relative}: generated block differs from docs/capability-status.json: ${start}`);
}

function bindingNames(pattern, names, sourceLabel) {
  if (pattern.type === 'Identifier') {
    names.add(pattern.name);
    return;
  }
  if (pattern.type === 'AssignmentPattern') {
    bindingNames(pattern.left, names, sourceLabel);
    return;
  }
  if (pattern.type === 'RestElement') {
    bindingNames(pattern.argument, names, sourceLabel);
    return;
  }
  if (pattern.type === 'ArrayPattern') {
    for (const element of pattern.elements) if (element) bindingNames(element, names, sourceLabel);
    return;
  }
  if (pattern.type === 'ObjectPattern') {
    for (const property of pattern.properties) bindingNames(property.type === 'RestElement' ? property.argument : property.value, names, sourceLabel);
    return;
  }
  throw new Error(`${sourceLabel}: unsupported exported binding pattern: ${pattern.type}`);
}

function moduleExportNames(source, sourceLabel = '<module>') {
  let program;
  try {
    program = parseJavaScript(source, { ecmaVersion: 'latest', sourceType: 'module' });
  } catch (error) {
    throw new Error(`${sourceLabel}: cannot parse public entry module: ${error.message}`);
  }
  const names = new Set();
  for (const statement of program.body) {
    if (statement.type === 'ExportAllDeclaration') {
      throw new Error(`${sourceLabel}: export-all syntax is forbidden on a manifest-owned public entry`);
    }
    if (statement.type === 'ExportDefaultDeclaration') {
      names.add('default');
      continue;
    }
    if (statement.type !== 'ExportNamedDeclaration') continue;
    if (statement.declaration) {
      const declaration = statement.declaration;
      if (declaration.type === 'VariableDeclaration') {
        for (const item of declaration.declarations) bindingNames(item.id, names, sourceLabel);
      } else if ((declaration.type === 'FunctionDeclaration' || declaration.type === 'ClassDeclaration') && declaration.id) {
        names.add(declaration.id.name);
      } else {
        throw new Error(`${sourceLabel}: unsupported exported declaration: ${declaration.type}`);
      }
    }
    for (const specifier of statement.specifiers) {
      if (specifier.type !== 'ExportSpecifier') {
        throw new Error(`${sourceLabel}: unsupported export specifier: ${specifier.type}`);
      }
      const exported = specifier.exported;
      if (exported.type === 'Identifier') names.add(exported.name);
      else if (exported.type === 'Literal' && typeof exported.value === 'string') names.add(exported.value);
      else throw new Error(`${sourceLabel}: unsupported exported name: ${exported.type}`);
    }
  }
  return [...names].sort();
}

function stripComments(source) {
  let output = '';
  let state = 'code';
  let quote = null;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (state === 'line-comment') {
      if (character === '\n') { state = 'code'; output += '\n'; } else output += ' ';
      continue;
    }
    if (state === 'block-comment') {
      if (character === '*' && next === '/') { output += '  '; index += 1; state = 'code'; }
      else output += character === '\n' ? '\n' : ' ';
      continue;
    }
    if (state === 'string') {
      output += character;
      if (character === '\\') {
        if (index + 1 < source.length) { output += source[index + 1]; index += 1; }
      } else if (character === quote) {
        state = 'code';
        quote = null;
      }
      continue;
    }
    if (character === '/' && next === '/') { output += '  '; index += 1; state = 'line-comment'; continue; }
    if (character === '/' && next === '*') { output += '  '; index += 1; state = 'block-comment'; continue; }
    if (character === "'" || character === '"' || character === '`') { state = 'string'; quote = character; }
    output += character;
  }
  if (state === 'block-comment') throw new Error('unterminated block comment in public declarations');
  if (state === 'string') throw new Error('unterminated string in public declarations');
  return output;
}

function escapedRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function structuralLineRecords(source) {
  const records = [];
  let lineStart = 0;
  let lineStartDepth = 0;
  let lineStartQuote = null;
  let braceDepth = 0;
  let quote = null;
  for (let index = 0; index <= source.length; index += 1) {
    const character = source[index] ?? '\n';
    if (character === '\n') {
      if (lineStartDepth === 0 && lineStartQuote === null) records.push({ start: lineStart, text: source.slice(lineStart, index) });
      lineStart = index + 1;
      lineStartDepth = braceDepth;
      lineStartQuote = quote;
      continue;
    }
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "'" || character === '"' || character === '`') { quote = character; continue; }
    if (character === '{') braceDepth += 1;
    if (character === '}') braceDepth -= 1;
    if (braceDepth < 0) throw new Error('unbalanced closing brace in public declarations');
  }
  if (braceDepth !== 0) throw new Error('unbalanced braces in public declarations');
  return records;
}

function exportedTypeAlias(source, name) {
  const clean = stripComments(source);
  const header = new RegExp(`^export[ \\t]+type[ \\t]+${escapedRegExp(name)}[ \\t]*=`);
  const matches = structuralLineRecords(clean).filter((record) => header.test(record.text.trimStart()));
  if (matches.length !== 1) throw new Error(`components/runtime-facade/index.d.ts: expected exactly one exported ${name} type alias`);
  const record = matches[0];
  const equalsIndex = clean.indexOf('=', record.start);
  let quote = null;
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenthesisDepth = 0;
  for (let index = equalsIndex + 1; index < clean.length; index += 1) {
    const character = clean[index];
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "'" || character === '"' || character === '`') { quote = character; continue; }
    if (character === '{') braceDepth += 1;
    else if (character === '}') braceDepth -= 1;
    else if (character === '[') bracketDepth += 1;
    else if (character === ']') bracketDepth -= 1;
    else if (character === '(') parenthesisDepth += 1;
    else if (character === ')') parenthesisDepth -= 1;
    else if (character === ';' && braceDepth === 0 && bracketDepth === 0 && parenthesisDepth === 0) return clean.slice(equalsIndex + 1, index).trim();
  }
  throw new Error(`components/runtime-facade/index.d.ts: unterminated ${name} type alias`);
}

function stringLiteralUnion(source, name) {
  return exportedTypeAlias(source, name).split('|').map((member) => {
    const match = member.trim().match(/^(['"])([^'"\\]+)\1$/);
    if (!match) throw new Error(`components/runtime-facade/index.d.ts: ${name} must be a closed string-literal union`);
    return match[2];
  });
}

function exportedInterfaceBody(source, name) {
  const clean = stripComments(source);
  const header = new RegExp(`^export[ \\t]+interface[ \\t]+${escapedRegExp(name)}[ \\t]*\\{[ \\t]*$`);
  const headers = structuralLineRecords(clean).filter((record) => header.test(record.text.trim()));
  if (headers.length !== 1) throw new Error(`components/runtime-facade/index.d.ts: expected exactly one exported ${name} interface`);
  const openIndex = headers[0].start + headers[0].text.lastIndexOf('{');
  let depth = 0;
  let quote = null;
  for (let index = openIndex; index < clean.length; index += 1) {
    const character = clean[index];
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === "'" || character === '"' || character === '`') { quote = character; continue; }
    if (character === '{') depth += 1;
    if (character === '}') {
      depth -= 1;
      if (depth === 0) return clean.slice(openIndex + 1, index);
    }
  }
  throw new Error(`components/runtime-facade/index.d.ts: unterminated ${name} interface`);
}

function hasExactInterfaceMember(source, interfaceName, signature) {
  const body = exportedInterfaceBody(source, interfaceName);
  const lines = structuralLineRecords(body).map((record) => record.text.trim()).filter(Boolean);
  return lines.filter((line) => line === signature).length === 1;
}

function hasExactExportedDeclaration(source, declaration) {
  const clean = stripComments(source);
  return structuralLineRecords(clean).map((record) => record.text.trim()).filter((line) => line === declaration).length === 1;
}

function declaredValueExportNames(source, sourceLabel = '<declarations>') {
  const clean = stripComments(source);
  const names = new Set();
  for (const { text } of structuralLineRecords(clean)) {
    const line = text.trim();
    let match = line.match(/^export\s+(?:declare\s+)?(?:async\s+)?(?:function\*?|class|const|let|var)\s+([A-Za-z_$][\w$]*)\b/);
    if (match) { names.add(match[1]); continue; }
    match = line.match(/^export\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]\s*;$/);
    if (match) {
      for (const item of match[1].split(',')) {
        const exported = item.trim().split(/\s+as\s+/).at(-1)?.trim();
        if (!/^[A-Za-z_$][\w$]*$/.test(exported ?? '')) throw new Error(`${sourceLabel}: unsupported declaration export: ${item.trim()}`);
        names.add(exported);
      }
      continue;
    }
    if (/^export\s+(?:type\b|interface\b)/.test(line)) continue;
    if (/^export\s+(?:default\b|\*)/.test(line)) throw new Error(`${sourceLabel}: default/export-all declarations are forbidden on a manifest-owned public type entry`);
    if (/^export\b/.test(line)) throw new Error(`${sourceLabel}: unsupported top-level export declaration: ${line}`);
  }
  return [...names].sort();
}

function activePlanRegistryProblems(indexText, explicitPaths, referencedPaths, statusByPath) {
  const problems = [];
  const explicitSet = new Set(explicitPaths);
  for (const relative of explicitPaths) {
    const basename = path.basename(relative);
    const exactIndexLink = '[`' + basename + '`](' + basename + ')';
    if (occurrences(indexText, exactIndexLink) !== 1) problems.push(`docs/plans/README.md: active plan must be linked exactly once: ${basename}`);
    const status = statusByPath.get(relative);
    if (!status || /^Superseded\b/i.test(status)) problems.push(`${relative}: active plan has missing or Superseded status`);
    else if (!['Proposal', 'Informational'].includes(status)) problems.push(`${relative}: active plan has unrecognized current status: ${status}`);
  }
  for (const relative of referencedPaths) {
    if (!explicitSet.has(relative)) problems.push(`next_step.yaml: indexed active plan is absent from the explicit active plan registry: ${relative}`);
  }
  const indexedPlanLinks = [...indexText.matchAll(/\]\((20\d{2}-[^)#]+\.md)\)/g)].map((match) => `docs/plans/${match[1]}`);
  for (const relative of indexedPlanLinks) {
    if (!explicitSet.has(relative)) problems.push(`docs/plans/README.md: indexed active plan is absent from the explicit active plan registry: ${relative}`);
  }
  return problems;
}

function runPublicSurfaceVerifierControls() {
  const failures = [];
  const requireControl = (condition, label) => { if (!condition) failures.push(label); };
  requireControl(JSON.stringify(moduleExportNames('export async function* hidden() {}', 'async-generator control')) === JSON.stringify(['hidden']), 'async generator export must be visible');
  requireControl(JSON.stringify(moduleExportNames('export default function named() {}', 'default control')) === JSON.stringify(['default']), 'default export must be visible');
  requireControl(JSON.stringify(moduleExportNames('const value = 1; export { value as renamed };', 'alias control')) === JSON.stringify(['renamed']), 'aliased export must use its public name');
  let exportAllRejected = false;
  try { moduleExportNames("export * from './hidden.mjs';", 'export-all control'); } catch { exportAllRejected = true; }
  requireControl(exportAllRejected, 'export-all syntax must fail closed');
  const commentedMember = `export interface Control {\n  /* required?: boolean; */\n  other?: string;\n}`;
  requireControl(!hasExactInterfaceMember(commentedMember, 'Control', 'required?: boolean;'), 'commented interface member must not satisfy a type contract');
  requireControl(!hasExactExportedDeclaration('// export function hidden(): void;', 'export function hidden(): void;'), 'commented declaration must not satisfy an exported declaration');
  requireControl(JSON.stringify(declaredValueExportNames('export interface Shape {}\nexport type Kind = string;\nexport function visible(): void;\nexport const value: number;', 'declaration control')) === JSON.stringify(['value', 'visible']), 'type-only declarations must not become value exports');
  requireControl(declaredValueExportNames('export function visible(): void;\nexport function hidden(): void;', 'phantom control').includes('hidden'), 'phantom value declaration must be visible');
  let unsupportedTypeValueRejected = false;
  try { declaredValueExportNames('export enum Hidden { Value }', 'enum control'); } catch { unsupportedTypeValueRejected = true; }
  requireControl(unsupportedTypeValueRejected, 'unsupported TypeScript value export must fail closed');
  let openUnionRejected = false;
  try { stringLiteralUnion("export type Control = 'closed' | string;", 'Control'); } catch { openUnionRejected = true; }
  requireControl(openUnionRejected, 'non-literal type-union member must fail closed');
  const plan = 'docs/plans/2026-08-13-control.md';
  const planIndex = '- [`2026-08-13-control.md`](2026-08-13-control.md) — active control';
  const statuses = new Map([[plan, 'Proposal']]);
  requireControl(activePlanRegistryProblems(planIndex, [plan], [plan], statuses).length === 0, 'valid active-plan registry control must pass');
  requireControl(activePlanRegistryProblems('', [plan], [plan], statuses).some((problem) => problem.includes('linked exactly once')), 'missing active-plan index link must fail');
  requireControl(activePlanRegistryProblems(planIndex, [plan], [plan], new Map([[plan, 'Superseded']])).some((problem) => problem.includes('Superseded')), 'Superseded active-plan status must fail');
  requireControl(activePlanRegistryProblems(`${planIndex}\n- [\`2026-08-13-rogue.md\`](2026-08-13-rogue.md)`, [plan], [plan], statuses).some((problem) => problem.includes('indexed active plan')), 'unregistered indexed active plan must fail');
  const mutateStatus = (id, change) => {
    const records = structuredClone(expectedStatusRecords);
    const record = records.find((candidate) => candidate.id === id);
    change(record);
    return records;
  };
  requireControl(!exactStatusRecordsMatch(mutateStatus('SPEC-0012-device-lto', (record) => { record.architecturalDisposition = 'rejected'; })), 'SPEC-0012 architectural rejection mutation must fail');
  requireControl(!exactStatusRecordsMatch(mutateStatus('SPEC-0012-device-lto', (record) => { record.priority.status = 'deferred'; })), 'SPEC-0012 priority deferral mutation must fail');
  requireControl(!exactStatusRecordsMatch(mutateStatus('SPEC-0012-device-lto', (record) => { record.authority.push('docs/specs/SPEC-0020-prepared-batch-and-graph-execution.md'); })), 'SPEC-0012 widened authority mutation must fail');
  requireControl(!exactStatusRecordsMatch(mutateStatus('SPEC-0012-device-lto', (record) => { record.publicSurface = 'Arbitrary native LTO options are public.'; })), 'SPEC-0012 widened public claim mutation must fail');
  requireControl(!exactStatusRecordsMatch(mutateStatus('SPEC-0006-target-policy', (record) => { record.implementation.status = 'partial'; })), 'SPEC-0006 partial regression mutation must fail');
  requireControl(!exactStatusRecordsMatch(mutateStatus('SPEC-0003-disposal-failure', (record) => { record.implementation.status = 'partial'; })), 'SPEC-0003 partial regression mutation must fail');
  return failures;
}

for (const failure of runPublicSurfaceVerifierControls()) errors.push(`verify-docs public-surface control failed: ${failure}`);

const required = [
  'README.md', 'AGENTS.md', 'STATUS.md', 'next_step.yaml', 'CONTRIBUTING.md', 'LICENSE', 'LICENSING.md', 'package.json',
  'agent_files/README.md', 'agent_files/AGENTS.md', 'agent_files/AI_RULES.md',
  'agent_files/DESIGN_ALIGNMENT_CARD.md', 'agent_files/SYSTEM_REGISTRY.md', 'agent_files/VALIDATION_POLICY.md',
  'agent_files/general_foundation/README.md', 'agent_files/general_foundation/PRINCIPLES.md',
  'agent_files/general_foundation/ENGINEERING_JUDGMENT.md', 'agent_files/general_foundation/ASSESSMENT_AND_PLANNING.md',
  'agent_files/general_foundation/PROJECT_ORGANIZATION.md', 'agent_files/general_foundation/SPEC_AND_AGENT_FILE_READING.md',
  'agent_files/general_foundation/FOCUS_BRANCHES.md', 'agent_files/general_foundation/PLAN_EXECUTION.md',
  'agent_files/general_foundation/TESTING.md', 'agent_files/general_foundation/DEBUGGING.md',
  'agent_files/general_foundation/SANITY_CHECKING.md', 'agent_files/general_foundation/PULL_REQUEST_REVIEW_AND_MERGE.md',
  'agent_files/general_foundation/CLEANUP_AND_DISPOSITION.md', 'agent_files/general_foundation/TOKEN_DISCIPLINE.md',
  'agent_files/general_foundation/DOCUMENTATION_GOVERNANCE.md', 'agent_files/general_foundation/SECURITY.md',
  'agent_files/general_foundation/STATUS_SEMANTICS.md',
  'agent_files/application_specific/CUDA_JS_PROFILE.md',
  'docs/README.md', 'docs/FOUNDATION_INDEX.md', 'docs/PROJECT_CHARTER.md', 'docs/INTEROP_WITH_CUDA_MCGS.md',
  'docs/capability-status.json',
  'docs/HARDWARE_SUPPORT.md', 'docs/NODE_SUPPORT.md', 'docs/THIRD_PARTY_DEPENDENCIES.md',
  'docs/decisions/README.md', 'docs/decisions/ADR-0001-repository-boundary.md',
  'docs/decisions/ADR-0002-node-ffi-first-host-binding.md',
  'docs/decisions/ADR-0003-generated-abi-facts-and-semantic-overlays.md',
  'docs/architecture/README.md', 'docs/architecture/FRAMEWORK_OVERVIEW.md',
  'docs/architecture/FOUNDATION_ASSESSMENT_AND_PLAN.md', 'docs/architecture/TARGET_ARCHITECTURE.md',
  'docs/architecture/V0_SUPPORT_MATRIX.md', 'docs/plans/README.md',
  'docs/plans/2026-08-10-master-plan.md', 'docs/plans/2026-08-10-focus-branch-map.json',
  'docs/plans/2026-08-11-hardware-qualification-program.md',
  'docs/plans/2026-08-11-node-and-extended-qualification.md',
  'docs/plans/2026-08-11-f9-atomic-interop.md',
  'docs/SPONSORSHIP.md',
  'docs/specs/README.md', 'docs/specs/SPEC-0000-runtime-contract-map.md',
  'docs/specs/SPEC-0001-cuda-schema-compiler.md',
  'docs/specs/SPEC-0002-windows-driver-bootstrap.md',
  'docs/specs/SPEC-0003-driver-actor-resource-lifecycle.md',
  'docs/specs/SPEC-0003-disposal-failure-addendum.md',
  'docs/specs/SPEC-0004-device-memory-foundation.md',
  'docs/specs/SPEC-0005-module-launch-completion.md',
  'docs/specs/SPEC-0006-compiler-linker-cache.md',
  'docs/specs/SPEC-0006-target-syntax-addendum.md',
  'docs/specs/SPEC-0007-windows-platform-hardening.md',
  'docs/specs/SPEC-0008-package-public-facade.md',
  'docs/specs/SPEC-0009-trusted-toolkit-headers-and-cuda-mcgs-interop.md',
  'docs/specs/SPEC-0010-relocatable-device-code.md',
  'docs/specs/SPEC-0011-scalar-kernel-arguments.md',
  'docs/specs/SPEC-0012-device-lto.md',
  'docs/specs/SPEC-0013-restricted-device-js.md',
  'docs/specs/SPEC-0013-public-surface-addendum.md',
  'docs/specs/SPEC-0015-execution-scope-status-clarification.md',
  'docs/specs/SPEC-0016-operation-lifecycle.md',
  ...proposalAuthorityPaths,
  'docs/plans/2026-08-12-native-and-platform-qualification-continuation.md',
  'docs/plans/2026-08-12-execution-capability-continuation.md',
  'docs/plans/2026-08-12-compatible-pair-continuation.md',
  'docs/plans/2026-08-13-capability-expansion-roadmap.md',
  'docs/plans/2026-08-13-capability-docs-67-handoff.md',
  'docs/research/README.md', 'docs/research/2026-08-10-technical-assumption-audit.md',
  'docs/research/2026-08-10-node-ffi-cuda-landscape.md', 'docs/research/source-register.yaml',
  'docs/archive/README.md', 'experiments/README.md', 'experiments/EXPERIMENT_MATRIX.md',
  'experiments/EXP-000-node-ffi-synthetic-abi.md', 'experiments/EXP-001-node-ffi-cuda-smoke.md',
  'experiments/EXP-014-operation-lifecycle.md', 'experiments/exp-014/README.md',
  'experiments/EXP-012-windows-node-ffi-cuda-smoke.md',
  'experiments/exp-000/README.md', 'experiments/exp-000/case-schema.json',
  'experiments/exp-000/generated/runtime-ir.json', 'experiments/exp-000/generated/synthetic_abi.h',
  'experiments/exp-000/generated/synthetic_abi.c', 'experiments/exp-000/generated/oracle.c',
  'experiments/exp-001/README.md', 'experiments/exp-001/profile.json',
  'experiments/exp-001/generated/oracle.c', 'experiments/exp-001/src/paths.mjs',
  'experiments/exp-001/src/build.mjs', 'experiments/exp-001/src/readiness.mjs',
  'experiments/exp-001/src/permission-probe.mjs', 'experiments/exp-001/src/run-smoke.mjs',
  'experiments/exp-012/README.md', 'experiments/exp-012/generated/oracle.c',
  'experiments/exp-012/src/paths.mjs', 'experiments/exp-012/src/evidence.mjs',
  'experiments/exp-012/src/build.mjs', 'experiments/exp-012/src/driver-worker.mjs',
  'experiments/exp-012/src/permission-probe.mjs', 'experiments/exp-012/src/run-smoke.mjs',
  'experiments/exp-012/src/verify.mjs',
  'experiments/exp-009/README.md', 'experiments/exp-009/fixtures/vector-add.cu.txt',
  'experiments/exp-009/native/windows-compiler-oracle.c',
  'experiments/exp-009/src/run-native-windows.mjs',
  'benchmarks/README.md', 'components/README.md',
  'components/resource-registry/README.md', 'components/resource-registry/component.yaml',
  'components/resource-registry/index.mjs', 'components/resource-registry/src/resource-error.mjs',
  'components/resource-registry/src/resource-registry.mjs',
  'components/resource-registry/test/resource-registry.test.mjs',
  'components/driver-actor/README.md', 'components/driver-actor/component.yaml',
  'components/driver-actor/index.mjs', 'components/driver-actor/testing.mjs',
  'components/driver-actor/src/errors.mjs', 'components/driver-actor/src/health.mjs',
  'components/driver-actor/src/protocol.mjs', 'components/driver-actor/src/driver-runtime.mjs',
  'components/driver-actor/src/actor-worker.mjs', 'components/driver-actor/src/startup-rollback.mjs',
  'components/driver-actor/src/backends/mock.mjs',
  'components/driver-actor/src/backends/windows-native.mjs',
  'components/driver-actor/test/driver-runtime.test.mjs',
  'components/driver-actor/test/health.test.mjs',
  'components/memory/README.md', 'components/memory/component.yaml',
  'components/memory/index.mjs', 'components/memory/src/memory-manager.mjs',
  'components/memory/test/memory-manager.test.mjs',
  'components/execution/README.md', 'components/execution/component.yaml',
  'components/execution/index.mjs', 'components/execution/src/execution-manager.mjs',
  'components/execution/test/execution-manager.test.mjs',
  'components/compiler-actor/README.md', 'components/compiler-actor/component.yaml',
  'components/compiler-actor/index.mjs', 'components/compiler-actor/testing.mjs',
  'components/compiler-actor/src/errors.mjs', 'components/compiler-actor/src/contract.mjs',
  'components/compiler-actor/src/header-profile.mjs',
  'components/compiler-actor/src/cache.mjs', 'components/compiler-actor/src/compiler-runtime.mjs',
  'components/compiler-actor/src/actor-worker.mjs',
  'components/compiler-actor/src/backends/mock.mjs',
  'components/compiler-actor/src/backends/windows-native.mjs',
  'components/compiler-actor/test/compiler-actor.test.mjs',
  'components/cuda-target/README.md', 'components/cuda-target/component.yaml',
  'components/cuda-target/index.mjs', 'components/cuda-target/test/cuda-target.test.mjs',
  'components/device-js/README.md', 'components/device-js/component.yaml',
  'components/device-js/index.mjs', 'components/device-js/testing.mjs',
  'components/device-js/src/errors.mjs', 'components/device-js/src/translator.mjs',
  'components/device-js/src/strict-translator.mjs',
  'components/device-js/test/translator.test.mjs', 'components/device-js/test/strict-contract.test.mjs',
  'components/platform-diagnostics/README.md', 'components/platform-diagnostics/component.yaml',
  'components/platform-diagnostics/index.mjs',
  'components/platform-diagnostics/src/platform-diagnostics.mjs',
  'components/platform-diagnostics/test/platform-diagnostics.test.mjs',
  'components/runtime-facade/README.md', 'components/runtime-facade/component.yaml',
  'components/runtime-facade/index.mjs', 'components/runtime-facade/index.d.ts',
  'components/runtime-facade/compatibility.mjs', 'components/runtime-facade/compatibility.d.ts',
  'components/runtime-facade/testing.mjs', 'components/runtime-facade/testing.d.ts',
  'components/runtime-facade/src/errors.mjs', 'components/runtime-facade/src/runtime.mjs',
  'components/runtime-facade/src/device-program.mjs',
  'components/runtime-facade/test/runtime-facade.test.mjs', 'components/runtime-facade/test/device-js.test.mjs',
  'schemas/README.md', 'conformance/README.md',
  'conformance/f3/README.md', 'conformance/f3/evidence.mjs',
  'conformance/f3/run-mock.mjs', 'conformance/f3/run-native-windows.mjs',
  'conformance/f3/verify.mjs',
  'conformance/f4/README.md', 'conformance/f4/evidence.mjs',
  'conformance/f4/run-mock.mjs', 'conformance/f4/build-native-windows.mjs',
  'conformance/f4/run-native-windows.mjs', 'conformance/f4/verify.mjs',
  'conformance/f4/native/windows-memory-oracle.c',
  'conformance/f5/README.md', 'conformance/f5/evidence.mjs',
  'conformance/f5/run-mock.mjs', 'conformance/f5/build-native-windows.mjs',
  'conformance/f5/run-native-windows.mjs', 'conformance/f5/verify.mjs',
  'conformance/f5/native/windows-launch-oracle.c',
  'conformance/f5/fixtures/vector-add.ptx.txt',
  'conformance/f6/README.md', 'conformance/f6/evidence.mjs',
  'conformance/f6/run-portable.mjs', 'conformance/f6/run-native-windows.mjs',
  'conformance/f6/run-linux-readiness.mjs', 'conformance/f6/verify.mjs',
  'conformance/f7/README.md', 'conformance/f7/evidence.mjs',
  'conformance/f7/property-cases.mjs', 'conformance/f7/property-cases.test.mjs',
  'conformance/f7/permission-probe.mjs', 'conformance/f7/run-portable.mjs',
  'conformance/f7/run-native-windows.mjs', 'conformance/f7/run-linux-readiness.mjs',
  'conformance/f7/verify.mjs',
  'conformance/f8/README.md', 'conformance/f8/evidence.mjs',
  'conformance/f8/fixtures/consumer-memory.mjs', 'conformance/f8/fixtures/consumer-compiler.mjs',
  'conformance/f8/fixtures/consumer-native-windows.mjs',
  'conformance/f8/run-portable.mjs', 'conformance/f8/run-native-windows.mjs',
  'conformance/f8/run-linux-readiness.mjs', 'conformance/f8/verify.mjs',
  'conformance/f9/README.md', 'conformance/f9/evidence.mjs',
  'conformance/f9/fixtures/atomic-publication.cu.txt',
  'conformance/f9/run-linux-readiness.mjs', 'conformance/f9/run-native-windows.mjs', 'conformance/f9/verify.mjs',
  'conformance/hardware/README.md', 'conformance/hardware/registry.json',
  'conformance/hardware/profiles.json', 'conformance/hardware/extensions.json',
  'conformance/hardware/qualification.mjs', 'conformance/hardware/qualification.test.mjs',
  'conformance/hardware/hyperv-readiness.mjs',
  'conformance/node/README.md', 'conformance/node/registry.json',
  'conformance/node/qualification.mjs', 'conformance/node/qualification.test.mjs',
  'schemas/cuda-runtime-ir.schema.json', 'schemas/cuda-13.3/provenance.json',
  'schemas/cuda-13.3/tier-0/selection.json', 'schemas/cuda-13.3/tier-0/semantic-overlay.json',
  'schemas/cuda-13.3/linux-x64/generated/header-facts.json',
  'schemas/cuda-13.3/linux-x64/generated/native-layouts.json',
  'schemas/cuda-13.3/linux-x64/generated/runtime-ir.json',
  'schemas/cuda-13.3/linux-x64/generated/coverage-report.json',
  'schemas/cuda-13.3/linux-x64/generated/semantic-diff.json',
  'schemas/cuda-13.3/linux-x64/generated/conformance-fixture.json',
  'schemas/cuda-13.3/linux-x64/generated/compatibility-manifest.json',
  'schemas/cuda-13.3/linux-x64/generated/ffi-definitions.mjs',
  'schemas/cuda-13.3/linux-x64/generated/packers.mjs',
  'schemas/cuda-13.3/linux-x64/generated/types.d.ts',
  'schemas/cuda-13.3/linux-x64/generated/native-abi-probe.c',
  'schemas/cuda-13.3/linux-x64/generated/product-manifest.json',
  'schemas/cuda-13.3/win-x64/compatibility-manifest.json',
  'schemas/cuda-13.3/win-x64/compiler-provider-manifest.json',
  'packaging/compatibility-manifest.json',
  'tests/README.md', 'tools/README.md', 'packaging/README.md', 'third_party/README.md',
  'tools/cuda-schema/README.md', 'tools/cuda-schema/component.yaml',
  'tools/cuda-schema/src/pipeline.mjs',
  '.github/CODEOWNERS', '.github/FUNDING.yml', '.github/pull_request_template.md', '.github/ISSUE_TEMPLATE/config.yml',
  '.github/ISSUE_TEMPLATE/bug-report.yml', '.github/ISSUE_TEMPLATE/feature-request.yml', '.github/workflows/docs.yml',
  '.github/workflows/node-compatibility.yml',
  'scripts/verify-docs.sh', 'scripts/verify-docs.mjs', 'scripts/run-exp-000.mjs', 'scripts/run-f1b.mjs',
  'scripts/run-exp-001.mjs', 'scripts/run-exp-012.mjs', 'scripts/run-f3.mjs', 'scripts/run-f4.mjs', 'scripts/run-f5.mjs', 'scripts/run-f6.mjs', 'scripts/run-f7.mjs', 'scripts/run-f8.mjs', 'scripts/run-f9.mjs', 'scripts/run-hardware-qualification.mjs',
  'scripts/run-hyperv-readiness.mjs', 'scripts/run-node-qualification.mjs',
  '.github/ISSUE_TEMPLATE/hardware-qualification.yml', '.github/ISSUE_TEMPLATE/node-qualification.yml',
];

for (const relative of required) {
  const target = path.join(root, relative);
  if (!existsSync(target) || (await stat(target)).size === 0) errors.push(`missing or empty required file: ${relative}`);
}

for (const relative of [
  'next_step.yaml',
  'docs/research/source-register.yaml',
  'docs/plans/2026-08-10-focus-branch-map.json',
  'experiments/exp-000/case-schema.json',
  'experiments/exp-000/generated/runtime-ir.json',
  'experiments/exp-001/profile.json',
  'schemas/cuda-runtime-ir.schema.json',
  'schemas/cuda-13.3/provenance.json',
  'schemas/cuda-13.3/tier-0/selection.json',
  'schemas/cuda-13.3/tier-0/semantic-overlay.json',
  'schemas/cuda-13.3/linux-x64/generated/header-facts.json',
  'schemas/cuda-13.3/linux-x64/generated/native-layouts.json',
  'schemas/cuda-13.3/linux-x64/generated/runtime-ir.json',
  'schemas/cuda-13.3/linux-x64/generated/coverage-report.json',
  'schemas/cuda-13.3/linux-x64/generated/semantic-diff.json',
  'schemas/cuda-13.3/linux-x64/generated/conformance-fixture.json',
  'schemas/cuda-13.3/linux-x64/generated/compatibility-manifest.json',
  'schemas/cuda-13.3/linux-x64/generated/product-manifest.json',
  'schemas/cuda-13.3/win-x64/compatibility-manifest.json',
  'tools/cuda-schema/component.yaml',
  'components/resource-registry/component.yaml',
  'components/driver-actor/component.yaml',
  'components/memory/component.yaml',
  'components/execution/component.yaml',
  'components/compiler-actor/component.yaml',
  'components/cuda-target/component.yaml',
  'components/device-js/component.yaml',
  'components/platform-diagnostics/component.yaml',
  'components/runtime-facade/component.yaml',
  'schemas/cuda-13.3/win-x64/compiler-provider-manifest.json',
  'packaging/compatibility-manifest.json',
  'conformance/hardware/registry.json',
  'conformance/hardware/profiles.json',
  'conformance/hardware/extensions.json',
  'conformance/node/registry.json',
  'package.json',
  'docs/capability-status.json',
]) {
  try {
    JSON.parse(await readFile(path.join(root, relative), 'utf8'));
  } catch (error) {
    errors.push(`${relative}: invalid JSON: ${error.message}`);
  }
}

try {
  const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const packageLock = JSON.parse(await readFile(path.join(root, 'package-lock.json'), 'utf8'));
  const compatibility = JSON.parse(await readFile(path.join(root, 'packaging/compatibility-manifest.json'), 'utf8'));
  const statusRegistry = JSON.parse(await readFile(path.join(root, 'docs/capability-status.json'), 'utf8'));
  const capabilityProjectionFiles = statusRegistry.policy?.capabilityProjectionFiles;
  const interopProjectionFiles = statusRegistry.policy?.interopProjectionFiles;
  if (packageJson.license !== 'AGPL-3.0-or-later') errors.push('package.json: license must be AGPL-3.0-or-later');
  if (compatibility.package.license !== packageJson.license) errors.push('packaging compatibility license differs from package.json');
  if (compatibility.schemaVersion !== 1) errors.push('packaging compatibility schemaVersion must remain 1');
  if (statusRegistry.schemaVersion !== 1) errors.push('docs/capability-status.json: schemaVersion must be 1');
  if (statusRegistry.policy?.statusSemanticsOwner !== 'agent_files/general_foundation/STATUS_SEMANTICS.md'
      || statusRegistry.policy?.shippedCompatibilityOwner !== 'packaging/compatibility-manifest.json') {
    errors.push('docs/capability-status.json: policy owners differ from the registered status/packaging boundaries');
  }
  if (JSON.stringify(capabilityProjectionFiles) !== JSON.stringify(['README.md', 'docs/CAPABILITIES.md'])
      || JSON.stringify(interopProjectionFiles) !== JSON.stringify(['README.md', 'docs/CAPABILITIES.md', 'docs/INTEROP_WITH_CUDA_MCGS.md'])) {
    errors.push('docs/capability-status.json: declared public projection file sets are incomplete or drifted');
  }
  if (compatibility.package.name !== packageJson.name || compatibility.package.version !== packageJson.version) {
    errors.push('packaging compatibility package name/version differs from package.json');
  }
  const lockRoot = packageLock.packages?.[''];
  if (packageLock.name !== packageJson.name || packageLock.version !== packageJson.version
      || lockRoot?.name !== packageJson.name || lockRoot?.version !== packageJson.version) {
    errors.push('package-lock root identity differs from package.json');
  }
  if (lockRoot?.license !== packageJson.license || lockRoot?.engines?.node !== packageJson.engines?.node) {
    errors.push('package-lock root license/Node engine differs from package.json');
  }
  if (compatibility.node.minimumVersion !== `v${String(packageJson.engines?.node ?? '').replace(/^>=/, '')}`) {
    errors.push('packaging compatibility minimum Node version differs from package.json engines.node');
  }
  const packageDependencies = JSON.stringify(packageJson.dependencies ?? {});
  if (JSON.stringify(lockRoot?.dependencies ?? {}) !== packageDependencies) errors.push('package-lock root dependencies differ from package.json');
  if (packageJson.dependencies?.acorn !== compatibility.capabilities.deviceJsParser?.version) {
    errors.push('packaging compatibility Acorn version differs from package.json');
  }
  if (packageLock.packages?.['node_modules/acorn']?.version !== packageJson.dependencies?.acorn) {
    errors.push('package-lock installed Acorn version differs from package.json');
  }
  const expectedEntries = Object.keys(packageJson.exports ?? {}).map((entry) => entry === '.' ? packageJson.name : `${packageJson.name}${entry.slice(1)}`);
  if (JSON.stringify(compatibility.publicApi.entries) !== JSON.stringify(expectedEntries)) {
    errors.push('packaging compatibility public API entries differ from package.json exports');
  }
  const forbiddenShippedProjectionKeys = ['exports', 'statusRecords', 'cudaMcgsInterop'];
  for (const key of forbiddenShippedProjectionKeys) {
    if (Object.hasOwn(compatibility, key) || Object.hasOwn(compatibility.publicApi ?? {}, key)) {
      errors.push(`packaging/compatibility-manifest.json: repository governance projection must not be shipped: ${key}`);
    }
  }
  if (/CUDA-MCGS|\bMCGS\b|semantic Device-JS program|domain oracle/i.test(JSON.stringify(compatibility))) {
    errors.push('packaging/compatibility-manifest.json: first-consumer identity must not enter shipped compatibility metadata');
  }
  if ((packageJson.files ?? []).some((entry) => entry === 'docs' || entry.startsWith('docs/'))) {
    errors.push('package.json: repository governance status must not be included in the shipped package file set');
  }
  const exportSources = {
    [packageJson.name]: 'components/runtime-facade/index.mjs',
    [`${packageJson.name}/compatibility`]: 'components/runtime-facade/compatibility.mjs',
    [`${packageJson.name}/testing`]: 'components/runtime-facade/testing.mjs',
  };
  const typeSources = {
    [packageJson.name]: 'components/runtime-facade/index.d.ts',
    [`${packageJson.name}/compatibility`]: 'components/runtime-facade/compatibility.d.ts',
    [`${packageJson.name}/testing`]: 'components/runtime-facade/testing.d.ts',
  };
  const typeExportDeclarations = {
    [packageJson.name]: {
      CUDA_JS_COMPATIBILITY: 'export const CUDA_JS_COMPATIBILITY: Readonly<Record<string, unknown>>;',
      CudaJsError: 'export class CudaJsError extends Error {',
      inspectCudaHost: 'export function inspectCudaHost(): Readonly<{ schemaVersion: 1; host: Readonly<Record<string, unknown>>; compatibility: typeof CUDA_JS_COMPATIBILITY }>;',
      openCudaRuntime: 'export function openCudaRuntime(options?: OpenCudaRuntimeOptions): Promise<CudaRuntime>;',
      compileDeviceProgram: 'export function compileDeviceProgram(runtime: CudaRuntime, request: DeviceJsCompileRequest): Promise<DeviceJsCompileResult>;',
    },
    [`${packageJson.name}/compatibility`]: {
      CUDA_JS_COMPATIBILITY: "export { CUDA_JS_COMPATIBILITY } from './index.mjs';",
    },
    [`${packageJson.name}/testing`]: {
      openCudaRuntimeForTesting: 'export function openCudaRuntimeForTesting(options?: OpenCudaRuntimeOptions): Promise<CudaRuntime>;',
    },
  };
  for (const entry of expectedEntries) {
    const relative = exportSources[entry];
    const typeRelative = typeSources[entry];
    const expected = [...(statusRegistry.publicApiExports?.[entry] ?? [])].sort();
    if (!relative || !typeRelative || expected.length === 0) {
      errors.push(`docs/capability-status.json: missing public export projection for ${entry}`);
      continue;
    }
    const packageExportKey = entry === packageJson.name ? '.' : `.${entry.slice(packageJson.name.length)}`;
    if (packageJson.exports?.[packageExportKey]?.import !== `./${relative}`) {
      errors.push(`package.json: ${entry} import target differs from the validated public module ${relative}`);
    }
    if (packageJson.exports?.[packageExportKey]?.types !== `./${typeRelative}`) {
      errors.push(`package.json: ${entry} type target differs from the validated public declarations ${typeRelative}`);
    }
    let declaredExports;
    try {
      declaredExports = moduleExportNames(await readFile(path.join(root, relative), 'utf8'), relative);
    } catch (error) {
      errors.push(error.message);
      continue;
    }
    if (JSON.stringify(declaredExports) !== JSON.stringify(expected)) {
      errors.push(`${relative}: declared public exports ${JSON.stringify(declaredExports)} differ from manifest ${JSON.stringify(expected)}`);
    }
    try {
      const namespaceExports = Object.keys(await import(pathToFileURL(path.join(root, relative)).href)).sort();
      if (JSON.stringify(namespaceExports) !== JSON.stringify(expected)) {
        errors.push(`${relative}: actual module namespace ${JSON.stringify(namespaceExports)} differs from manifest ${JSON.stringify(expected)}`);
      }
    } catch (error) {
      errors.push(`${relative}: public module namespace inspection failed: ${error.message}`);
    }
    const declarations = typeExportDeclarations[entry] ?? {};
    if (JSON.stringify(Object.keys(declarations).sort()) !== JSON.stringify(expected)) {
      errors.push(`${typeRelative}: declaration verifier does not exhaustively cover manifest exports ${JSON.stringify(expected)}`);
    }
    const typeSource = await readFile(path.join(root, typeRelative), 'utf8');
    let declaredTypeValues;
    try {
      declaredTypeValues = declaredValueExportNames(typeSource, typeRelative);
    } catch (error) {
      errors.push(error.message);
      continue;
    }
    if (JSON.stringify(declaredTypeValues) !== JSON.stringify(expected)) {
      errors.push(`${typeRelative}: exported value declarations ${JSON.stringify(declaredTypeValues)} differ from repository registry ${JSON.stringify(expected)}`);
    }
    for (const [name, declaration] of Object.entries(declarations)) {
      if (!hasExactExportedDeclaration(typeSource, declaration)) errors.push(`${typeRelative}: missing exact public declaration for ${name}`);
    }
  }
  const publicTypes = await readFile(path.join(root, 'components/runtime-facade/index.d.ts'), 'utf8');
  const parameterKinds = stringLiteralUnion(publicTypes, 'FunctionParameterKind');
  if (JSON.stringify(parameterKinds) !== JSON.stringify(compatibility.capabilities.functionParameters)) {
    errors.push('components/runtime-facade/index.d.ts: FunctionParameterKind differs from the compatibility manifest');
  }
  const publicInterfaceContracts = [
    ['DeviceCompileOptions', 'relocatableDeviceCode?: boolean;'],
    ['DeviceCompileRequest', `output?: ${compatibility.capabilities.compilerOutputFormats.map((format) => `'${format}'`).join(' | ')};`],
    ['CudaOperation', 'status(): Promise<CudaOperationStatus>;'],
    ['CudaOperation', 'wait(): Promise<CudaOperationStatus>;'],
    ['CudaOperation', 'close(): Promise<Readonly<Record<string, unknown>>>;'],
    ['CudaFunction', 'submit(options: CudaLaunchOptions): Promise<CudaOperation>;'],
    ['CudaFunction', 'launch(options: CudaLaunchOptions): Promise<Readonly<Record<string, unknown>>>;'],
  ];
  for (const [interfaceName, signature] of publicInterfaceContracts) {
    if (!hasExactInterfaceMember(publicTypes, interfaceName, signature)) {
      errors.push(`components/runtime-facade/index.d.ts: ${interfaceName} missing exact manifest-owned member: ${signature}`);
    }
  }
  const operationStates = stringLiteralUnion(publicTypes, 'CudaOperationState');
  if (JSON.stringify(operationStates) !== JSON.stringify(['pending', 'completed', 'failed', 'orphaned', 'closed'])) {
    errors.push('components/runtime-facade/index.d.ts: CudaOperationState differs from the accepted SPEC-0016 surface');
  }
  const parserOwners = [
    'components/device-js/src/translator.mjs',
    'components/device-js/src/strict-translator.mjs',
  ];
  for (const relative of parserOwners) {
    const source = await readFile(path.join(root, relative), 'utf8');
    if (!/from ['"]acorn['"]/.test(source) || !source.includes('acornVersion')) {
      errors.push(`${relative}: Device-JS parser implementation must consume the pinned Acorn version identity`);
    }
  }
  const expectedStatusIds = [
    'SPEC-0003-disposal-failure',
    'SPEC-0006-target-policy',
    'SPEC-0010-relocatable-device-code',
    'SPEC-0011-scalar-kernel-arguments',
    'SPEC-0012-device-lto',
    'SPEC-0013-restricted-device-js',
    'SPEC-0016-operation-lifecycle',
  ];
  if (JSON.stringify(statusRegistry.statusRecords?.map((record) => record.id)) !== JSON.stringify(expectedStatusIds)) {
    errors.push('docs/capability-status.json: statusRecords must contain the exact ordered accepted capability/correction set');
  }
  if (!exactStatusRecordsMatch(statusRegistry.statusRecords)) {
    errors.push('docs/capability-status.json: exact authority/status/profile/priority/public-surface/limit/issue matrix differs from accepted #67 reconciliation');
  }
  const architectureStatuses = new Set(['planned', 'deferred', 'unselected', 'rejected', 'not-applicable']);
  const implementationStatuses = new Set(['not-implemented', 'experimental', 'partial', 'implemented']);
  const qualificationStatuses = new Set(['not-qualified', 'testing-unconfirmed', 'qualified', 'known-incompatible', 'not-applicable']);
  const canonicalPriority = (value) => ['active', 'next', 'deferred'].includes(value) || /^(?:after|blocked):[^\s]+$/.test(value);
  const expectedIssues = new Map([
    ['SPEC-0003-disposal-failure', 66],
    ['SPEC-0006-target-policy', 65],
    ['SPEC-0010-relocatable-device-code', 35],
    ['SPEC-0011-scalar-kernel-arguments', null],
    ['SPEC-0012-device-lto', 42],
    ['SPEC-0013-restricted-device-js', 43],
    ['SPEC-0016-operation-lifecycle', 51],
  ]);
  for (const record of statusRegistry.statusRecords ?? []) {
    for (const field of ['id', 'label', 'architecturalDisposition', 'architectureContext', 'publicSurface', 'limit']) {
      if (typeof record[field] !== 'string' || record[field].trim() === '') errors.push(`docs/capability-status.json: ${record.id ?? '<unknown>'} missing ${field}`);
    }
    if (!expectedIssues.has(record.id) || record.issue !== expectedIssues.get(record.id)) errors.push(`docs/capability-status.json: ${record.id ?? '<unknown>'} has stale or invalid issue ownership`);
    if (!Array.isArray(record.authority) || record.authority.length === 0) errors.push(`docs/capability-status.json: ${record.id ?? '<unknown>'} has no authority paths`);
    for (const relative of record.authority ?? []) {
      if (!existsSync(path.join(root, relative))) errors.push(`docs/capability-status.json: ${record.id ?? '<unknown>'} missing authority path: ${relative}`);
    }
    if (!architectureStatuses.has(record.architecturalDisposition)) {
      errors.push(`docs/capability-status.json: ${record.id ?? '<unknown>'} has noncanonical architectural disposition`);
    }
    if (Object.hasOwn(record, 'implementationStatus') || !implementationStatuses.has(record.implementation?.status)
        || !['portable/software', 'portable/software/package'].includes(record.implementation?.profile)) {
      errors.push(`docs/capability-status.json: ${record.id ?? '<unknown>'} must state its exact implemented portable/package boundary`);
    }
    if (!qualificationStatuses.has(record.qualification?.status) || record.qualification.status !== 'not-qualified'
        || typeof record.qualification.profile !== 'string' || record.qualification.profile.trim() === '') {
      errors.push(`docs/capability-status.json: ${record.id ?? '<unknown>'} must state an exact not-qualified native profile`);
    }
    if (!canonicalPriority(record.priority?.status) || typeof record.priority?.context !== 'string' || record.priority.context.trim() === '') {
      errors.push(`docs/capability-status.json: ${record.id ?? '<unknown>'} must state a canonical priority plus separate context`);
    }
  }
  const implementedPortableIds = new Set([
    'SPEC-0010-relocatable-device-code',
    'SPEC-0011-scalar-kernel-arguments',
    'SPEC-0012-device-lto',
    'SPEC-0013-restricted-device-js',
    'SPEC-0016-operation-lifecycle',
  ]);
  for (const record of statusRegistry.statusRecords ?? []) {
    if (implementedPortableIds.has(record.id)
        && (record.implementation?.status !== 'implemented' || record.implementation?.profile !== 'portable/software/package')) {
      errors.push(`docs/capability-status.json: ${record.id} must remain implemented in portable/software/package paths`);
    }
  }
  const interop = statusRegistry.cudaMcgsInterop;
  if (!interop || interop.status !== 'compatible-pair-pending'
      || interop.productionAuthoringBoundary !== 'consumer-authored CUDA or PTX is not required'
      || interop.deletionTest !== 'required' || interop.compatiblePair !== 'pending') {
    errors.push('docs/capability-status.json: CUDA-MCGS interop projection is incomplete or drifted');
  }
  const requiredConsumerOwners = ['semantic Device-JS program', 'domain oracle', 'finite resource plan'];
  const requiredCudaJsOwners = ['Device-JS validation', 'CUDA C++ lowering', 'private generated CUDA', 'compilation and linking', 'artifact identity and cache', 'runtime execution and lifecycle'];
  if (JSON.stringify(interop?.externalConsumerOwns) !== JSON.stringify(requiredConsumerOwners)
      || JSON.stringify(interop?.cudaJsOwns) !== JSON.stringify(requiredCudaJsOwners)) {
    errors.push('docs/capability-status.json: CUDA-MCGS ownership projection differs from the accepted boundary');
  }
  const expectedCapabilityBlock = renderCapabilityStatus(statusRegistry.statusRecords ?? []);
  const expectedInteropBlock = renderCudaMcgsInterop(interop ?? {});
  for (const relative of capabilityProjectionFiles) {
    validateExactGeneratedBlock(relative, await readFile(path.join(root, relative), 'utf8'), capabilityBlockStart, capabilityBlockEnd, expectedCapabilityBlock);
  }
  for (const relative of interopProjectionFiles) {
    validateExactGeneratedBlock(relative, await readFile(path.join(root, relative), 'utf8'), interopBlockStart, interopBlockEnd, expectedInteropBlock);
  }
  const nextStep = JSON.parse(await readFile(path.join(root, 'next_step.yaml'), 'utf8'));
  const nextStepAuthority = new Set(nextStep.authority ?? []);
  for (const relative of nextStep.authority ?? []) {
    if (!existsSync(path.join(root, relative))) errors.push(`next_step.yaml: missing accepted authority path: ${relative}`);
    if (relative.startsWith('docs/specs/') || relative.startsWith('docs/decisions/')) {
      const authorityText = await readFile(path.join(root, relative), 'utf8');
      if (!/^\*\*Status:\*\* Accepted$/m.test(authorityText)) errors.push(`next_step.yaml: authority path is not accepted: ${relative}`);
    }
  }
  for (const record of statusRegistry.statusRecords ?? []) {
    for (const relative of record.authority ?? []) {
      if (!nextStepAuthority.has(relative)) errors.push(`next_step.yaml: missing docs/capability-status.json authority: ${relative}`);
    }
  }
  const planReferences = new Set([
    nextStep.current_focus?.plan,
    ...Object.values(nextStep.forward_lanes ?? {}),
  ].filter(Boolean));
  for (const relative of planReferences) {
    if (!existsSync(path.join(root, relative))) errors.push(`next_step.yaml: missing active plan path: ${relative}`);
  }
  const plansIndex = await readFile(path.join(root, 'docs/plans/README.md'), 'utf8');
  const activePlanStatuses = new Map();
  for (const relative of activePlanPaths) {
    if (!existsSync(path.join(root, relative))) {
      errors.push(`active plan registry: missing required plan: ${relative}`);
      continue;
    }
    const planText = await readFile(path.join(root, relative), 'utf8');
    activePlanStatuses.set(relative, planText.match(/^\*\*Status:\*\* ([^\r\n]+)$/m)?.[1] ?? null);
  }
  errors.push(...activePlanRegistryProblems(plansIndex, activePlanPaths, planReferences, activePlanStatuses));
  if (nextStep.current_focus?.id !== 'CJS-P0-DOCS-67' || !String(nextStep.current_focus?.exit ?? '').includes('CI')) {
    errors.push('next_step.yaml: current focus must retain the #67 public-documentation semantic-drift gate');
  }
  const license = await readFile(path.join(root, 'LICENSE'), 'utf8');
  if (!license.includes('GNU AFFERO GENERAL PUBLIC LICENSE') || !license.includes('END OF TERMS AND CONDITIONS')) errors.push('LICENSE: incomplete GNU AGPL text');
  const funding = await readFile(path.join(root, '.github/FUNDING.yml'), 'utf8');
  if (!/^github: \[iteathen\]$/m.test(funding)) errors.push('.github/FUNDING.yml: expected iteathen GitHub Sponsors entry');
} catch (error) {
  errors.push(`license/funding validation failed: ${error.message}`);
}

async function filesUnder(relative = '') {
  const absolute = path.join(root, relative);
  const output = [];
  for (const entry of await readdir(absolute, { withFileTypes: true })) {
    const child = path.join(relative, entry.name).replaceAll('\\', '/');
    if (entry.isDirectory()) {
      if ([...ignoredDirectories].some((ignored) => child === ignored || child.startsWith(`${ignored}/`))) continue;
      output.push(...await filesUnder(child));
    } else if (entry.isFile()) {
      output.push(child);
    }
  }
  return output;
}

const files = await filesUnder();
const markdown = files.filter((file) => file.endsWith('.md') && !file.startsWith('docs/archive/'));
for (const relative of markdown.filter((file) => file.startsWith('docs/'))) {
  const text = await readFile(path.join(root, relative), 'utf8');
  if (!/^\*\*Status:\*\* (Accepted|Proposal|Research Note|Informational|Superseded)$/m.test(text)) {
    errors.push(`missing recognized status marker: ${relative}`);
  }
}

const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
for (const relative of markdown) {
  const text = await readFile(path.join(root, relative), 'utf8');
  for (const match of text.matchAll(linkPattern)) {
    let target = match[1].trim();
    if (!target || /^(https?:\/\/|mailto:|#)/.test(target)) continue;
    target = target.split('#', 1)[0].split('?', 1)[0];
    if (!target) continue;
    const resolved = path.resolve(path.dirname(path.join(root, relative)), target);
    if (!resolved.startsWith(`${root}${path.sep}`) && resolved !== root) {
      errors.push(`${relative}: link escapes repository: ${target}`);
    } else if (!existsSync(resolved)) {
      errors.push(`${relative}: missing link target: ${target}`);
    }
  }
}

const staleNeedles = {
  'docs/decisions/ADR-0002-minimal-native-bootstrap-and-jit-call-surface.md': 'competing active ADR',
  'docs/assessments/': 'stale assessment path',
  'docs/research/2026-08-10-source-register.json': 'stale source register path',
  'EXP-0001-node-ffi-cuda-smoke.md': 'stale experiment path',
  'EXP-0000-node-ffi-synthetic-abi.md': 'stale experiment id',
};
for (const relative of files.filter((file) =>
  /\.(md|json|ya?ml|mjs|js)$/.test(file) && file !== 'scripts/verify-docs.mjs')) {
  const text = await readFile(path.join(root, relative), 'utf8');
  for (const [needle, label] of Object.entries(staleNeedles)) {
    if (text.includes(needle)) errors.push(`${relative}: ${label}: ${needle}`);
  }
}

const activePublicSurfaces = [
  'README.md',
  'CONTRIBUTING.md',
  'docs/README.md',
  'docs/CAPABILITIES.md',
  'docs/FOUNDATION_INDEX.md',
  'docs/HARDWARE_SUPPORT.md',
  'docs/NODE_SUPPORT.md',
  'docs/INTEROP_WITH_CUDA_MCGS.md',
  'docs/architecture/V0_SUPPORT_MATRIX.md',
  'components/runtime-facade/README.md',
  'conformance/f8/README.md',
  'packaging/README.md',
];
const implementedStatusIds = ['SPEC-0010', 'SPEC-0011', 'SPEC-0012', 'SPEC-0013', 'SPEC-0016'];
const genericStalePublicClaims = [
  [/\bDevice LTO is planned\b/i, 'Device LTO is implemented in portable/software/package paths'],
  [/\bdevice LTO is not yet an accepted production capability\b/i, 'Device LTO is accepted and portably implemented'],
  [/\bcompiled or source device modules and complete cache inputs\b/i, 'the production Device-JS interop boundary no longer requires consumer-authored CUDA/PTX'],
  [/\bCUDA-MCGS[^\n]*publishes a generated runtime package containing\b/i, 'the CUDA-MCGS interop boundary is the manifest-owned Device-JS deletion test'],
];
for (const relative of activePublicSurfaces) {
  const text = await readFile(path.join(root, relative), 'utf8');
  for (const [pattern, replacement] of genericStalePublicClaims) {
    if (pattern.test(text)) errors.push(`${relative}: stale public claim; ${replacement}: ${pattern}`);
  }
  for (const id of implementedStatusIds) {
    const staleStatus = new RegExp(`${id}[^|.;\\n]{0,120}\\b(?:planned(?:-only)?|unimplemented|not[- ]implemented|future-only|future idea)\\b`, 'i');
    if (staleStatus.test(text)) errors.push(`${relative}: ${id} is implemented in portable/software/package paths but is described with a stale implementation status`);
  }
}

const supportFacingSurfaces = [
  'README.md',
  'docs/CAPABILITIES.md',
  'docs/HARDWARE_SUPPORT.md',
  'docs/NODE_SUPPORT.md',
  'docs/INTEROP_WITH_CUDA_MCGS.md',
  'docs/architecture/V0_SUPPORT_MATRIX.md',
];
const legacyNoSupport = /\bno-support\b|\*\*no support\*\*|\|\s*no support\s*\|/i;
for (const relative of supportFacingSurfaces) {
  const text = await readFile(path.join(root, relative), 'utf8');
  if (legacyNoSupport.test(text)) {
    errors.push(`${relative}: legacy no-support status is forbidden in active support-facing surfaces; use an explicit qualification status/profile`);
  }
}

for (const relative of ['experiments/EXP-014-operation-lifecycle.md', 'experiments/exp-014/README.md']) {
  const text = await readFile(path.join(root, relative), 'utf8');
  if (!/^\*\*Status:\*\* Retained bounded experiment\b/m.test(text)) {
    errors.push(`${relative}: EXP-014 must be identified as retained evidence, not an active promotion work package`);
  }
  for (const needle of ['SPEC-0016 is now accepted', 'implementation is integrated', 'exclusively owns production']) {
    if (!text.includes(needle)) errors.push(`${relative}: missing retained EXP-014 authority marker: ${needle}`);
  }
  if (!/does not authorize (?:or redefine )?production (?:behavior|implementation)/i.test(text)) {
    errors.push(`${relative}: retained EXP-014 must not authorize production promotion`);
  }
  if (/^## Promotion$/m.test(text)
      || (/then begin the bounded production integration work package/i.test(text)
        && (!/^## Historical promotion disposition$/m.test(text) || !/That sequence is now complete\./i.test(text)))) {
    errors.push(`${relative}: stale active SPEC-0016 promotion instruction remains`);
  }
}

{
  const relative = 'experiments/exp-009/README.md';
  const text = await readFile(path.join(root, relative), 'utf8');
  for (const needle of ['SPEC-0012 now exclusively owns', 'portable/software/package implementation is integrated', 'retained exact-provider/oracle evidence family']) {
    if (!text.includes(needle)) errors.push(`${relative}: missing current SPEC-0012 authority marker: ${needle}`);
  }
  if (/^## Planned LTO follow-up$/m.test(text)
      || /follow-up must not be implemented before a bounded public LTO artifact\/compatibility specification is accepted/i.test(text)) {
    errors.push(`${relative}: stale pre-acceptance Device-LTO implementation gate remains`);
  }
}

const markers = {
  'README.md': ['Node-FFI-first', 'EXP-000', 'CJS-F1B', 'CJS-F2W', 'Windows x64'],
  'STATUS.md': ['Node 26.7.0', 'Windows x64', 'Linux x86-64', 'CJS-F1B', 'CJS-F2W', 'CJS-F7W', 'DriverActor'],
  'AGENTS.md': ['Node-FFI-first', 'fast-jit-required', 'EXP-000', 'EXP-001', 'EXP-012', 'CJS-F1B', 'active implementation phase'],
  'docs/FOUNDATION_INDEX.md': ['active implementation phase', 'agent_files/SYSTEM_REGISTRY.md', 'PROJECT_CHARTER.md'],
  'agent_files/SYSTEM_REGISTRY.md': ['experiment.exp-000', 'runtime.driver-actor', 'interop.cuda-mcgs'],
  'agent_files/AI_RULES.md': ['EXP-000', 'Apply token use as backpressure', 'Organize the repository as though it is already large'],
  'docs/plans/2026-08-10-master-plan.md': ['CJS-F0', 'CJS-F9', 'EXP-011'],
  'experiments/EXPERIMENT_MATRIX.md': ['EXP-000', 'EXP-001', 'EXP-011', 'EXP-012', 'Node FFI'],
  'next_step.yaml': ['CJS-F0', 'CJS-F1A', 'ADR-0002-node-ffi-first-host-binding.md'],
  'docs/specs/SPEC-0001-cuda-schema-compiler.md': ['CJS-F1B', 'fail-closed', 'native C layout probes'],
  'docs/specs/SPEC-0002-windows-driver-bootstrap.md': ['CJS-F2W', 'EXP-012', 'Deferred Linux path'],
  'docs/specs/SPEC-0003-driver-actor-resource-lifecycle.md': ['CJS-F3', 'runtime.driver-actor', 'runtime.resource-registry', 'Unexpected Worker loss'],
  'docs/specs/SPEC-0004-device-memory-foundation.md': ['CJS-F4', 'runtime.memory', 'device-memory', 'Native Windows'],
  'docs/specs/SPEC-0005-module-launch-completion.md': ['CJS-F5', 'runtime.execution', 'cuLaunchKernelEx', 'restart-required'],
  'docs/specs/SPEC-0006-compiler-linker-cache.md': ['CJS-F6', 'runtime.compiler-actor', 'nvJitLink', '--modify-stack-limit=false'],
  'docs/specs/SPEC-0007-windows-platform-hardening.md': ['CJS-F7', 'runtime.platform-diagnostics', 'wddm-watchdog', 'Linux ARM64'],
  'docs/specs/SPEC-0008-package-public-facade.md': ['CJS-F8', 'runtime.facade', 'first-consumer-deletion', 'EXP-010', 'EXP-011'],
  'schemas/README.md': ['cuda-runtime-ir.schema.json', 'cuda-13.3/tier-0/', 'generated/'],
};
for (const [relative, values] of Object.entries(markers)) {
  const text = await readFile(path.join(root, relative), 'utf8');
  for (const value of values) if (!text.includes(value)) errors.push(`${relative} missing required architecture marker: ${value}`);
}

for (const relative of files) {
  const extension = path.extname(relative).toLowerCase();
  if (extension === '.py' || extension === '.pyc') errors.push(`prohibited source type: ${relative}`);
  if (['.node', '.ptx', '.cubin', '.fatbin', '.ltoir', '.so', '.dll', '.dylib', '.a', '.lib', '.o', '.obj', '.exe'].includes(extension)) {
    errors.push(`native/generated binary must remain in ignored build storage: ${relative}`);
  }
  if (['.c', '.h'].includes(extension)
      && !relative.startsWith('experiments/exp-000/generated/')
      && !relative.startsWith('experiments/exp-001/generated/')
      && !relative.startsWith('experiments/exp-012/generated/')
      && !relative.startsWith('conformance/f4/native/')
      && !relative.startsWith('conformance/f5/native/')
      && !relative.startsWith('experiments/exp-009/native/')
      && relative !== 'schemas/cuda-13.3/linux-x64/generated/native-abi-probe.c') {
    errors.push(`C source is outside a registered generated-source boundary: ${relative}`);
  }
  if (['.cc', '.cpp', '.cxx', '.hh', '.hpp', '.ts', '.tsx', '.rs'].includes(extension)
      && relative !== 'schemas/cuda-13.3/linux-x64/generated/types.d.ts'
      && !relative.startsWith('components/runtime-facade/')) {
    errors.push(`source type is outside a currently registered implementation boundary: ${relative}`);
  }
  if (['.js', '.mjs', '.cjs'].includes(extension)
      && !relative.startsWith('experiments/exp-000/')
      && !relative.startsWith('experiments/exp-001/')
      && !relative.startsWith('experiments/exp-012/')
      && !relative.startsWith('experiments/exp-009/')
      && !relative.startsWith('experiments/exp-013/')
      && !relative.startsWith('experiments/exp-014/')
      && !relative.startsWith('components/resource-registry/')
      && !relative.startsWith('components/driver-actor/')
      && !relative.startsWith('components/memory/')
      && !relative.startsWith('components/execution/')
      && !relative.startsWith('components/compiler-actor/')
      && !relative.startsWith('components/cuda-target/')
      && !relative.startsWith('components/device-js/')
      && !relative.startsWith('components/platform-diagnostics/')
      && !relative.startsWith('components/runtime-facade/')
      && !relative.startsWith('conformance/f3/')
      && !relative.startsWith('conformance/f4/')
      && !relative.startsWith('conformance/f5/')
      && !relative.startsWith('conformance/f6/')
      && !relative.startsWith('conformance/f7/')
      && !relative.startsWith('conformance/f8/')
      && !relative.startsWith('conformance/f9/')
      && !relative.startsWith('conformance/hardware/')
      && !relative.startsWith('conformance/node/')
      && !relative.startsWith('scripts/')
      && !relative.startsWith('tools/cuda-schema/')
      && !relative.startsWith('schemas/cuda-13.3/linux-x64/generated/')) {
    errors.push(`JavaScript source is outside an authorized accepted-or-named-experiment boundary: ${relative}`);
  }
}

const workflows = files.filter((file) => file.startsWith('.github/workflows/')).sort();
if (JSON.stringify(workflows) !== JSON.stringify(['.github/workflows/docs.yml', '.github/workflows/node-compatibility.yml'])) {
  errors.push(`unexpected workflow set in the accepted Windows and exact-Node qualification phase: ${JSON.stringify(workflows)}`);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('CUDA-JS documentation, links, structured data, authority, source boundaries including accepted SPEC-0013 Device-JS, owner-authorized EXP-013 and retained EXP-014, exact Node matrix, extended qualification profiles, promoted EXP-000/EXP-009, accepted F1B/F2W/F3W/F4W/F5W/F6W/F7W/F8W plus the F9 CUDA-JS prerequisite, and retained Linux native handoff checks passed');
