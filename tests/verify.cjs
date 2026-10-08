const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const htmlPath = path.resolve(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
vm.runInThisContext(html.match(/<script id="theory-engine">([\s\S]*?)<\/script>/)[1]);
const G = globalThis.GuideTones;
for (const match of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
const notes = n => [n.root,n.third,n.seventh];
assert.deepEqual(notes(G.chord('1:dom7')), ['D♭','F','C♭']);
assert.deepEqual(notes(G.chord('0:dim7')), ['C','E♭','B𝄫']);
assert.deepEqual(notes(G.chord('6:maj7','sharps')), ['F♯','A♯','E♯']);
assert.deepEqual(notes(G.chord('1:min7','flats')), ['D♭','F♭','C♭']);
assert.deepEqual(notes(G.chord('8:augMaj7','sharps')), ['G♯','B♯','F𝄪']);
const pitches={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const offsets={'':0,'♭':-1,'♯':1,'𝄫':-2,'𝄪':2};
function pc(note) { return (pitches[note[0]] + offsets[note.slice(1)] + 12)%12; }
for (const spelling of ['flats','sharps']) for (const id of G.ALL) {
  const c=G.chord(id,spelling);
  assert.equal(pc(c.root),c.pc);
  assert.equal(pc(c.third),c.thirdPc);
  assert.equal(pc(c.seventh),c.seventhPc);
  const letter='CDEFGAB'.indexOf(c.root[0]);
  assert.equal(c.third[0],'CDEFGAB'[(letter+2)%7]);
  assert.equal(c.seventh[0],'CDEFGAB'[(letter+6)%7]);
}
const now=1800000000000;
for (const [rating,minutes] of [['again',1],['hard',6],['good',10],['easy',5760]]) assert.equal(G.schedule(null,rating,now).due,now+minutes*G.MINUTE);
let card=G.schedule(null,'good',now);
assert.equal(card.state,'learning');
card=G.schedule(card,'good',card.due);
assert.equal(card.state,'review');assert.equal(card.interval,1);
card=G.schedule(card,'good',card.due);assert.equal(card.interval,3);
const lapse=G.schedule(card,'again',now);assert.equal(lapse.state,'learning');assert.equal(lapse.lapses,1);assert.equal(lapse.due,now+G.MINUTE);
const intervals=['hard','good','easy'].map(r=>G.schedule(card,r,now).due);assert(intervals[0]<intervals[1]&&intervals[1]<intervals[2]);
for(let i=0;i<100;i++)card=G.schedule(card,'again',now);assert(card.ease>=1.3);
assert.equal(G.pick(['0:dom7'],{'0:dom7':{due:now+100}},'review',[],now),null);
assert.equal(G.pick(['0:dom7','1:dom7'],{'0:dom7':{due:now-100}},'review',[],now),'0:dom7');
assert.equal(G.pick(['0:dom7','1:dom7'],{},'drill',['0:dom7'],now),'1:dom7');
assert.equal(G.pick(['0:dom7'],{},'drill',['0:dom7'],now),'0:dom7');
assert.deepEqual(G.validate(G.defaults()),G.defaults());
const legacy=G.defaults();delete legacy.settings.keyDisplay;delete legacy.settings.previewAnswers;delete legacy.settings.showRootBeforeReveal;legacy.cards['1:dom7']=G.schedule(null,'good',now);
const migrated=G.validate(legacy);assert.equal(migrated.settings.keyDisplay,'highlights');assert.equal(migrated.settings.previewAnswers,true);assert.equal(migrated.settings.showRootBeforeReveal,true);assert.deepEqual(migrated.cards,legacy.cards);
const custom=G.defaults();custom.settings.keyDisplay='dots';custom.settings.previewAnswers=false;custom.settings.showRootBeforeReveal=false;assert.deepEqual(G.validate(custom).settings,custom.settings);
assert.throws(()=>G.validate({...G.defaults(),settings:{...G.defaults().settings,keyDisplay:'bad'}}));
assert.throws(()=>G.validate({...G.defaults(),settings:{...G.defaults().settings,previewAnswers:'false'}}));
assert.throws(()=>G.validate({...G.defaults(),settings:{...G.defaults().settings,showRootBeforeReveal:'false'}}));
assert.throws(()=>G.validate({...G.defaults(),pool:[]}));
assert.throws(()=>G.validate({...G.defaults(),cards:{'0:dom7':{}}}));
assert.throws(()=>G.validate({...G.defaults(),settings:{...G.defaults().settings,pace:0}}));
console.log('PASS: 192 chord spellings, scheduling transitions, interval order, due selection and backup validation');


{
const legacy=G.defaults();delete legacy.settings.rootKeyDisplay;delete legacy.settings.toneKeyDisplay;legacy.settings.keyDisplay='tags-below';
const migrated=G.validate(legacy);assert.equal(migrated.settings.rootKeyDisplay,null);assert.equal(migrated.settings.toneKeyDisplay,null);
assert.equal(G.keyStyle(migrated.settings,'root'),'tags-below');assert.equal(G.keyStyle(migrated.settings,'third'),'tags-below');
for(const root of G.DISPLAY_STYLES)for(const tone of G.DISPLAY_STYLES){
  const data=G.defaults();data.settings.rootKeyDisplay=root;data.settings.toneKeyDisplay=tone;
  data.cards['1:dom7']=G.schedule(null,'good',1800000000000);data.history=[{id:'1:dom7',rating:'good',at:1800000000000}];
  const restored=G.validate(JSON.parse(JSON.stringify(data)));assert.deepEqual(restored,data);
  assert.equal(G.keyStyle(restored.settings,'root'),root);assert.equal(G.keyStyle(restored.settings,'third'),tone);assert.equal(G.keyStyle(restored.settings,'seventh'),tone);
}
for(const field of ['rootKeyDisplay','toneKeyDisplay']){const data=G.defaults();data.settings[field]='invalid';assert.throws(()=>G.validate(data));}
assert.equal((html.match(/class="display-choice"/g)||[]).length,21);assert(!html.includes('id="keyDisplay"'));assert(!html.match(/\]-role|\)-role/));
console.log('PASS: all 49 split-style settings retain progress, old preferences migrate to Both, invalid settings rejected, and 21 choices replace the dropdown.');

}

{
assert.equal(G.defaults().pool.length,36);
assert.deepEqual([...new Set(G.defaults().pool.map(id=>G.parse(id).q.id))],['dom7','maj7','min7']);
for(const type of ['dim7','halfDim7']){assert.equal(G.ALL.filter(id=>G.parse(id).q.id===type).length,12);assert(!G.defaults().pool.some(id=>G.parse(id).q.id===type));}
assert.deepEqual([G.chord('0:dim7').third,G.chord('0:dim7').seventh],['E♭','B𝄫']);
assert.deepEqual([G.chord('0:halfDim7').third,G.chord('0:halfDim7').seventh],['E♭','B♭']);
assert.equal(G.chord('0:halfDim7').q.fifth,6);assert.equal(G.chord('0:dim7').q.seventh,9);
for(const keyDisplay of ['highlights','dots','outlines','bands','tags-above','labels','tags-below']){
  const data=G.defaults();data.settings.keyDisplay=keyDisplay;data.pool=['0:dim7','0:halfDim7'];data.cards['0:dim7']=G.schedule(null,'good',1800000000000);
  assert.deepEqual(G.validate(JSON.parse(JSON.stringify(data))),data);
}
console.log('PASS: 7 display settings round-trip with progress, 24 optional dim/half-dim cards, correct notes, and exactly 36 default cards.');

}
