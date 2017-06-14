import React from 'react'
import PropTypes from 'prop-types'

import IconMenu from 'material-ui/IconMenu'
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import Hamburger from 'material-ui/svg-icons/navigation/menu'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import { MenuItem, RaisedButton, FlatButton } from 'material-ui'
import PersonAdd from 'material-ui/svg-icons/social/person-add'

import { Link } from 'react-router'

import './MainToolbar.css'

class MainToolbar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      value: 3,
      open: false,
    }
  }

  startLogin () {
    this.props.auth.login()
  }

  handleToggle () {
    this.setState({ open: !this.state.open })
  }

  handleClose () {
    this.setState({ open: false })
  }

  render () {
    return (
      <div>
        <Toolbar>
          <ToolbarGroup>
            <ToolbarTitle
              className='title'
              text='GiveFit'
              onClick={() => this.context.router.push('/')}
            />
          </ToolbarGroup>
          <ToolbarGroup>
            <IconMenu
              className='iconMenu'
              iconButtonElement={
                <IconButton touch={true} onTouchTap={this.handleToggle.bind(this)}>
                  <Hamburger />
                </IconButton>
              }
            >
              {process.env.__NODE_ENV__ === 'development' &&
                <MenuItem
                  onTouchTap={this.handleClose.bind(this)}
                  primaryText='API'
                >
                  <Link to='https://us-west-2.api.scaphold.io/graphql/newGiveFitAlias' target='_blank' />
                </MenuItem>
              }
              <FlatButton label='City Leaderboard' onClick={() => this.context.router.push('/city-leaderboard')} />
              <MenuItem
                onTouchTap={this.handleClose.bind(this)}
                onClick={() => this.startLogin()}
                primaryText='Log in'
                leftIcon={<PersonAdd />} />
            </IconMenu>
          </ToolbarGroup>
          <ToolbarGroup className='onlyLargeScreens'>
            {process.env.__NODE_ENV__ === 'development' &&
              <FlatButton
                className='onlyLargeScreens'
                containerElement={<Link to='https://us-west-2.api.scaphold.io/graphql/newGiveFitAlias' target='_blank' />}
                label='API'
              />
            }
            <FlatButton label='City Leaderboard' onClick={() => this.context.router.push('/city-leaderboard')} />
            <ToolbarSeparator />
            <RaisedButton
              label='Login'
              primary={true}
              onClick={() => this.startLogin()}
            />
          </ToolbarGroup>
        </Toolbar>
      </div>
    )
  }
}

MainToolbar.propTypes = {
  auth: PropTypes.object.isRequired,
}

MainToolbar.contextTypes = {
  router: PropTypes.object.isRequired,
}

export default MainToolbar
