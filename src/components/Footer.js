import React from 'react'
import { Button, Header, Menu, Modal } from 'semantic-ui-react'

const Footer = props => (
    <Menu inverted borderless attached size='massive'>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Modal trigger={<Menu.Item>About</Menu.Item>}>
                <Modal.Header>randomcoin</Modal.Header>
                <Modal.Content>
                <Modal.Description>
                    <Header>What is randomcoin?</Header>
                    <p>randomcoin (RDC) is an ERC20 token with a random exchange rate to ether. Its value is randomly determined on every transaction into or out of the token, allowing it to be used as a cryptocurrency portfolio hedge or for speculation.</p>
                    <Header>How do I use this application?</Header>
                    <p>If you have a connected wallet via a tool like <a href="https://metamask.io/" target="blank" rel="noopener noreferrer">MetaMask</a>, you can use the controls in the <strong>Actions</strong> section of the application to purchase RDC for ETH, or sell existing RDC for ETH.</p>
                    <p>In the event that the contract is in the Liquidating state, you may instead claim ETH from the contract proportional to any RDC holdings should you wish to do so.</p>
                    <p>If you already hold RDC, you may transfer your tokens to another address.</p>
                    <p>If you are the contract owner, additional actions will be available to you in the <strong>Owner Actions</strong> subsection.</p>
                </Modal.Description>
                </Modal.Content>
            </Modal>
            <Menu.Item><a href="https://github.com/cs79/rdc-react" target="_blank" rel="noopener noreferrer">Source</a></Menu.Item>
        </div>
    </Menu>
)

export default Footer