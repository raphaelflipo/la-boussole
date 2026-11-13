import { readdirSync, existsSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
const root=process.cwd(), files=[], errors=[];
function walk(dir){for(const item of readdirSync(dir,{withFileTypes:true})){if(item.name==='.git'||item.name==='node_modules')continue;const file=join(dir,item.name);item.isDirectory()?walk(file):files.push(file);}}
walk(root);
for(const file of files){
 if(extname(file)==='.js'){
  try{execFileSync(process.execPath,['--check',file]);}catch(error){errors.push(file+': JS invalide');}
 }
 if(extname(file)!=='.html')continue;
 const source=readFileSync(file,'utf8'),name=file.slice(root.length+1);
 if(!/<main\b/i.test(source))errors.push(name+': élément main absent');
 if(!/http-equiv=["']Content-Security-Policy["']/i.test(source))errors.push(name+': politique CSP absente');
 if(/\son[a-z]+\s*=/i.test(source))errors.push(name+': gestionnaire événementiel inline');
 for(const m of source.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi)){
  const value=m[1];if(/^(?:https?:|mailto:|tel:|data:|blob:|#)/i.test(value))continue;
  const target=value.split(/[?#]/,1)[0];if(!target)continue;
  let path=target.startsWith('/')?join(root,target.slice(1)):resolve(dirname(file),target);
  if(!path.startsWith(root))continue;
  if(existsSync(path)&&statSync(path).isDirectory())path=join(path,'index.html');
  if(!existsSync(path))errors.push(name+': lien absent '+value);
 }
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log('Vérification réussie : '+files.filter(f=>f.endsWith('.html')).length+' pages HTML.');
