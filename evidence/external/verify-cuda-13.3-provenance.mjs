import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const provenance=JSON.parse(fs.readFileSync(new URL('../../schemas/cuda-13.3/provenance.json',import.meta.url),'utf8'));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'cuda-js-nvidia-provenance-'));
const deb=path.join(tmp,provenance.package.fileName);
const extracted=path.join(tmp,'extracted');

function sha256File(file){
  const hash=crypto.createHash('sha256');
  hash.update(fs.readFileSync(file));
  return hash.digest('hex');
}
function assertHash(label,actual,expected){
  if(actual!==expected) throw new Error(`${label} SHA-256 mismatch: expected ${expected}, got ${actual}`);
}

try{
  const response=await fetch(provenance.package.url,{redirect:'follow'});
  if(!response.ok) throw new Error(`NVIDIA package fetch failed: ${response.status} ${response.statusText}`);
  await pipeline(Readable.fromWeb(response.body),fs.createWriteStream(deb));

  const packageSha256=sha256File(deb);
  assertHash('package',packageSha256,provenance.package.sha256);

  const unpack=spawnSync('dpkg-deb',['-x',deb,extracted],{encoding:'utf8'});
  if(unpack.status!==0) throw new Error(`dpkg-deb failed: ${unpack.stderr||unpack.stdout}`);

  const inputs={};
  for(const [key,value] of Object.entries(provenance.inputs)){
    if(!key.endsWith('Path')) continue;
    const prefix=key.slice(0,-4);
    const hashKey=prefix+'Sha256';
    const expected=provenance.inputs[hashKey];
    if(!expected) continue;
    const file=path.join(extracted,value);
    if(!fs.existsSync(file)) throw new Error(`${key} missing from official package: ${value}`);
    const actual=sha256File(file);
    assertHash(prefix,actual,expected);
    inputs[prefix]={path:value,sha256:actual,matched:true};
  }

  const report={
    schema:'cuda-js-external-nvidia-provenance-v1',
    evidenceClass:'REFERENCE-GROUNDED',
    sourceRevision:process.env.CJS_SOURCE_REVISION??process.env.GITHUB_SHA??null,
    externalAuthority:{
      vendor:'NVIDIA',
      packageUrl:provenance.package.url,
      toolkitRelease:provenance.toolkitRelease,
      packageName:provenance.package.name,
      packageVersion:provenance.package.version,
      architecture:provenance.package.architecture
    },
    package:{fileName:provenance.package.fileName,sha256:packageSha256,matched:true},
    inputs,
    disposition:'PASS',
    interpretation:'The committed CUDA-JS provenance hashes match bytes reacquired from the recorded official NVIDIA CUDA package. This validates source identity/provenance only; it does not validate CUDA-JS runtime behavior or GPU support.'
  };
  const output=process.argv[2]??'cuda-13.3-nvidia-provenance-result.json';
  fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({schema:report.schema,evidenceClass:report.evidenceClass,disposition:report.disposition,sourceRevision:report.sourceRevision,packageSha256,inputs,output}));
} finally {
  fs.rmSync(tmp,{recursive:true,force:true});
}
