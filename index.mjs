import { loadStdlib } from "@reach-sh/stdlib";
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib({REACH_NO_WARN: 'Y'});
const MAX = 9;
const accA = await stdlib.newTestAccount(stdlib.parseCurrency(5000));
const ctcA = accA.contract(backend);
const cards = {1:'A', 2:'2', 3:'3', 4:'4', 5:'5', 6:'6', 7:'7',
  8:'8', 9:'9', 10:'10', 11:'J', 12:'Q', 13:'K'};
const getCard = () => {
  const c = Math.floor(Math.random() * 13) + 1;
  return c;
};

console.log('Welcome to the bet handler');
const startPlayers = async () => {
  const runPlayer = async (i) => {
    const acc = await stdlib.newTestAccount(stdlib.parseCurrency(100));
    const ctc = acc.contract(backend, ctcA.getInfo());
    const bet = Math.floor(Math.random() * 100) + 1;
    const card = getCard();
    const succ = await ctc.apis.Buyer.placeBet(bet);
    console.log(`Player ${i} added to the map is ${succ}`);
    if(i % 2 != 0){
      const b = await ctc.apis.Buyer.refund();
      console.log(`Player ${i} is receiving a refund of ${b} ${stdlib.standardUnit}`);
      console.log(`Player ${i} has been deleted from the map`);
    }
    if(i == 8){
      await ctc.apis.Buyer.hiLo();
    }
  }// end of runBuyers
  for(let i = 1; i < MAX; i++){
    await runPlayer(i);
  }

}// end of startBuyers

await Promise.all([
  backend.Admin(ctcA, {
    amount: 100,
    ready: (contract) => {
      console.log(`Ready at contract: ${contract}`);
      startPlayers();
    },
  }),
]);
console.log('Exiting...');