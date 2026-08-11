import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export async function sha256(filePath) {
  const hash = createHash('sha256');
  hash.update(await readFile(filePath));
  return hash.digest('hex');
}
export function parseLayoutProbe(text) {
  const output = { target: {}, layouts: {}, functions: {} };
  for (const line of text.trim().split(/\r?\n/)) {
    const fields = line.split('\t');
    if (fields[0] === 'PROFILE') {
      output.target[fields[1]] = fields[1] === 'littleEndian' ? fields[2] === '1' : Number(fields[2]);
    } else if (fields[0] === 'TYPE') {
      output.layouts[fields[1]] = { size: Number(fields[2]), alignment: Number(fields[3]), fields: {} };
    } else if (fields[0] === 'FIELD') {
      output.layouts[fields[1]].fields[fields[2]] = Number(fields[3]);
    } else if (fields[0] === 'FUNCTION') {
      output.functions[fields[1]] = { nativeSymbol: fields[2], pointerSize: Number(fields[3]) };
    } else {
      throw new Error(`Unexpected ABI probe line: ${line}`);
    }
  }
  return output;
}

export function parseOracle(text) {
  const cuda = {
    invalidInitFlagsStatus: null,
    initStatus: null,
    driverVersion: null,
    deviceCount: null,
    device: null,
    attributes: {},
    errors: {},
    procAddress: { entries: [], negatives: {} },
    context: {},
  };
  for (const line of text.trim().split(/\r?\n/)) {
    const fields = line.split('\t');
    switch (fields[0]) {
      case 'VALUE':
        cuda[fields[1]] = Number(fields[2]);
        break;
      case 'DRIVER':
        cuda.driverVersion = { status: Number(fields[1]), value: Number(fields[2]) };
        break;
      case 'DEVICE_COUNT':
        cuda.deviceCount = { status: Number(fields[1]), value: Number(fields[2]) };
        break;
      case 'DEVICE':
        cuda.device = { status: Number(fields[1]), ordinal: Number(fields[2]), value: Number(fields[3]) };
        break;
      case 'ATTR':
        cuda.attributes[fields[1]] = { status: Number(fields[2]), value: Number(fields[3]) };
        break;
      case 'ERROR':
        cuda.errors[fields[1]] = { status: Number(fields[2]), value: fields.slice(3).join('\t') };
        break;
      case 'PROC':
        cuda.procAddress.entries.push({
          publicName: fields[1],
          nativeSymbol: fields[2],
          result: Number(fields[3]),
          status: Number(fields[4]),
          nonzero: fields[5] === '1',
          namedExportAvailable: fields[6] === '1',
          matchesNamedExport: fields[7] === '1',
        });
        break;
      case 'NEG':
        cuda.procAddress.negatives[fields[1]] = {
          result: Number(fields[2]),
          status: Number(fields[3]),
          nonzero: fields[4] === '1',
        };
        break;
      case 'CONTEXT':
        cuda.context[fields[1]] = { status: Number(fields[2]), value: fields[3] === '1' };
        break;
      default:
        throw new Error(`Unexpected oracle line: ${line}`);
    }
  }
  return { cuda };
}
