import ffi from 'node:ffi';

const libraryPath = process.argv[2];
try {
  const library = new ffi.DynamicLibrary(libraryPath);
  const fn = library.getFunction('cjs_zero_i32', { arguments: [], return: 'i32' });
  const value = fn();
  library.close();
  console.log(JSON.stringify({ ok: true, value }));
} catch (error) {
  console.log(JSON.stringify({ ok: false, name: error.name, code: error.code ?? null, message: error.message }));
}
