const widths = {
  i8: 1,
  u8: 1,
  i16: 2,
  u16: 2,
  i32: 4,
  u32: 4,
  i64: 8,
  u64: 8,
  f32: 4,
  f64: 8,
  size: 8,
  intptr: 8,
  uintptr: 8,
  handle: 8,
  pointer: 8,
};

export function typeWidth(type) {
  if (!(type in widths)) throw new Error(`Unsupported packer type: ${type}`);
  return widths[type];
}

function assertRange(buffer, offset, type) {
  const width = typeWidth(type);
  if (!Number.isInteger(offset) || offset < 0 || offset + width > buffer.length) {
    throw new RangeError(`Out-of-bounds ${type} access at byte ${offset} in ${buffer.length}-byte storage.`);
  }
}

export function writeScalar(buffer, offset, type, value) {
  assertRange(buffer, offset, type);
  switch (type) {
    case 'i8': buffer.writeInt8(Number(value), offset); break;
    case 'u8': buffer.writeUInt8(Number(value), offset); break;
    case 'i16': buffer.writeInt16LE(Number(value), offset); break;
    case 'u16': buffer.writeUInt16LE(Number(value), offset); break;
    case 'i32': buffer.writeInt32LE(Number(value), offset); break;
    case 'u32': buffer.writeUInt32LE(Number(value), offset); break;
    case 'i64':
    case 'intptr': buffer.writeBigInt64LE(BigInt(value), offset); break;
    case 'u64':
    case 'size':
    case 'uintptr':
    case 'handle':
    case 'pointer': buffer.writeBigUInt64LE(BigInt(value), offset); break;
    case 'f32': buffer.writeFloatLE(Number(value), offset); break;
    case 'f64': buffer.writeDoubleLE(Number(value), offset); break;
    default: throw new Error(`Unsupported scalar write type: ${type}`);
  }
  return buffer;
}

export function readScalar(buffer, offset, type) {
  assertRange(buffer, offset, type);
  switch (type) {
    case 'i8': return buffer.readInt8(offset);
    case 'u8': return buffer.readUInt8(offset);
    case 'i16': return buffer.readInt16LE(offset);
    case 'u16': return buffer.readUInt16LE(offset);
    case 'i32': return buffer.readInt32LE(offset);
    case 'u32': return buffer.readUInt32LE(offset);
    case 'i64':
    case 'intptr': return buffer.readBigInt64LE(offset);
    case 'u64':
    case 'size':
    case 'uintptr':
    case 'handle':
    case 'pointer': return buffer.readBigUInt64LE(offset);
    case 'f32': return buffer.readFloatLE(offset);
    case 'f64': return buffer.readDoubleLE(offset);
    default: throw new Error(`Unsupported scalar read type: ${type}`);
  }
}

export function packPointerTable(pointers) {
  const output = Buffer.alloc(pointers.length * 8);
  pointers.forEach((pointer, index) => writeScalar(output, index * 8, 'pointer', pointer));
  return output;
}

export function alignedBuffer(size, alignment, getRawPointer) {
  if (!Number.isInteger(alignment) || alignment <= 0 || (alignment & (alignment - 1)) !== 0) {
    throw new RangeError(`Alignment must be a positive power of two: ${alignment}`);
  }
  const owner = Buffer.alloc(size + alignment - 1);
  const pointer = getRawPointer(owner);
  const adjustment = Number((BigInt(alignment) - (pointer % BigInt(alignment))) % BigInt(alignment));
  const view = owner.subarray(adjustment, adjustment + size);
  if (getRawPointer(view) % BigInt(alignment) !== 0n) throw new Error('Failed to create aligned byte storage.');
  return { owner, view };
}

export function packLayout(ir, layoutName, values, options = {}) {
  const layout = ir.layouts[layoutName];
  if (!layout) throw new Error(`Unknown layout: ${layoutName}`);
  const buffer = options.buffer ?? Buffer.alloc(layout.size);
  if (buffer.length < layout.size) throw new RangeError(`Storage for ${layoutName} is too small.`);

  for (const field of layout.fields) {
    const value = values[field.name];
    if (field.type in widths) {
      writeScalar(buffer, field.offset, field.type, value);
    } else if (field.type === 'simple') {
      const nested = packLayout(ir, 'simple', value);
      nested.copy(buffer, field.offset);
    } else if (field.type === 'u32[3]') {
      if (!Array.isArray(value) || value.length !== 3) throw new TypeError(`${layoutName}.${field.name} requires three values.`);
      value.forEach((item, index) => writeScalar(buffer, field.offset + index * 4, 'u32', item));
    } else if (field.type === 'union16') {
      if (!value || !['i64', 'f64', 'bytes'].includes(value.kind)) throw new TypeError('union16 requires an explicit discriminated value.');
      if (value.kind === 'bytes') {
        const bytes = Buffer.from(value.value);
        if (bytes.length > 16) throw new RangeError('union16 byte payload exceeds 16 bytes.');
        bytes.copy(buffer, field.offset);
      } else {
        writeScalar(buffer, field.offset, value.kind, value.value);
      }
    } else {
      throw new Error(`Unsupported layout field type: ${field.type}`);
    }
  }
  return buffer;
}
