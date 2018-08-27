# randomcoin
### _A non-correlated cryptocurrency portfolio hedge_

## What is randomcoin?
randomcoin (RDC) is an ERC20 token built on top of the Ethereum blockchain that offers cryptocurrency investors a non-correlated hedge to their token portfolios.  RDC is pegged to ether (ETH) at a random (bounded) rate, with programmatic and incentive-based mechanisms in place to defend the peg and encourage holding of the token.

## How does it work?
Upon initial contract creation, the RDC contract will be in a "funding" state where investors can peg in to the contract, exchanging ether for newly-minted RDC tokens.  Once a sufficient number of peg-in transactions have occured (or a minimum funding level of ETH is met), the contract moves to an "active" state and peg-out transactions can be made as well, which burn RDC tokens in exchange for ETH.

The rate at which any individual peg-in or peg-out transaction will be processed is a random number without a stably deterministic expected value.  The random walk for the rate is drawn from a uniform distribution between 1 and the current rate ceiling each time a transaction is made; every transaction additionally shifts the ceiling in a random direction by a random (bounded) amount.  By this construction, there will be an EV for each individual draw, but the EV will be unknown until the rate is actually drawn, and will change on every transaction (as will the bound within which the ceiling can be moved on the next draw).

The ceiling is set at a specific seed rate (1000) when the contract is instantiated, but will be shifted even on the first transaction made into the contract.  If the ceiling would shift lower than a specified threshold, it will be reset to the seed rate, allowing the ceiling to move upwards without bound, but preventing it from moving arbitrarily low.

While the contract funding period and bounds on the rate are designed to protect the peg, there is additional incentive to hold the RDC token in that the transaction which would break the peg does not receive all of the ETH held by the contract; rather, it forces the contract into a temporary "liquidating" state where any holders of RDC may choose to burn their tokens to cash out a proportional share of the ETH held by the contract.  Even during the liquidation phase there is incentive to continue holding the token: the potential to be one of the few RDC holders remaining when the contract resets to the funding and active states could present the opportunity to force a subsequent liquidation in an attempt to gain a higher proportion of ETH per RDC than the cash-out would provide, which creates a "last-mover advantage" during the liquidation.

### A note on correlation

The term "uncorrelated" here is used w.r.t. a portfolio based in ETH; if an investor is basing their portfolio in a fiat currency such as USD, RDC will be asymptotically correlated with the ETH/USD exchange rate to the extent that said rate falls towards zero (i.e. if the value of ETH, and subsequently any amount of RDC convertible into ETH, falls towards zero in USD terms).

## How can I set this up to try it out?

The randomcoin application was built on Linux (Ubuntu 16.04.5 LTS) with the following dependencies:

* `Node` version `10.8.0`
* `npm` version `6.4.0`
* `Truffle` version `4.1.14`
* `OpenZeppelin` version `1.12.0`
* `Chart.js` version `2.7.2`
* `react-chartjs-2` version `2.7.4`
* `Semantic UI` version `0.82.3`
* `MetaMask` version `4.9.3` (or another injected web3 instance; this application was only tested with Metamask)

It can be installed locally by cloning this repository, installing the correct versions of Node, npm, Truffle, and MetaMask, and using npm to fetch the rest of the project dependencies.

### Installing Node Packages

The dependencies for the project are specified in the packages.json file, and can automatically be installed via npm by opening a terminal in the directory where you have cloned this repository and running the following command:

`npm i`

### Installing MetaMask

`MetaMask` is provided as a browser extension; installation links for supported browsers can be found at https://metamask.io/

### Running the Tests

Once the dependencies (particularly `Truffle` and `OpenZeppelin`) have been properly installed in the project directory, Truffle can be used to run the contract tests by following these steps:

1) Open a terminal window in the project directory
2) Run the command `truffle develop` to start a Truffle development console session
3) Inside the Truffle development console, run the following commands:
    * `compile`: compile the project's smart contracts
    * `migrate --reset`: migrate the compiled contracts to the development chain (ganache-cli under the hood)
    * `test`: run the tests of the smart contract

### Running the Development Server

With the smart contract tests passing, you can run and interact with the smart contract on a development server by following these steps:

1) Open a second terminal window in the project directory
2) Run the command `npm run start`
3) If a web browser does not automatically load once the server is running, open your browser and go to `localhost:3000` (the default)

The frontend application should now be running in your web browser, connected to a deployed instance of the smart contract running on the development chain. You may need to restart the development chain running in the first terminal (with either `truffle develop --log` or `ganache-cli -l=8000000` if you would like to observe live logs of contract events) and re-migrate the contracts if you experience issues with the application.

In order to test the frontend functionality using MetaMask, copy the seed phrase from the development chain into the appropriate prompt at startup (for a clean install of MetaMask), or copy the first private key generated by the development chain into the private key field for a new account if you already have MetaMask set up.  (Both the seed phrase and test account private keys should be displayed in the terminal upon initialization of the development chain using Truffle.)  You will need to ensure that you are connected to the correct network in MetaMask in order to connect to the development chain being served by Truffle / ganache-cli.  Depending on which version of the development blockchain you are running, the port may be different; if the default `Localhost 8545` network provided in the MetaMask `Networks` dropdown list does not work, you may need to set up a new network connection by selecting `Custom RPC` in the menu and using `http:127.0.0.1:9545` as the `New RPC URL`.  (The version of Truffle used to develop this app defaults to using port `9545` when running `truffle develop`.)  If you are using a different development chain / port, set up your custom RPC accordingly.

### Interacting with the Application

The frontend provides some interactive graphics showing the latest transaction rates between RDC and ETH (which will be populated once transactions into/out of the randomcoin token have been made) along with some information on the state of the contract and the chain it is connected to.  Users are initially provided with at least one interactive field which allows them to specify an amount of ether they would like to peg in to the contract.  Once they have obtained some randomcoin tokens in exchange for ether, two additional interactive features are enabled which allow the user to either peg out some amount of RDC from the contract, or to send some RDC to another address.

If the contract is in the "Liquidating" state, users will additionally be presented with a button which allows them to claim, if they wish, their equitable share of the ETH in the contract, proportional to their holdings of the randomcoin token.

Additionally, if the user is the contract owner, they will be presented with an additional control panel with buttons that allow them to unlock the transaction mutex (in an emergency situation where it has become stuck; this should not occur in practice due to the contract's use of `transfer` rather than `send`), and a button that allows them to force the Liquidation state.  (For testing purposes, there is also a button allowing the owner to force a block to be mined on the development chain.)

When using any of the functions which interact with the contract, such as transacting in or out of the randomcoin token, the user will be prompted to approve the transaction via MetaMask (or another injected web3 instance; the application was developed and tested using MetaMask).  Approved transactions which affect the contract state should have those changes reflected in the web frontend once they are accepted by the development chain.
