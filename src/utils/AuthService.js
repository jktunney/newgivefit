// Helper class to encapsulate login functionality
import EventEmitter from 'events'
import Auth0Lock from 'auth0-lock'

var options = {
  /* auth: {
      redirectUrl: 'http://localhost:3000/explore'
  }, */
  theme: {
    primaryColor: '#CF1F3C',
    logo: 'https://static1.squarespace.com/static/5633dd05e4b03216fd2f5ab9/t/579011122994cad3347ce32e/1478460286586/?format=1500w',
  },
}

/* Todo: add a listener to see if the scaphold_user_token is there, do an "updateUser" */

export default class AuthService extends EventEmitter {
  constructor (clientId, domain) {
    super()
    // Configure Auth0
    this.lock = new Auth0Lock(clientId, domain, options)
    // Add callback for lock `authenticated` event
    this.lock.on('authenticated', this._doAuthentication.bind(this))
    // binds login functions to keep this context
    this.login = this.login.bind(this)
  }

  _doAuthentication (tokenPaylod) {
    this.lock.getUserInfo(tokenPaylod.accessToken, (error, profile) => {
      if (error) {
        this.emit('error', error)
        return
      }

      this.setProfile(profile)
      this.emit('authenticated', profile, tokenPaylod)
    })

    // Saves the user token
    this.setToken(tokenPaylod.idToken)
  }

  login () {
    // Call the show method to display the widget.
    this.lock.show()
  }

  logout () {
    window.localStorage.clear()
    // emit an event to clear profile from state
    this.emit('loggedOut')
  }

  setProfile (profile) {
    window.localStorage.setItem('user_profile', JSON.stringify(profile))
  }

  getProfile () {
    return JSON.parse(window.localStorage.getItem('user_profile'))
  }

  loggedIn () {
    // Checks if there is a saved token and it's still valid
    return !!this.getToken()
  }

  setToken (idToken) {
    // Saves user token to localStorage
    console.log('setting idToken/scaphold_user_token', idToken)
    window.localStorage.setItem('scaphold_user_token', idToken)
  }

  getToken () {
    // Retrieves the user token from localStorage
    return window.localStorage.getItem('scaphold_user_token')
  }

  getLoggedInUser () {
    // Retrieves the user token from localStorage
    return window.localStorage.getItem('scapholdUserId')
  }
}
