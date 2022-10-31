import { loadStdlib } from "@reach-sh/stdlib";
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib({REACH_NO_WARN: 'Y'});
const MAX = 9;
const accA = await stdlib.newTestAccount(stdlib.parseCurrency(5000));
const ctcA = accA.contract(backend);

console.log('Welcome to the bet handler');
const pInfo = [];
const startPlayers = async () => {
  const runPlayer = async (i) => {
    const acc = await stdlib.newTestAccount(stdlib.parseCurrency(100));
    const ctc = acc.contract(backend, ctcA.getInfo());
    pInfo.push(ctc);    
    const bet = Math.floor(Math.random() * 100) + 1;
    const succ = await ctc.apis.Buyer.startGame(bet);
    console.log(`Player ${i} added to the map is ${succ}`);
    if(i % 2 != 0){
      const b = await ctc.apis.Buyer.refund();
      console.log(`Player ${i} is receiving a refund of ${b} ${stdlib.standardUnit}`);
      console.log(`Player ${i} has been deleted from the map`);
    }
    if(i == 8){
      await stdlib.wait(10);
      await ctc.apis.Buyer.getCard();
    }
  }// end of runBuyers
  for(let i = 1; i < MAX; i++){
    await runPlayer(i);
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