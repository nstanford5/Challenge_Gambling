import { loadStdlib } from "@reach-sh/stdlib";
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib({REACH_NO_WARN: 'Y'});
const MAX = 4;
const accA = await stdlib.newTestAccount(stdlib.parseCurrency(5000));
const ctcA = accA.contract(backend);

console.log('Welcome to the bet distributer');

const startPlayers = async () => {
  const runPlayer = async (who) => {
    const acc = await stdlib.newTestAccount(stdlib.parseCurrency(100));
    const ctc = acc.contract(backend, ctcA.getInfo());
    const bet = Math.floor(Math.random() * 100) + 10;
    const succ = await ctc.apis.Buyer.startGame(bet);
    console.log(`${who} added to the map is ${succ}`);
    const amt = await ctc.apis.Buyer.refund();
    console.log(`${who} is getting a refund of ${amt}`);
  }// end of runBuyers
  for(let i = 0; i < MAX; i++){
    await runPlayer(`Player`);
  }

}// end of startBuyers

await Promise.all([
  backend.Admin(ctcA, {
    cost: stdlib.parseCurrency(10),
    ready: (contract) => {
      console.log(`Ready at contract: ${contract}`);
      startPlayers();
    },
  }),
]);
console.log('Exiting...');