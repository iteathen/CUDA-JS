import ffi from 'node:ffi';

const driverPath = process.argv[2];
try {
  const library = new ffi.DynamicLibrary(driverPath);
  const cuInit = library.getFunction('cuInit', { arguments: ['u32'], return: 'i32' });
  const status = cuInit(0);
  library.close();
  console.log(JSON.stringify({ ok: true, status }));
} catch (error) {
  console.log(JSON.stringify({ ok: false, name: error.name, code: error.code ?? null, message: error.message }));
}
