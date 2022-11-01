/**
 * Gambling DApp
 * 
 * Return varying wager amounts specific to each users bet
 * 
 * covers:
 * network tokens
 * more advanced invariants
 * 
 */
 'reach 0.1';

 export const main = Reach.App(() => {
   const A = Participant('Admin', {
     amount: UInt,
     ready: Fun([Contract], Null),
   });
   const B = API('Buyer', {
     placeBet: Fun([UInt], Bool),
     refund: Fun([], UInt),
     hiLo: Fun([], Null),
   });
   init();
 
   A.only(() => {
     const amount = declassify(interact.amount);
     assume(amount == 100, "wrong amount paid in");
   });
   A.publish(amount);
   commit();
   A.interact.ready(getContract());
   A.pay(amount);
   const pMap = new Map(UInt);
   const [count, done] = parallelReduce([0, false])
    // the balance needs to be related to the map sum!
     .invariant(balance() == (pMap.sum() + amount), "balance accurate")
     .invariant(pMap.size() == count, "count accurate")
     .while(count < 4 || !done)
     .api_(B.placeBet, (bet) => {
        check(isNone(pMap[this]), "sorry, you already registered");
        return[bet, (ret) => {
          pMap[this] = bet;
          ret(true);
          return [count + 1, false];
        }];
     })
     .api_(B.hiLo, () => {
      check(isSome(pMap[this]), 'sorry, you are not in the list');
      return [ (ret) => {
        // do something
        ret(null);
        return[count, true];
      }];
     })
     .api_(B.refund, () => {
        check(isSome(pMap[this]), "sorry, you are not in the list");
        return[ (ret) => {
          const bet = fromSome(pMap[this], 0);
          ret(bet);
          transfer(bet).to(this);
          delete pMap[this]
          return[count - 1, false];
        }];
     });
     // taking this out throws balance zero at application exit errors
    // is there some residual balance I'm unaware of?
   transfer(balance()).to(A);
   commit();
   exit();
 });