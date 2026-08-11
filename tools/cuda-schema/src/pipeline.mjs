import { createHash } from 'node:crypto';
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const sourceFile = fileURLToPath(import.meta.url);
const sourceDirectory = path.dirname(sourceFile);
const repositoryRoot = path.resolve(sourceDirectory, '..', '..', '..');
const schemaRoot = path.join(repositoryRoot, 'schemas', 'cuda-13.3');
const tierRoot = path.join(schemaRoot, 'tier-0');
const generatedRoot = path.join(schemaRoot, 'linux-x64', 'generated');
const buildRoot = path.join(repositoryRoot, 'build', 'f1b');
const inputRoot = path.join(buildRoot, 'inputs');
const extractedRoot = path.join(buildRoot, 'extracted');
const nativeRoot = path.join(buildRoot, 'native');

const provenancePath = path.join(schemaRoot, 'provenance.json');
const selectionPath = path.join(tierRoot, 'selection.json');
const overlayPath = path.join(tierRoot, 'semantic-overlay.json');

const generatedProductNames = [
  'header-facts.json',
  'native-layouts.json',
  'runtime-ir.json',
  'coverage-report.json',
  'semantic-diff.json',
  'conformance-fixture.json',
  'compatibility-manifest.json',
  'ffi-definitions.mjs',
  'packers.mjs',
  'types.d.ts',
  'native-abi-probe.c',
];

function sha256Bytes(value) {
  return createHash('sha256').update(value).digest('hex');
}

function sha256File(filePath) {
  return sha256Bytes(readFileSync(filePath));
}

function sortedValue(value) {
  if (Array.isArray(value)) return value.map(sortedValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortedValue(value[key])]));
  }
  return value;
}

function jsonText(value) {
  return `${JSON.stringify(sortedValue(value), null, 2)}\n`;
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function exactSetDifference(left, right) {
  return [...left].filter((value) => !right.has(value)).sort();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertBuildOwned(targetPath) {
  const relative = path.relative(buildRoot, path.resolve(targetPath));
  assert(relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative), `Refusing build operation outside ${buildRoot}: ${targetPath}`);
}

function run(command, argumentsList, options = {}) {
  let outputDescriptor = null;
  let stdout = 'pipe';
  if (options.stdoutPath) {
    assertBuildOwned(options.stdoutPath);
    mkdirSync(path.dirname(options.stdoutPath), { recursive: true });
    outputDescriptor = openSync(options.stdoutPath, 'w');
    stdout = outputDescriptor;
  }
  const result = spawnSync(command, argumentsList, {
    cwd: options.cwd ?? repositoryRoot,
    encoding: 'utf8',
    maxBuffer: options.maxBuffer ?? 64 * 1024 * 1024,
    stdio: ['ignore', stdout, 'pipe'],
  });
  if (outputDescriptor !== null) closeSync(outputDescriptor);
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${argumentsList.join(' ')} failed with exit ${result.status}:\n${result.stderr ?? ''}`);
  }
  return result.stdout ?? '';
}

async function acquireAndExtract(provenance) {
  assert(process.platform === 'linux' && process.arch === 'x64', 'Native F1B generation requires Linux x64. Use npm run f1b:check for cross-platform static validation.');
  mkdirSync(inputRoot, { recursive: true });
  const packagePath = path.join(inputRoot, provenance.package.fileName);
  if (!existsSync(packagePath)) {
    const response = await fetch(provenance.package.url, { redirect: 'follow' });
    assert(response.ok, `Official CUDA package download failed: ${response.status} ${response.statusText}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    writeFileSync(packagePath, bytes);
  }
  assert(sha256File(packagePath) === provenance.package.sha256, `CUDA package hash mismatch: ${packagePath}`);

  assertBuildOwned(extractedRoot);
  rmSync(extractedRoot, { recursive: true, force: true });
  mkdirSync(extractedRoot, { recursive: true });
  run('dpkg-deb', ['-x', packagePath, extractedRoot]);

  const headerPath = path.join(extractedRoot, provenance.inputs.headerPath);
  const typedefHeaderPath = path.join(extractedRoot, provenance.inputs.typedefHeaderPath);
  const licensePath = path.join(extractedRoot, provenance.inputs.licensePath);
  assert(sha256File(headerPath) === provenance.inputs.headerSha256, 'Pinned cuda.h hash mismatch after extraction.');
  assert(sha256File(typedefHeaderPath) === provenance.inputs.typedefHeaderSha256, 'Pinned cudaTypedefs.h hash mismatch after extraction.');
  assert(sha256File(licensePath) === provenance.inputs.licenseSha256, 'Pinned CUDA package license hash mismatch after extraction.');

  const includeDirectory = path.dirname(headerPath);
  const clangVersion = run(provenance.compiler.command, ['--version']).split(/\r?\n/, 1)[0];
  assert(clangVersion === provenance.compiler.version, `Clang identity mismatch: expected ${provenance.compiler.version}, found ${clangVersion}`);
  return { packagePath, headerPath, typedefHeaderPath, licensePath, includeDirectory, clangVersion };
}

function compilerArguments(provenance, includeDirectory) {
  return [
    `--target=${provenance.compiler.target}`,
    '-x',
    'c',
    '-std=c11',
    `-I${includeDirectory}`,
    '-include',
    'cuda.h',
  ];
}

function emitRawCompilerFacts(provenance, sourcePaths) {
  const astPath = path.join(buildRoot, 'cuda-ast.json');
  run(provenance.compiler.command, [
    ...compilerArguments(provenance, sourcePaths.includeDirectory),
    '-Xclang',
    '-ast-dump=json',
    '-fsyntax-only',
    '/dev/null',
  ], { stdoutPath: astPath });

  const macroOutput = run(provenance.compiler.command, [
    ...compilerArguments(provenance, sourcePaths.includeDirectory),
    '-dM',
    '-E',
    '/dev/null',
  ]);
  return { ast: JSON.parse(readFileSync(astPath, 'utf8')), macroOutput };
}

function topLevelByKind(ast, kind) {
  return (ast.inner ?? []).filter((node) => node.kind === kind && node.name);
}

function uniqueNamedMap(nodes, label) {
  const result = new Map();
  for (const node of nodes) {
    if (!result.has(node.name)) result.set(node.name, node);
  }
  assert(result.size > 0, `Clang AST contained no ${label}.`);
  return result;
}

function parseSimpleMacros(output) {
  const macros = new Map();
  for (const line of output.split(/\r?\n/)) {
    const direct = line.match(/^#define\s+([A-Za-z_]\w*)\s+([A-Za-z_]\w*)$/);
    if (direct) {
      macros.set(direct[1], direct[2]);
      continue;
    }
    const streamSemanticAlias = line.match(/^#define\s+([A-Za-z_]\w*)\s+__CUDA_API_(?:PTDS|PTSZ)\(([A-Za-z_]\w*)\)$/);
    if (streamSemanticAlias) macros.set(streamSemanticAlias[1], streamSemanticAlias[2]);
  }
  return macros;
}

function firstIntegerValue(node) {
  if (typeof node?.value === 'string' && /^-?[0-9]+$/.test(node.value)) return node.value;
  for (const child of node?.inner ?? []) {
    const value = firstIntegerValue(child);
    if (value !== null) return value;
  }
  return null;
}

function tagFromCanonicalType(canonicalType) {
  const match = canonicalType.match(/^(enum|struct|union)\s+([A-Za-z_]\w*)/);
  return match ? { tagKind: match[1], tagName: match[2] } : null;
}

function normalizeClangTypeSpelling(value) {
  assert(typeof value === 'string' && value.length > 0, 'Clang type spelling is missing.');
  return value.replace(
    / at [^()]*[\\/](cuda(?:Typedefs)?\.h:\d+:\d+)/g,
    ' at $1',
  );
}

function deriveTypeFact(selectionEntry, typedefMap, enumMap, recordMap) {
  const declaration = typedefMap.get(selectionEntry.name);
  assert(declaration, `Selected typedef is absent from cuda.h AST: ${selectionEntry.name}`);
  const rawSourceType = declaration.type?.qualType;
  const rawCanonicalType = declaration.type?.desugaredQualType ?? rawSourceType;
  assert(rawSourceType && rawCanonicalType, `Selected typedef has no type identity: ${selectionEntry.name}`);
  const sourceType = normalizeClangTypeSpelling(rawSourceType);
  const canonicalType = normalizeClangTypeSpelling(rawCanonicalType);
  const tag = tagFromCanonicalType(canonicalType);

  let kind = 'scalar';
  if (canonicalType.includes('*')) kind = 'handle';
  else if (tag?.tagKind === 'enum') kind = 'enum';
  else if (tag?.tagKind === 'struct') kind = 'record';
  else if (tag?.tagKind === 'union') kind = 'union';

  const expectedMatches = selectionEntry.kind === kind || (selectionEntry.kind === 'record' && (kind === 'record' || kind === 'union'));
  assert(expectedMatches, `Selected type kind changed for ${selectionEntry.name}: expected ${selectionEntry.kind}, imported ${kind}`);

  const fact = {
    stableId: `cuda.driver.type.${selectionEntry.name}`,
    name: selectionEntry.name,
    kind,
    sourceType,
    canonicalType,
  };

  if (kind === 'enum') {
    const enumDeclaration = enumMap.get(tag.tagName);
    assert(enumDeclaration, `Enum declaration is absent for ${selectionEntry.name} (${tag.tagName}).`);
    let previousValue = -1n;
    fact.values = (enumDeclaration.inner ?? [])
      .filter((node) => node.kind === 'EnumConstantDecl')
      .map((node) => {
        const explicitValue = firstIntegerValue(node);
        const value = explicitValue === null ? previousValue + 1n : BigInt(explicitValue);
        previousValue = value;
        return { name: node.name, value: value.toString() };
      })
      .sort((left, right) => left.name.localeCompare(right.name));
    assert(fact.values.length > 0, `Enum ${selectionEntry.name} has no imported constants.`);
  }

  if (kind === 'record' || kind === 'union') {
    const recordDeclaration = recordMap.get(tag.tagName);
    assert(recordDeclaration?.completeDefinition, `Complete record declaration is absent for ${selectionEntry.name} (${tag.tagName}).`);
    fact.tagName = tag.tagName;
    fact.fields = (recordDeclaration.inner ?? [])
      .filter((node) => node.kind === 'FieldDecl')
      .map((node) => ({
        name: node.name,
        sourceType: node.type?.qualType ? normalizeClangTypeSpelling(node.type.qualType) : null,
      }))
      .map((entry) => {
        assert(entry.name && entry.sourceType, `Record field identity is incomplete for ${selectionEntry.name}.`);
        return entry;
      });
    assert(fact.fields.length > 0, `Record ${selectionEntry.name} has no imported fields.`);
  }
  return fact;
}

function returnTypeFromFunctionType(qualifiedType) {
  const index = qualifiedType.indexOf(' (');
  assert(index > 0, `Unable to split function type: ${qualifiedType}`);
  return qualifiedType.slice(0, index);
}

function deriveHeaderFacts(provenance, selection, sourcePaths, rawFacts) {
  const functionMap = uniqueNamedMap(topLevelByKind(rawFacts.ast, 'FunctionDecl'), 'functions');
  const typedefMap = uniqueNamedMap(topLevelByKind(rawFacts.ast, 'TypedefDecl'), 'typedefs');
  const enumMap = uniqueNamedMap(topLevelByKind(rawFacts.ast, 'EnumDecl'), 'enums');
  const recordMap = uniqueNamedMap(topLevelByKind(rawFacts.ast, 'RecordDecl'), 'records');
  const macros = parseSimpleMacros(rawFacts.macroOutput);

  const functions = {};
  for (const publicName of [...selection.functions].sort()) {
    const nativeSymbol = macros.get(publicName) ?? publicName;
    const declaration = functionMap.get(nativeSymbol);
    assert(declaration, `Selected CUDA function is absent after alias resolution: ${publicName} -> ${nativeSymbol}`);
    const parameters = (declaration.inner ?? [])
      .filter((node) => node.kind === 'ParmVarDecl')
      .map((node, index) => ({
        name: node.name || `parameter${index}`,
        sourceType: node.type?.qualType ? normalizeClangTypeSpelling(node.type.qualType) : null,
      }));
    assert(parameters.every((parameter) => parameter.sourceType), `Incomplete parameter type imported for ${publicName}.`);
    const returnSourceType = normalizeClangTypeSpelling(returnTypeFromFunctionType(declaration.type.qualType));
    const signature = { returnSourceType, parameters };
    functions[publicName] = {
      stableId: `cuda.driver.function.${publicName}`,
      publicName,
      nativeSymbol,
      returnSourceType,
      parameters,
      signatureSha256: sha256Bytes(jsonText(signature)),
      sourceLine: declaration.loc?.line ?? null,
    };
  }

  const types = {};
  for (const selectionEntry of [...selection.types].sort((left, right) => left.name.localeCompare(right.name))) {
    types[selectionEntry.name] = deriveTypeFact(selectionEntry, typedefMap, enumMap, recordMap);
  }

  const driverFunctions = [...functionMap.keys()].filter((name) => /^cu[A-Z]/.test(name)).sort();
  const selectedNativeSymbols = new Set(Object.values(functions).map((entry) => entry.nativeSymbol));
  return {
    schemaVersion: 1,
    id: `${selection.id}-header-facts`,
    source: {
      toolkitRelease: provenance.toolkitRelease,
      packageVersion: provenance.package.version,
      packageSha256: provenance.package.sha256,
      headerSha256: provenance.inputs.headerSha256,
      typedefHeaderSha256: provenance.inputs.typedefHeaderSha256,
      clangVersion: sourcePaths.clangVersion,
      clangTarget: provenance.compiler.target,
    },
    targetProfile: selection.targetProfile,
    functions,
    types,
    catalog: {
      driverFunctions,
      selectedNativeSymbols: [...selectedNativeSymbols].sort(),
      unselectedHeaderFunctions: driverFunctions.filter((name) => !selectedNativeSymbols.has(name)),
    },
  };
}

function cString(value) {
  return JSON.stringify(value);
}

function generateNativeProbe(headerFacts) {
  const lines = [
    '/* Generated by CUDA-JS CJS-F1B. Do not edit. */',
    '#include <cuda.h>',
    '#include <stddef.h>',
    '#include <stdint.h>',
    '#include <stdio.h>',
    '',
    'int main(void) {',
    '  uint16_t endian = 1;',
    '  printf("PROFILE\\tpointerSize\\t%zu\\n", sizeof(void*));',
    '  printf("PROFILE\\tsizeSize\\t%zu\\n", sizeof(size_t));',
    '  printf("PROFILE\\tlittleEndian\\t%u\\n", *((uint8_t*)&endian) == 1 ? 1u : 0u);',
  ];

  for (const typeFact of Object.values(headerFacts.types)) {
    lines.push(`  printf("TYPE\\t${typeFact.name}\\t%zu\\t%zu\\n", sizeof(${typeFact.name}), _Alignof(${typeFact.name}));`);
    for (const field of typeFact.fields ?? []) {
      lines.push(`  printf("FIELD\\t${typeFact.name}\\t${field.name}\\t%zu\\n", offsetof(${typeFact.name}, ${field.name}));`);
    }
  }
  for (const functionFact of Object.values(headerFacts.functions)) {
    lines.push(`  printf("FUNCTION\\t${functionFact.publicName}\\t${functionFact.nativeSymbol}\\t%zu\\n", sizeof(&${functionFact.nativeSymbol}));`);
  }
  lines.push('  return 0;', '}', '');
  return lines.join('\n');
}

function parseProbeOutput(output, headerFacts, selection) {
  const profile = {};
  const observedTypes = new Map();
  const observedFunctions = new Map();
  for (const line of output.trim().split(/\r?\n/)) {
    const fields = line.split('\t');
    if (fields[0] === 'PROFILE') profile[fields[1]] = Number(fields[2]);
    else if (fields[0] === 'TYPE') observedTypes.set(fields[1], { size: Number(fields[2]), alignment: Number(fields[3]), fields: {} });
    else if (fields[0] === 'FIELD') {
      const type = observedTypes.get(fields[1]);
      assert(type, `Native probe reported a field before its type: ${line}`);
      type.fields[fields[2]] = Number(fields[3]);
    } else if (fields[0] === 'FUNCTION') observedFunctions.set(fields[1], { nativeSymbol: fields[2], pointerSize: Number(fields[3]) });
    else throw new Error(`Unexpected native-probe record: ${line}`);
  }

  assert(profile.pointerSize * 8 === selection.targetProfile.pointerBits, 'Native pointer width disagrees with the target profile.');
  assert(profile.sizeSize * 8 === selection.targetProfile.sizeBits, 'Native size_t width disagrees with the target profile.');
  assert(profile.littleEndian === 1, 'Native byte order disagrees with the target profile.');

  const types = {};
  for (const fact of Object.values(headerFacts.types)) {
    const observed = observedTypes.get(fact.name);
    assert(observed && Number.isInteger(observed.size) && Number.isInteger(observed.alignment), `Native layout is missing for ${fact.name}.`);
    const fields = (fact.fields ?? []).map((field) => {
      const offset = observed.fields[field.name];
      assert(Number.isInteger(offset), `Native field offset is missing for ${fact.name}.${field.name}.`);
      return { name: field.name, sourceType: field.sourceType, offset };
    });
    types[fact.name] = { size: observed.size, alignment: observed.alignment, fields };
  }

  const functions = {};
  for (const fact of Object.values(headerFacts.functions)) {
    const observed = observedFunctions.get(fact.publicName);
    assert(observed?.nativeSymbol === fact.nativeSymbol, `Native symbol probe mismatch for ${fact.publicName}.`);
    assert(observed.pointerSize === profile.pointerSize, `Function-pointer size mismatch for ${fact.publicName}.`);
    functions[fact.publicName] = observed;
  }
  return {
    schemaVersion: 1,
    id: `${selection.id}-native-layouts`,
    targetProfile: selection.targetProfile,
    profile: {
      pointerSize: profile.pointerSize,
      sizeSize: profile.sizeSize,
      byteOrder: 'little-endian',
    },
    types,
    functions,
  };
}

function compileAndRunProbe(provenance, sourcePaths, headerFacts, probeSource) {
  assertBuildOwned(nativeRoot);
  rmSync(nativeRoot, { recursive: true, force: true });
  mkdirSync(nativeRoot, { recursive: true });
  const sourcePath = path.join(nativeRoot, 'native-abi-probe.c');
  const executablePath = path.join(nativeRoot, 'native-abi-probe');
  writeFileSync(sourcePath, probeSource);
  run(provenance.compiler.command, [
    `--target=${provenance.compiler.target}`,
    '-std=gnu11',
    `-I${sourcePaths.includeDirectory}`,
    '-Wall',
    '-Wextra',
    '-Werror',
    sourcePath,
    '-o',
    executablePath,
  ]);
  const output = run(executablePath, []);
  writeFileSync(path.join(nativeRoot, 'native-abi-probe.txt'), output);
  return output;
}

function normalizeTypeName(value) {
  return value
    .replace(/\b(const|volatile|restrict)\b/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*\*\s*/g, '*')
    .trim();
}

function scalarFfiType(canonicalType) {
  const normalized = normalizeTypeName(canonicalType);
  const mapping = new Map([
    ['char', 'i8'],
    ['signed char', 'i8'],
    ['unsigned char', 'u8'],
    ['short', 'i16'],
    ['short int', 'i16'],
    ['unsigned short', 'u16'],
    ['unsigned short int', 'u16'],
    ['int', 'i32'],
    ['unsigned int', 'u32'],
    ['long', 'i64'],
    ['long int', 'i64'],
    ['unsigned long', 'u64'],
    ['unsigned long int', 'u64'],
    ['long long', 'i64'],
    ['long long int', 'i64'],
    ['unsigned long long', 'u64'],
    ['unsigned long long int', 'u64'],
    ['float', 'f32'],
    ['double', 'f64'],
    ['void', 'void'],
  ]);
  return mapping.get(normalized) ?? null;
}

function ffiTypeFor(sourceType, typeFacts) {
  const normalized = normalizeTypeName(sourceType);
  if (normalized.includes('*')) return 'pointer';
  const selected = typeFacts[normalized];
  if (selected) {
    if (selected.kind === 'handle') return 'pointer';
    if (selected.kind === 'enum') return 'i32';
    if (selected.kind === 'record' || selected.kind === 'union') return 'pointer';
    const mapped = scalarFfiType(selected.canonicalType);
    assert(mapped, `Selected scalar type has no FFI mapping: ${normalized} -> ${selected.canonicalType}`);
    return mapped;
  }
  const mapped = scalarFfiType(normalized);
  assert(mapped, `Source type has no FFI mapping: ${sourceType}`);
  return mapped;
}

function validateSemanticOverlay(selection, headerFacts, overlay) {
  assert(
    ['accepted-f1b-private-experimental', 'accepted-f4w-private-experimental'].includes(overlay.reviewStatus),
    'Semantic overlay is not in an accepted private-experimental review state.',
  );
  const selectedFunctions = new Set(selection.functions);
  const overlayFunctions = new Set(Object.keys(overlay.functions ?? {}));
  const selectedTypes = new Set(selection.types.map((entry) => entry.name));
  const overlayTypes = new Set(Object.keys(overlay.types ?? {}));
  const functionMissing = exactSetDifference(selectedFunctions, overlayFunctions);
  const functionExtra = exactSetDifference(overlayFunctions, selectedFunctions);
  const typeMissing = exactSetDifference(selectedTypes, overlayTypes);
  const typeExtra = exactSetDifference(overlayTypes, selectedTypes);
  assert(functionMissing.length === 0 && functionExtra.length === 0, `Semantic function coverage mismatch; missing=${functionMissing.join(',')}; extra=${functionExtra.join(',')}`);
  assert(typeMissing.length === 0 && typeExtra.length === 0, `Semantic type coverage mismatch; missing=${typeMissing.join(',')}; extra=${typeExtra.join(',')}`);

  for (const publicName of selection.functions) {
    const imported = headerFacts.functions[publicName];
    const semantics = overlay.functions[publicName];
    for (const field of overlay.requiredFunctionFields) assert(field in semantics, `Semantic field ${field} is missing for ${publicName}.`);
    assert(semantics.stableId === imported.stableId, `Semantic stable ID mismatch for ${publicName}.`);
    assert(semantics.exposure !== 'public', `F1B cannot expose ${publicName} publicly.`);
    assert(semantics.parameters.length === imported.parameters.length, `Semantic parameter count mismatch for ${publicName}.`);
    for (let index = 0; index < imported.parameters.length; index++) {
      const sourceParameter = imported.parameters[index];
      const semanticParameter = semantics.parameters[index];
      for (const field of overlay.requiredParameterFields) assert(field in semanticParameter, `Semantic parameter field ${field} is missing for ${publicName}.${sourceParameter.name}.`);
      assert(semanticParameter.name === sourceParameter.name, `Semantic parameter order/name mismatch for ${publicName}: expected ${sourceParameter.name}, found ${semanticParameter.name}`);
    }
  }
  for (const typeName of selectedTypes) {
    const semantics = overlay.types[typeName];
    for (const field of ['representation', 'exposure', 'ownership', 'resourceKind', 'packerPolicy']) {
      assert(field in semantics, `Semantic type field ${field} is missing for ${typeName}.`);
    }
  }
}

function normalizedRuntimeIr(provenance, selection, overlay, headerFacts, targetLayouts) {
  validateSemanticOverlay(selection, headerFacts, overlay);
  const types = {};
  for (const [typeName, fact] of Object.entries(headerFacts.types)) {
    const nativeLayout = targetLayouts.types[typeName];
    types[typeName] = {
      stableId: fact.stableId,
      kind: fact.kind,
      sourceType: fact.sourceType,
      canonicalType: fact.canonicalType,
      ffiType: ffiTypeFor(typeName, headerFacts.types),
      semantics: overlay.types[typeName],
      layout: nativeLayout,
      ...(fact.values ? { values: fact.values } : {}),
    };
  }

  const functions = {};
  for (const [publicName, fact] of Object.entries(headerFacts.functions)) {
    const semantics = overlay.functions[publicName];
    functions[publicName] = {
      stableId: fact.stableId,
      publicName,
      nativeSymbol: fact.nativeSymbol,
      returnSourceType: fact.returnSourceType,
      returnFfiType: ffiTypeFor(fact.returnSourceType, headerFacts.types),
      parameters: fact.parameters.map((parameter, index) => ({
        name: parameter.name,
        sourceType: parameter.sourceType,
        ffiType: ffiTypeFor(parameter.sourceType, headerFacts.types),
        semantics: semantics.parameters[index],
      })),
      semantics: Object.fromEntries(Object.entries(semantics).filter(([key]) => !['stableId', 'parameters'].includes(key))),
      availability: 'private-experimental',
    };
  }

  const selectionSha256 = sha256File(selectionPath);
  const overlaySha256 = sha256File(overlayPath);
  const generatorSha256 = sha256File(sourceFile);
  const headerFactsSha256 = sha256Bytes(jsonText(headerFacts));
  const targetLayoutsSha256 = sha256Bytes(jsonText(targetLayouts));
  return {
    schemaVersion: 1,
    id: `${selection.id}-runtime-ir-v1`,
    identity: {
      toolkitRelease: provenance.toolkitRelease,
      packageVersion: provenance.package.version,
      packageSha256: provenance.package.sha256,
      headerSha256: provenance.inputs.headerSha256,
      licenseSha256: provenance.inputs.licenseSha256,
      selectionSha256,
      overlaySha256,
      generatorSha256,
      clangVersion: provenance.compiler.version,
      headerFactsSha256,
      targetLayoutsSha256,
    },
    target: selection.targetProfile,
    types,
    functions,
    coverage: {
      selectedFunctions: selection.functions.length,
      selectedTypes: selection.types.length,
      availableFunctions: Object.keys(functions).length,
      unresolvedSelected: [],
      unselectedHeaderFunctions: headerFacts.catalog.unselectedHeaderFunctions,
    },
  };
}

function generateFfiModule(runtimeIr) {
  const aliases = {};
  const definitions = {};
  for (const [publicName, fact] of Object.entries(runtimeIr.functions)) {
    aliases[publicName] = fact.nativeSymbol;
    definitions[fact.nativeSymbol] = {
      arguments: fact.parameters.map((parameter) => parameter.ffiType),
      return: fact.returnFfiType,
    };
  }
  return `/* Generated by CUDA-JS CJS-F1B. Private experimental metadata; do not edit. */\nexport const cudaTier0SymbolAliases = Object.freeze(${JSON.stringify(sortedValue(aliases), null, 2)});\n\nexport const cudaTier0FfiDefinitions = Object.freeze(${JSON.stringify(sortedValue(definitions), null, 2)});\n`;
}

function generatePackersModule(runtimeIr) {
  const layouts = Object.fromEntries(Object.entries(runtimeIr.types).map(([name, fact]) => [name, fact.layout]));
  return `/* Generated by CUDA-JS CJS-F1B. Private experimental packers; do not edit. */
import { Buffer } from 'node:buffer';

export const cudaTier0Layouts = Object.freeze(${JSON.stringify(sortedValue(layouts), null, 2)});

export function allocateCudaOut(typeName) {
  const layout = cudaTier0Layouts[typeName];
  if (!layout) throw new TypeError(\`Unknown generated CUDA out type: \${typeName}\`);
  return Buffer.alloc(layout.size);
}

export function readCudaI32Out(storage, offset = 0) {
  if (!Buffer.isBuffer(storage) || offset < 0 || offset + 4 > storage.length) throw new RangeError('Invalid generated i32 out storage.');
  return storage.readInt32LE(offset);
}

export function createDefaultCuCtxCreateParams() {
  const layout = cudaTier0Layouts.CUctxCreateParams;
  if (!layout) throw new Error('CUctxCreateParams layout is unavailable.');
  return Buffer.alloc(layout.size);
}
`;
}

function generateTypes(runtimeIr) {
  const functionNames = Object.keys(runtimeIr.functions).sort().map((name) => JSON.stringify(name)).join(' | ');
  const typeNames = Object.keys(runtimeIr.types).sort().map((name) => JSON.stringify(name)).join(' | ');
  return `/* Generated by CUDA-JS CJS-F1B. Private experimental metadata; do not edit. */
export type CudaTier0FunctionName = ${functionNames};
export type CudaTier0TypeName = ${typeNames};
export type CudaResultCode = number & { readonly __cudaResultCode: unique symbol };
export type CudaDeviceOrdinal = number & { readonly __cudaDeviceOrdinal: unique symbol };
export interface CudaTier0Identity {
  readonly toolkitRelease: ${JSON.stringify(runtimeIr.identity.toolkitRelease)};
  readonly packageVersion: ${JSON.stringify(runtimeIr.identity.packageVersion)};
  readonly target: ${JSON.stringify(runtimeIr.target.id)};
}
`;
}

function buildGeneratedProducts(provenance, selection, overlay, headerFacts, targetLayouts, probeSource) {
  const runtimeIr = normalizedRuntimeIr(provenance, selection, overlay, headerFacts, targetLayouts);
  const currentStableIds = [
    ...Object.values(runtimeIr.types).map((entry) => entry.stableId),
    ...Object.values(runtimeIr.functions).map((entry) => entry.stableId),
  ].sort();
  const previousStableIds = new Set(selection.previousStableIds ?? []);
  const currentStableSet = new Set(currentStableIds);
  const coverage = {
    schemaVersion: 1,
    selectionId: selection.id,
    selectedFunctionCount: selection.functions.length,
    selectedTypeCount: selection.types.length,
    availableFunctions: Object.keys(runtimeIr.functions).sort(),
    unresolvedSelected: [],
    unselectedHeaderFunctionCount: headerFacts.catalog.unselectedHeaderFunctions.length,
    unselectedHeaderFunctions: headerFacts.catalog.unselectedHeaderFunctions,
    defaultDisposition: 'cataloged-unavailable-not-in-tier-0-selection',
  };
  const semanticDiff = {
    schemaVersion: 1,
    selectionId: selection.id,
    baseline: selection.previousStableIds?.length ? 'selection.previousStableIds' : null,
    added: currentStableIds.filter((id) => !previousStableIds.has(id)),
    unchanged: currentStableIds.filter((id) => previousStableIds.has(id)),
    removed: [...previousStableIds].filter((id) => !currentStableSet.has(id)).sort(),
    unresolved: [],
  };
  const conformanceFixture = {
    schemaVersion: 1,
    id: `${selection.id}-conformance`,
    exactIdentity: runtimeIr.identity,
    expectedFunctions: Object.values(runtimeIr.functions).map((entry) => ({ publicName: entry.publicName, nativeSymbol: entry.nativeSymbol, returnFfiType: entry.returnFfiType, argumentFfiTypes: entry.parameters.map((parameter) => parameter.ffiType) })),
    expectedLayouts: Object.fromEntries(Object.entries(runtimeIr.types).map(([name, entry]) => [name, entry.layout])),
    mutationControls: ['size', 'alignment', 'field-offset', 'parameter-type', 'native-symbol', 'required-semantic-field'],
    claimLimits: ['no Driver execution', 'no GPU support', 'no public native capability', 'no Fast FFI dispatch claim'],
  };
  const compatibility = {
    schemaVersion: 1,
    id: `${selection.id}-compatibility`,
    status: 'private-experimental-schema-only',
    target: runtimeIr.target,
    toolkitRelease: provenance.toolkitRelease,
    packageVersion: provenance.package.version,
    exactIdentity: runtimeIr.identity,
    requires: { node: '26.7.0', ffiFlag: '--experimental-ffi' },
    runtimeSupportClaim: false,
  };

  const products = new Map([
    ['header-facts.json', jsonText(headerFacts)],
    ['native-layouts.json', jsonText(targetLayouts)],
    ['runtime-ir.json', jsonText(runtimeIr)],
    ['coverage-report.json', jsonText(coverage)],
    ['semantic-diff.json', jsonText(semanticDiff)],
    ['conformance-fixture.json', jsonText(conformanceFixture)],
    ['compatibility-manifest.json', jsonText(compatibility)],
    ['ffi-definitions.mjs', generateFfiModule(runtimeIr)],
    ['packers.mjs', generatePackersModule(runtimeIr)],
    ['types.d.ts', generateTypes(runtimeIr)],
    ['native-abi-probe.c', probeSource],
  ]);
  const productManifest = {
    schemaVersion: 1,
    id: `${selection.id}-products`,
    exactIdentity: runtimeIr.identity,
    products: Object.fromEntries([...products.entries()].map(([name, content]) => [name, { sha256: sha256Bytes(content), bytes: Buffer.byteLength(content) }])),
  };
  products.set('product-manifest.json', jsonText(productManifest));
  return products;
}

function writeOrCompareProducts(products, checkOnly) {
  mkdirSync(generatedRoot, { recursive: true });
  const mismatches = [];
  for (const [name, content] of products) {
    const targetPath = path.join(generatedRoot, name);
    if (checkOnly) {
      const existing = existsSync(targetPath) ? readFileSync(targetPath, 'utf8') : null;
      if (existing !== content) mismatches.push(name);
    } else {
      writeFileSync(targetPath, content);
      console.log(`generated ${path.relative(repositoryRoot, targetPath)}`);
    }
  }
  assert(mismatches.length === 0, `Generated F1B products are stale: ${mismatches.join(', ')}`);
}

function assertRuntimeAgainstFacts(runtimeIr, headerFacts, targetLayouts) {
  assert(runtimeIr.target.id === targetLayouts.targetProfile.id, 'Runtime IR target profile does not match native layouts.');
  for (const [name, type] of Object.entries(runtimeIr.types)) {
    const fact = headerFacts.types[name];
    const layout = targetLayouts.types[name];
    assert(fact && layout, `Runtime type has no source/native owner: ${name}`);
    assert(type.sourceType === fact.sourceType && type.canonicalType === fact.canonicalType, `Runtime source type mismatch: ${name}`);
    assert(type.layout.size === layout.size, `Runtime size mismatch: ${name}`);
    assert(type.layout.alignment === layout.alignment, `Runtime alignment mismatch: ${name}`);
    assert(type.layout.fields.length === layout.fields.length, `Runtime field-count mismatch: ${name}`);
    for (let index = 0; index < layout.fields.length; index++) {
      assert(type.layout.fields[index].name === layout.fields[index].name && type.layout.fields[index].offset === layout.fields[index].offset, `Runtime field-offset mismatch: ${name}.${layout.fields[index].name}`);
    }
  }
  for (const [name, fn] of Object.entries(runtimeIr.functions)) {
    const fact = headerFacts.functions[name];
    assert(fact, `Runtime function has no header fact: ${name}`);
    assert(fn.nativeSymbol === fact.nativeSymbol, `Runtime native symbol mismatch: ${name}`);
    assert(fn.returnSourceType === fact.returnSourceType, `Runtime return type mismatch: ${name}`);
    assert(fn.parameters.length === fact.parameters.length, `Runtime parameter count mismatch: ${name}`);
    for (let index = 0; index < fact.parameters.length; index++) {
      assert(fn.parameters[index].sourceType === fact.parameters[index].sourceType, `Runtime parameter type mismatch: ${name}.${fact.parameters[index].name}`);
      assert(fn.parameters[index].ffiType === ffiTypeFor(fact.parameters[index].sourceType, headerFacts.types), `Runtime parameter FFI mapping mismatch: ${name}.${fact.parameters[index].name}`);
    }
  }
}

function verifyProductManifest() {
  const manifestPath = path.join(generatedRoot, 'product-manifest.json');
  const manifest = readJson(manifestPath);
  for (const [name, identity] of Object.entries(manifest.products)) {
    const productPath = path.join(generatedRoot, name);
    assert(existsSync(productPath), `Generated product is missing: ${name}`);
    assert(sha256File(productPath) === identity.sha256, `Generated product hash mismatch: ${name}`);
    assert(statSync(productPath).size === identity.bytes, `Generated product size mismatch: ${name}`);
  }
  const unexpected = generatedProductNames.filter((name) => !(name in manifest.products));
  assert(unexpected.length === 0, `Generated product manifest is incomplete: ${unexpected.join(', ')}`);
}

function expectMutationRejected(label, mutate, validate) {
  let rejected = false;
  try {
    mutate();
    validate();
  } catch {
    rejected = true;
  }
  assert(rejected, `Mutation control was not detected: ${label}`);
}

function clone(value) {
  return structuredClone(value);
}

function staticCheck() {
  const provenance = readJson(provenancePath);
  const selection = readJson(selectionPath);
  const overlay = readJson(overlayPath);
  const headerFacts = readJson(path.join(generatedRoot, 'header-facts.json'));
  const targetLayouts = readJson(path.join(generatedRoot, 'native-layouts.json'));
  const runtimeIr = readJson(path.join(generatedRoot, 'runtime-ir.json'));
  const coverage = readJson(path.join(generatedRoot, 'coverage-report.json'));

  assert(runtimeIr.schemaVersion === 1 && runtimeIr.target.id === 'linux-x64-sysv', 'Runtime IR metaschema/target identity is invalid.');
  assert(runtimeIr.identity.packageSha256 === provenance.package.sha256, 'Runtime IR package identity is stale.');
  assert(runtimeIr.identity.headerSha256 === provenance.inputs.headerSha256, 'Runtime IR header identity is stale.');
  assert(runtimeIr.identity.selectionSha256 === sha256File(selectionPath), 'Runtime IR selection identity is stale.');
  assert(runtimeIr.identity.overlaySha256 === sha256File(overlayPath), 'Runtime IR overlay identity is stale.');
  assert(runtimeIr.identity.generatorSha256 === sha256File(sourceFile), 'Runtime IR generator identity is stale.');
  assert(!/ at (?:\/|[A-Za-z]:[\\/])/.test(JSON.stringify(headerFacts)), 'Generated header facts retain an absolute compiler input path.');
  validateSemanticOverlay(selection, headerFacts, overlay);
  assertRuntimeAgainstFacts(runtimeIr, headerFacts, targetLayouts);
  assert(coverage.unresolvedSelected.length === 0, 'Selected semantic coverage is unresolved.');
  assert(coverage.availableFunctions.length === selection.functions.length, 'Not every selected function is privately available.');
  assert(coverage.unselectedHeaderFunctionCount === coverage.unselectedHeaderFunctions.length, 'Unselected declaration coverage count is inconsistent.');
  verifyProductManifest();

  const firstType = Object.keys(runtimeIr.types)[0];
  const firstRecord = Object.keys(runtimeIr.types).find((name) => runtimeIr.types[name].layout.fields.length > 0);
  const firstFunction = Object.keys(runtimeIr.functions)[0];
  const firstParameterFunction = Object.keys(runtimeIr.functions).find((name) => runtimeIr.functions[name].parameters.length > 0);

  {
    const mutated = clone(runtimeIr);
    expectMutationRejected('size', () => { mutated.types[firstType].layout.size += 1; }, () => assertRuntimeAgainstFacts(mutated, headerFacts, targetLayouts));
  }
  {
    const mutated = clone(runtimeIr);
    expectMutationRejected('alignment', () => { mutated.types[firstType].layout.alignment += 1; }, () => assertRuntimeAgainstFacts(mutated, headerFacts, targetLayouts));
  }
  {
    const mutated = clone(runtimeIr);
    expectMutationRejected('field-offset', () => { mutated.types[firstRecord].layout.fields[0].offset += 1; }, () => assertRuntimeAgainstFacts(mutated, headerFacts, targetLayouts));
  }
  {
    const mutated = clone(runtimeIr);
    expectMutationRejected('parameter-type', () => { mutated.functions[firstParameterFunction].parameters[0].ffiType = mutated.functions[firstParameterFunction].parameters[0].ffiType === 'i32' ? 'u32' : 'i32'; }, () => assertRuntimeAgainstFacts(mutated, headerFacts, targetLayouts));
  }
  {
    const mutated = clone(runtimeIr);
    expectMutationRejected('native-symbol', () => { mutated.functions[firstFunction].nativeSymbol += '_mutated'; }, () => assertRuntimeAgainstFacts(mutated, headerFacts, targetLayouts));
  }
  {
    const mutated = clone(overlay);
    expectMutationRejected('required-semantic-field', () => { delete mutated.functions[firstFunction].cleanup; }, () => validateSemanticOverlay(selection, headerFacts, mutated));
  }

  console.log(`F1B static checks passed: ${selection.functions.length} functions, ${selection.types.length} types, ${coverage.unselectedHeaderFunctionCount} declarations fail closed, 6 mutation controls.`);
}

async function generateAll(checkOnly) {
  const provenance = readJson(provenancePath);
  const selection = readJson(selectionPath);
  const overlay = readJson(overlayPath);
  const sourcePaths = await acquireAndExtract(provenance);
  const rawFacts = emitRawCompilerFacts(provenance, sourcePaths);
  const headerFacts = deriveHeaderFacts(provenance, selection, sourcePaths, rawFacts);
  const probeSource = generateNativeProbe(headerFacts);
  const probeOutput = compileAndRunProbe(provenance, sourcePaths, headerFacts, probeSource);
  const targetLayouts = parseProbeOutput(probeOutput, headerFacts, selection);
  const products = buildGeneratedProducts(provenance, selection, overlay, headerFacts, targetLayouts, probeSource);
  writeOrCompareProducts(products, checkOnly);
}

export async function runF1bCommand(command) {
  if (command === 'generate') {
    await generateAll(false);
    staticCheck();
    return;
  }
  if (command === 'verify-native') {
    await generateAll(true);
    staticCheck();
    console.log('F1B native check-only regeneration matched committed products byte-for-byte.');
    return;
  }
  if (command === 'check') {
    staticCheck();
    return;
  }
  throw new Error(`Unknown F1B command: ${command}`);
}
