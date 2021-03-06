const contractProperties = [
  'owner',
  'minimumPegInBaseAmount',
  'minimumPegInMultiplier',
  'averageRate',
  'txCount',
  'liquidationBlockNumber',
  'blockWaitTime',
  'minTxToActivate',
  'minBalanceToActivate',
  'maxRateIndex',
  'rateArrayFull',
  'txLockMutex',
]

// React imports + custom components
import React, { Component } from 'react'
import { Segment, Button, Form, Message, Grid, Header } from 'semantic-ui-react'
import Navbar from './Navbar'
import Graphs from './Graphs'
import Footer from './Footer'

// smart contract imports
import getWeb3 from '../utils/getWeb3'
import contract from 'truffle-contract'
import RDCContract from '../../build/contracts/RDC.json'

// main App component
class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      availablePayout: 0,
      haircut: 0,
      averageRate: 0,
      txCount: 0,
      txCountSinceLastReset: 0,
      expectedRate: 0,
      halfWidth: 0,
      liquidationBlockNumber: 0,
      blockWaitTime: 0,
      minimumPegInBaseAmount: 0,
      minimumPegInMultiplier: 0,
      minTxToActivate: 0,
      minBalanceToActivate: 0,
      latestRates: null, // should be an array of uint256
      maxRateIndex: 0,
      rateArrayFull: false,
      rawState: '',
      state: '', // might need to change this to bytes4 or something
      txLockMutex: false,
      latestRates: [],
      lastRate: 0, // not a state variable in RDC.sol; just captured here for testing / convenience until I can get array working
      userPegInValue: '',  // used in form field capture
      userPegOutValue: '', // used in form field capture
      userAcctBalance: 0,  // not a state variable in RDC.sol; just captured here for frontend
      userIsOwner: false,
      lastBlockNumber: 0,
      toAddress: '',      // used for transfer functionality
      transferAmount: '',  // used for transfer functionality
      web3: null,
    }
    this.getUpdatedState = this.getUpdatedState.bind(this) // needed or no ?
    this.handleChange = this.handleChange.bind(this)
    this.handlePegInButton = this.handlePegInButton.bind(this)
    this.handlePegOutButton = this.handlePegOutButton.bind(this)
    this.handleTransferButton = this.handleTransferButton.bind(this)
    this.handleCashOutButton = this.handleCashOutButton.bind(this)
    this.handleUnlockMutex = this.handleUnlockMutex.bind(this)
    this.handleEquitableLiquidation = this.handleEquitableLiquidation.bind(this)
    this.handleNextBlock = this.handleNextBlock.bind(this)
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.getUpdatedState()
      setInterval(this.getUpdatedState.bind(this), 1000)
    })
    .catch((err) => {
      console.log('Error finding web3.', err)
    })
  }

  // call to refresh all relevant state variables from RDC contract
  getUpdatedState() {
    const RDC = contract(RDCContract)
    RDC.setProvider(this.state.web3.currentProvider)

    var rdcInstance

    this.state.web3.eth.getAccounts(async (err, accounts) => {
      if (err) {
        console.error(err)
      } else {
        rdcInstance = await RDC.deployed()
        window.rdc = rdcInstance
        const propertyPromises = contractProperties.map(prop => rdcInstance[prop].call({ from: accounts[0] }))
        const properties = await Promise.all(propertyPromises)
        const propertyMap = {}
        contractProperties.forEach((prop, idx) => {
          propertyMap[prop] = typeof properties[idx] === 'object' && properties[idx] !== null ? properties[idx].c[0] : properties[idx]
        })
        // check the fetched owner value and compare to accounts[0]
        propertyMap['userIsOwner'] = propertyMap['owner'] === accounts[0]
        // also get latestRates array
        const bnArray = await rdcInstance.getLatestRates({ from: accounts[0] })
        propertyMap['latestRates'] = bnArray.map(elt => elt.c[0])
        propertyMap['lastRate'] = propertyMap['latestRates'].filter(elt => elt !== 0).reverse()[0]
        // also get accounts[0] balance
        const bal = await rdcInstance.balanceOf(accounts[0])
        propertyMap['userAcctBalance'] = Number(this.state.web3.fromWei(bal.toNumber())) // this gets set to a string when it is 0 for some reason
        // also get the new stateBytes field
        /*
        VALUES:
        Funding: 0xfa62
        Active: 0xf07b
        Liquidating: 0x6379
        */
        const stateBytes2 = await rdcInstance.getStateBytes({ from: accounts[0] })
        propertyMap['rawState'] = stateBytes2
        if (stateBytes2 === '0xfa62') {
          propertyMap['state'] = 'Funding'
        } else if (stateBytes2 === '0xf07b') {
          propertyMap['state'] = 'Active'
        } else if (stateBytes2 === '0x6379') {
          propertyMap['state'] = 'Liquidating'
        } else {
          propertyMap['state'] = 'UNKNOWN CONTRACT STATE'
        }
        // also get latest block number
        const latestBlock = await new Promise((resolve, reject) => {
          this.state.web3.eth.getBlock('latest', function(err, result) {
            if(err) {
              reject(err)
            } else {
              resolve(result.number)
            }
          })
        })
        propertyMap['lastBlockNumber'] = latestBlock

        // set the fetched properties accumulated into this.state
        this.setState(propertyMap)
      }
    })
  }

  // various button handlers
  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  handlePegInButton() {
    const RDC = contract(RDCContract)
    RDC.setProvider(this.state.web3.currentProvider)

    var rdcInstance

    this.state.web3.eth.getAccounts(async (err, accounts) => {
      if (err) {
        console.error(err)
      } else {
        rdcInstance = await RDC.deployed()
        // convert the inputted value to Wei; should be clearly marked on the form as being in ETH
        // I'm not sure if it's possible / easy to detect web3 version, but if so, make this call conditional (if ver >= 1.0.0, call web3.utils.toWei instead)
        const val = await rdcInstance.pegIn({ from: accounts[0], value: this.state.web3.toWei(this.state.userPegInValue) })
        console.log(val)
        this.setState({ userPegInValue: '' })
      }
    })
  }

  handlePegOutButton() {
    const RDC = contract(RDCContract)
    RDC.setProvider(this.state.web3.currentProvider)

    var rdcInstance

    this.state.web3.eth.getAccounts(async (err, accounts) => {
      if(err) {
        console.error(err)
      } else {
        rdcInstance = await RDC.deployed()
        // convert down to "wei equivalent" ? Probably...
        const val = rdcInstance.pegOut(this.state.web3.toWei(this.state.userPegOutValue), {from: accounts[0]})
        console.log(val)
        this.setState({ userPegOutValue: '' })
      }
    })
  }

  handleTransferButton() {
    const RDC = contract(RDCContract)
    RDC.setProvider(this.state.web3.currentProvider)

    var rdcInstance

    this.state.web3.eth.getAccounts(async (err, accounts) => {
      if(err) {
        console.error(err)
      } else {
        rdcInstance = await RDC.deployed()
        const val = rdcInstance.transfer(this.state.toAddress, this.state.web3.toWei(this.state.transferAmount), { from: accounts[0] })
        console.log(val)
        this.setState({ toAddress: '', transferAmount: '' })
      }
    })
  }

  handleCashOutButton() {
    const RDC = contract(RDCContract)
    RDC.setProvider(this.state.web3.currentProvider)

    var rdcInstance

    this.state.web3.eth.getAccounts(async (err, accounts) => {
      if(err) {
        console.error(err)
      } else {
        rdcInstance = await RDC.deployed()
        const val = rdcInstance.equitableCashout({ from: accounts[0] })
        console.log(val)
      }
    })
  }

  handleUnlockMutex() {
    const RDC = contract(RDCContract)
    RDC.setProvider(this.state.web3.currentProvider)

    var rdcInstance

    this.state.web3.eth.getAccounts(async (err, accounts) => {
      if(err) {
        console.error(err)
      } else {
        rdcInstance = await RDC.deployed()
        const val = rdcInstance.emergencyUnlockTxMutex({ from: accounts[0] })
        console.log(val ? "Success" : "Failure")
      }
    })
  }

  handleEquitableLiquidation() {
    const RDC = contract(RDCContract)
    RDC.setProvider(this.state.web3.currentProvider)

    var rdcInstance

    this.state.web3.eth.getAccounts(async (err, accounts) => {
      if(err) {
        console.error(err)
      } else {
        rdcInstance = await RDC.deployed()
        const val = rdcInstance.equitableLiquidation({ from: accounts[0] })
        console.log(val ? "Success" : "Failure")
      }
    })
  }

  handleNextBlock() {
    const RDC = contract(RDCContract)
    RDC.setProvider(this.state.web3.currentProvider)

    var rdcInstance

    this.state.web3.eth.getAccounts(async (err, accounts) => {
      if(err) {
        console.error(err)
      } else {
        rdcInstance = await RDC.deployed()
        const val = rdcInstance.nextBlock({ from: accounts[0] })
        console.log(val ? "Block Mined!" : "Block Not Mined :(")
      }
    })
  }

  render() {
    console.log('latestRates', this.state.latestRates)

    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column'}}>
        <Navbar userAcctBalance={this.state.userAcctBalance} userIsOwner={this.state.userIsOwner} />
        <Segment attached padded='very' style={{ flex: '1', alignSelf: 'center', maxWidth: '1600px' }}>
          <Graphs latestRates={this.state.latestRates} />
          <Segment>
            <Grid columns={2} divided stackable>
              <Grid.Row>
                <Grid.Column style={{padding: '2em'}}>
                  <Header size='huge'>Info</Header>
                  <Segment.Group>
                    <Segment><strong>Contract State:</strong> {this.state.state}</Segment>
                    <Segment><strong>Current block number:</strong> {this.state.lastBlockNumber}</Segment>
                    <Segment><strong>Last transaction rate:</strong> {this.state.lastRate}</Segment>
                    <Segment><strong>Transaction count:</strong> {this.state.txCount}</Segment>
                    <Segment><strong>Transaction mutex:</strong> {this.state.txLockMutex ? "Locked" : "Unlocked"}</Segment>
                    {this.state.state === 'Liquidating' &&
                      <Segment><strong>Liquidation block number:</strong> {this.state.liquidationBlockNumber}</Segment>
                    }
                    {this.state.state === 'Liquidating' &&
                      <Segment><strong>Liquidation block wait time:</strong> {this.state.blockWaitTime}</Segment>
                    }
                  </Segment.Group>
                </Grid.Column>
                <Grid.Column style={{padding: '2em'}}>
                  <Header size='huge'>Actions</Header>
                  <Form>
                    <Form.Input
                      label='ETH Amount'
                      placeholder='0.00'
                      type='numeric'
                      name='userPegInValue'
                      value={this.state.userPegInValue}
                      onChange={this.handleChange}
                      disabled={this.state.state === 'Liquidating' && (this.state.lastBlockNumber < (this.state.liquidationBlockNumber + this.state.blockWaitTime))}
                      action={{
                        content: 'Peg in to RDC',
                        color: 'teal',
                        labelPosition: 'left',
                        icon: 'caret square right',
                        onClick: this.handlePegInButton,
                      }}
                    />
                    <Form.Input
                      label='RDC Amount'
                      placeholder='0.00'
                      type='numeric'
                      name='userPegOutValue'
                      value={this.state.userPegOutValue}
                      onChange={this.handleChange}
                      disabled={this.state.state !== 'Active' || this.state.userAcctBalance === 0}
                      action={{
                        content: 'Peg out to ETH',
                        color: 'red',
                        labelPosition: 'left',
                        icon: 'caret square left outline',
                        onClick: this.handlePegOutButton,
                      }}
                    />
                    <Form.Group widths='equal'>
                      <Form.Input
                        fluid
                        label='Address to Transfer RDC'
                        placeholder='0x...'
                        type='text'
                        name='toAddress'
                        value={this.state.toAddress}
                        onChange={this.handleChange}
                        disabled={this.state.userAcctBalance === 0}
                      />
                      <Form.Input
                        fluid
                        label='Amount of RDC to Transfer'
                        placeholder='0.00'
                        type='numeric'
                        name='transferAmount'
                        value={this.state.transferAmount}
                        onChange={this.handleChange}
                        disabled={this.state.userAcctBalance === 0}
                      />
                      <Form.Button
                        fluid
                        label='Submit Transfer Request'
                        floated='right'
                        onClick={this.handleTransferButton}
                        content='Transfer'
                        disabled={this.state.userAcctBalance === 0}
                      />
                      
                    </Form.Group>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        disabled={this.state.state !== 'Liquidating' || this.state.userAcctBalance === 0}
                        onClick={this.handleCashOutButton}
                        content='Claim equitable payout'
                      />
                    </div>
                  </Form>
                  {
                    this.state.userIsOwner &&
                    <Message>
                      <Header size='large' style={{ marginBottom: '0.5em' }}>Owner Actions</Header>
                      <Form>
                        <Form.Button
                          basic
                          color='red'
                          disabled={!this.state.txLockMutex}
                          onClick={this.handleUnlockMutex}
                        >
                          Emergency unlock transaction mutex
                        </Form.Button>
                        <Form.Button
                          basic
                          color='red'
                          disabled={!this.state.state === 'liquidating'}
                          onClick={this.handleEquitableLiquidation}
                        >
                          Trigger equitable liquidation
                        </Form.Button>
                        <Form.Button
                          basic
                          color='black'
                          onClick={this.handleNextBlock}
                        >
                          Mine a block (dev chain)
                        </Form.Button>
                      </Form>
                    </Message>
                  }
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </Segment>
        <Footer />
      </div>
    );
  }
}

export default App
