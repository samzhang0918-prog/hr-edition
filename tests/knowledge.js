// HR 知识锦囊映射测试：node tests/knowledge.js
// 覆盖：每个激励手段 / 风波 / 画像都挂载了知识卡，引用的卡片 id 全部存在，URI 格式正确
const path = require('path');
const dir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '..');
const K = require(path.join(dir, 'knowledge.js'));
const D = require(path.join(dir, 'game-data.js'));
let pass = 0, fail = 0;
const ok = (n, c, d) => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'} ${n}${d ? ' - ' + d : ''}`); };

const noAct = D.MONTHLY_ACTIONS.filter(a => K.forAction(a.id).length === 0).map(a => a.id);
ok('8 项激励手段都挂了知识卡', noAct.length === 0, noAct.join(','));
const noEvt = D.EMERGENCY_EVENTS.filter(e => K.forEvent(e.id).length === 0).map(e => e.id);
ok('8 个职场风波都挂了知识卡', noEvt.length === 0, noEvt.join(','));
const noProf = D.MANAGEMENT_PROFILES.filter(p => K.forProfile(p.id).length === 0).map(p => p.id);
ok('5 种老板画像都有复盘必读', noProf.length === 0, noProf.join(','));
const refs = [...Object.values(K.ACTION_MAP), ...Object.values(K.EVENT_MAP), ...Object.values(K.PROFILE_MAP)].flat();
const dangling = refs.filter(id => !K.CARDS[id]);
ok('所有引用的卡片 id 都存在', dangling.length === 0, dangling.join(','));
const badUri = Object.keys(K.CARDS).map(K.getCard).filter(c => !c.uri.startsWith('obsidian://open?vault=') || c.path.includes('..'));
ok('Obsidian URI 格式正确且无 ../ 残留', badUri.length === 0, badUri.map(c => c.id).join(','));
console.log(`${pass}/${pass + fail} 通过`);
process.exit(fail ? 1 : 0);
