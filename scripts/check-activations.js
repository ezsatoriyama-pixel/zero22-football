/**
 * Zero22 Activation Monitor
 * Reads activation-queue.json, finds unnotified pending items,
 * marks them as notified, and outputs notification text for the cron agent.
 * 
 * Output: one line per new item: NOTIFY:<phone>:<maskedPhone>
 * If none: NONE
 */

const fs = require('fs');
const path = require('path');

const QUEUE_PATH = path.join(__dirname, '..', 'data', 'activation-queue.json');

function main() {
  if (!fs.existsSync(QUEUE_PATH)) {
    console.log('NONE');
    return;
  }

  const raw = fs.readFileSync(QUEUE_PATH, 'utf8');
  const data = JSON.parse(raw);
  const pending = data.pending || [];
  
  const newItems = pending.filter((x) => !x.notified);
  
  if (newItems.length === 0) {
    console.log('NONE');
    return;
  }

  // Mark as notified
  newItems.forEach((x) => { x.notified = true; });
  if (!data.notified) data.notified = [];
  newItems.forEach((x) => { data.notified.push(x.id); });
  
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(data, null, 2), 'utf8');

  // Output notification lines
  newItems.forEach((x) => {
    console.log(`NOTIFY:${x.phone}:${x.maskedPhone}`);
  });
}

main();
