// Usage: node scripts/sim.js
// Checks that index.html's script parses, then plays the game with uniform random choices
// to show how often each ending comes up and where runs end early.
const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const script = html.split("<script>")[1].split("</script>")[0];
new Function(script); // throws on a syntax error
const data = html.split("/* DATA-START */")[1].split("/* DATA-END */")[0];
const { newGame, choose, advance, EVENTS, ENDINGS, ENDING_IDS, bench } =
  new Function(data + "; return { newGame, choose, advance, EVENTS, ENDINGS, ENDING_IDS, bench };")();

const N = 200000, ends = {}, months = {}, sums = { cap: 0, water: 0, align: 0, boss: 0, gpu: 0, hype: 0 };
let finished = 0;
for (let n = 0; n < N; n++) {
  const g = newGame();
  do {
    const ev = EVENTS[g.cur];
    choose(g, Math.floor(Math.random() * ev.o.length));
    if (!g.out.t) throw new Error(`missing outcome text: ${ev.id}`);
  } while (advance(g));
  if (!ENDINGS[g.ending]) throw new Error("unknown ending " + g.ending);
  ends[g.ending] = (ends[g.ending] || 0) + 1;
  months[g.month] = (months[g.month] || 0) + 1;
  if (g.month === 12) { finished++; for (const k in sums) sums[k] += g.s[k]; }
}
const pct = v => ((v || 0) / N * 100).toFixed(1).padStart(5) + "%";
console.log("endings (random play):");
ENDING_IDS.forEach(id => console.log(`  ${pct(ends[id])}  ${ENDINGS[id].name}`));
console.log("run ended in month:");
Object.keys(months).sort((a, b) => a - b).forEach(m => console.log(`  M${String(m).padStart(2, "0")} ${pct(months[m])}`));
console.log("average stats of runs that reached month 12:");
for (const k in sums) console.log(`  ${k.padEnd(6)} ${(sums[k] / finished).toFixed(1)}`);
