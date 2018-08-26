# User Stories

## User Types

* Contract Owner
* Investor
* Speculator

## Scenario

The user visits a web application with a web3 connection to the underlying RDC contract. They are presented with an interface which lets them engage with the smart contract to invest or speculate in a randomly priced token, with functionality to purchase or sell the token for ether. Depending on the state of the contract, various functions may be locked or will additionally be enabled.

If the user is a contract Owner, they will be presented with a limited number of additional owner-only functions.

Interaction with the underlying functions is provided via an injected web3 client such as MetaMask, which will handle the user's transactions that they initiate via the web app UI.

### RDC Contract Functionality

    * Peg in to the RDC contract's token (exchanging ETH for the randomcoin token)
    * Peg out of the RDC contract's token (exchanging the randomcoin token for ETH, if the contract is in the `Active` state)
    * Collect ETH proportional to the user account's randomcoin token balance if the contract is in the `Liquidation` state
    * Force equitable liquidation of the contract (if the user is an Owner)
    * Unlock the transaction mutex in an emergency (if the user is an Owner)

## User Stories

### Owner

* As the Owner of the RDC contract, I can force an equitable liquidation of the contract, allowing pull payments to be made to addresses that hold some balance of the randomcoin token

### Investor

* As an Investor, I can convert between ETH and the "RandomCoin" currency at a random rate which is reset on every transaction for every user so that I receive the uncorrelated exposure that I am seeking from the instrument [does it work this way right now ?] *** N.B. a pitfall of this entire system is that the exposure to ETH itself may then be back to fiat at a non-random rate, and the investor wants to hedge their fiat exposures rather than their ETH exposures...
* As an Investor, I can withdraw some ETH fairly if I have pegged in to RandomCoin in the event that a large withdrawal breaks the peg, so that I have some assurance that my investment will not simply vanish
* As an Investor, I know there is some mechanism for defending the peg, so that it is not constantly being broken and rendering my investment "useless" by failing to offer me the uncorrelated exposure that I am seeking
* As an Investor, I can collect statistics on the random peg rates so that I can feel assured that the mechanism is correctly offering me the kind of exposure I am seeking

### Speculator

* 