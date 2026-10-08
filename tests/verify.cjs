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

{
assert.equal(G.ROOTLESS_ALL.length,72);
assert.equal(new Set(G.ROOTLESS_ALL).size,72);
const examples={
  '0:maj7:A':[52,55,59,62], '0:maj7:B':[59,62,64,67],
  '0:min7:A':[51,55,58,62], '0:min7:B':[58,62,63,67],
  '0:dom7:A':[52,57,58,62], '0:dom7:B':[58,62,64,69]
};
for(const [id,expected] of Object.entries(examples))assert.deepEqual(G.voicing(id).notes.map(n=>n.midi),expected,id);
for(const spelling of ['flats','sharps'])for(const id of G.ROOTLESS_ALL){
  const c=G.voicing(id,spelling),notes=c.notes;
  assert.equal(notes.length,4);
  const third=c.q.id==='min7'?'m3':'3',seventh=c.q.id==='maj7'?'7':'m7',color=c.q.id==='dom7'?'13':'5';
  assert.deepEqual(notes.map(n=>n.label),c.type==='A'?[third,color,seventh,'9']:[seventh,'9',third,color]);
  assert.equal(new Set(notes.map(n=>n.pc)).size,4);
  assert(notes.every(n=>n.pc!==c.pc));
  assert(notes[0].midi>=48&&notes[0].midi<60);
  assert(notes[3].midi-notes[0].midi<12);
  notes.forEach((n,i)=>{
    assert.equal(pc(n.name),n.pc);
    assert.equal(n.midi,(n.octave+1)*12+pitches[n.name[0]]+offsets[n.name.slice(1)],`${id}: written octave of ${n.name}`);
    assert.equal(n.name[0],'CDEFGAB'[('CDEFGAB'.indexOf(c.root[0])+n.degree-1)%7]);
    assert(n.midi>=G.KEYBOARD_START&&n.midi<G.KEYBOARD_END);
    if(i)assert(n.midi>notes[i-1].midi);
  });
}
assert.deepEqual(G.voicing('1:dom7:A').notes.map(n=>n.name+n.octave),['F3','B♭3','C♭4','E♭4']);
assert.deepEqual(G.voicing('6:min7:A').notes.map(n=>n.name+n.octave),['B𝄫3','D♭4','F♭4','A♭4']);
for(const id of ['0:dom7','0:dim7:A','0:min7:C'])assert.throws(()=>G.voicing(id));

const old=G.defaults();delete old.rootless;delete old.settings.lesson;
old.pool=['0:dom7','1:min7'];old.cards['0:dom7']=G.schedule(null,'easy',now);old.history=[{id:'0:dom7',at:now,rating:'easy'}];
const migrated=G.validate(old);
assert.equal(migrated.settings.lesson,'guide');
for(const field of ['pool','cards','history'])assert.deepEqual(migrated[field],old[field]);
assert.deepEqual(migrated.rootless,{pool:G.ROOTLESS_ALL,cards:{},history:[]});
migrated.settings.lesson='rootless';migrated.rootless.pool=['0:dom7:A','0:dom7:B'];
migrated.rootless.cards['0:dom7:A']=G.schedule(null,'again',now);
migrated.rootless.cards['0:dom7:B']=G.schedule(null,'good',now);
migrated.rootless.history=[{id:'0:dom7:A',at:now,rating:'again'},{id:'0:dom7:B',at:now,rating:'good'}];
assert.deepEqual(G.validate(JSON.parse(JSON.stringify(migrated))),migrated);
assert.equal(migrated.cards['0:dom7'].lastRating,'easy');
assert.equal(migrated.rootless.cards['0:dom7:A'].lastRating,'again');
assert.equal(migrated.rootless.cards['0:dom7:B'].lastRating,'good');
assert.equal(G.pick(migrated.rootless.pool,migrated.rootless.cards,'review',[],now+G.MINUTE),'0:dom7:A');
for(const invalid of [null,{}, {pool:[],cards:{},history:[]}, {pool:['0:dom7'],cards:{},history:[]}, {pool:['0:dom7:A'],cards:{'0:dom7':old.cards['0:dom7']},history:[]}, {pool:['0:dom7:A'],cards:{},history:old.history}])assert.throws(()=>G.validate({...G.defaults(),rootless:invalid}));
assert.throws(()=>G.validate({...G.defaults(),settings:{...G.defaults().settings,lesson:'invalid'}}));
console.log('PASS: 72 A/B voicings in both spellings, ascending registers and enharmonic octaves, legacy migration, independent decks, and rootless backup validation.');
}

{
assert.equal(G.KEYBOARD_START,36);assert.equal(G.KEYBOARD_END,72);
const selected=['1:dom7:A','1:dom7:B','7:min7:B'];
assert.deepEqual(G.withVoicingType(selected,'A'),['1:dom7:A','7:min7:A']);
assert.deepEqual(G.withVoicingType(selected,'B'),['1:dom7:B','7:min7:B']);
assert.deepEqual(G.withVoicingType(G.withVoicingType(selected,'A'),'random'),['1:dom7:A','1:dom7:B','7:min7:A','7:min7:B']);
assert.throws(()=>G.withVoicingType(selected,'invalid'));
const both=['0:dom7:A','0:dom7:B'],oneType=G.withVoicingType(G.ROOTLESS_ALL,'B');
for(const random of [()=>0,()=>.9]){
  assert.equal(G.parse(G.pickRootless(oneType,{},'drill',[],now,random)).type,'B');
}
assert.equal(G.pickRootless(both,{},'drill',[],now,()=>0),'0:dom7:A');
assert.equal(G.pickRootless(both,{},'drill',[],now,()=>.9),'0:dom7:B');
const due={'0:dom7:A':G.schedule(null,'again',now-G.MINUTE)};
assert.equal(G.pickRootless(both,due,'review',[],now,()=>.9),'0:dom7:A','Due A precedes a new B even when the random draw favors B');
const future={'0:dom7:A':G.schedule(null,'easy',now)};
assert.equal(G.pickRootless(both,future,'review',[],now,()=>0),'0:dom7:B','A scheduled for later cannot be drawn');
future['0:dom7:B']=G.schedule(null,'good',now);
assert.equal(G.pickRootless(both,future,'review',[],now,()=>0),null);
for(const type of ['A','B','random']){
  const data=G.defaults();data.settings.rootlessType=type;data.rootless.pool=G.withVoicingType(selected,type);
  data.rootless.cards['1:dom7:A']=G.schedule(null,'easy',now);data.rootless.cards['1:dom7:B']=G.schedule(null,'again',now);
  assert.deepEqual(G.validate(JSON.parse(JSON.stringify(data))),data);
}
const old=G.defaults();delete old.settings.rootlessType;old.rootless.pool=['1:dom7:B'];
assert.equal(G.validate(old).settings.rootlessType,'B');
old.rootless.pool=['1:dom7:A','7:min7:B'];assert.equal(G.validate(old).settings.rootlessType,'random');
assert.deepEqual(G.validate(old).rootless.pool,old.rootless.pool);
assert.throws(()=>G.validate({...G.defaults(),settings:{...G.defaults().settings,rootlessType:'invalid'}}));
console.log('PASS: C2–B4 covers every unchanged voicing; type controls preserve selected chords and reviews; Random chooses either eligible type and respects due dates.');
}
