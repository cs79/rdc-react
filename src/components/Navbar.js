import React from 'react'
import { Menu } from 'semantic-ui-react'

const Navbar = props => (
    <Menu attached borderless inverted style={{ fontSize: '32px' }}>
        <Menu.Item style={{ paddingRight: '0px' }}><img style={{ padding: '4px' }} src='/256_bit_RandomCoinWhite.png' /></Menu.Item>
        <Menu.Item header style={{ paddingLeft: '0.75em' }}>randomcoin</Menu.Item>
        <Menu.Menu position='right' style={{ fontSize: '22px' }}>
            {props.userIsOwner && <Menu.Item style={{ paddingRight: '0px' }}>Welcome Owner!</Menu.Item>}
            <Menu.Item>Account RDC Balance: {props.userAcctBalance}</Menu.Item>
        </Menu.Menu>
    </Menu>
)

export default Navbar
