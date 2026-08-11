export function expectedCaseResult(entry, oracle) {
  const oracleValue = oracle.cases[entry.id]?.value;
  if (entry.runner === 'direct') {
    if (['i64', 'u64', 'size', 'intptr', 'uintptr', 'handle'].includes(entry.returnType)) return String(entry.expected);
    return Number(entry.expected);
  }

  switch (entry.runner) {
    case 'pointer-input': return -123456789;
    case 'pointer-output': return { status: 0, value: '-9007199254740993' };
    case 'nullable-pointer': return { nullValue: 77, presentValue: 42 };
    case 'stable-pointer-output':
      return {
        status: 0,
        nonzero: true,
        checksum: (0x1122334455667788n ^ 0xffffffb3n).toString(),
      };
    case 'allocation-output':
      return {
        bytes: Array.from({ length: 32 }, (_, index) => (index * 17 + 3) & 0xff),
        liveDuring: '1',
      };
    case 'array-count': return '60';
    case 'array-of-pointers': return '60';
    case 'void-table-inout': return { status: 0, sum: '60' };
    case 'buffer-mutate': return { checksum: oracleValue, bytes: [91, 88, 89, 94, 95] };
    case 'offset-alignment':
      return { alignedStatus: 0, misalignedStatus: -2, boundsStatus: -1, value: '1234605616436508552' };
    case 'struct-simple': return { status: 0, checksum: oracleValue };
    case 'struct-nested': return oracleValue;
    case 'struct-tagged': return oracleValue;
    case 'struct-pointer': return (0x0123456789abcdefn ^ 4n ^ 0x8000000000000000n).toString();
    case 'struct-aligned16':
      return { status: 0, checksum: oracleValue, inputAligned: true, outputAligned: true };
    case 'resolver-only':
      return { pointerObserved: true, arbitraryPointerCallableAvailable: false, publicCallableConstructors: ['getRawPointer'] };
    case 'callback-same-thread':
      return { value: Number(oracleValue), invocations: 1, owner: 'ffi-worker-system-thread' };
    default: throw new Error(`No expected result owner for ${entry.id} (${entry.runner}).`);
  }
}
