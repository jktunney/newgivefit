import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { graphql, compose } from 'react-apollo'
import BigCalendar from 'react-big-calendar'
import Dialog from 'material-ui/Dialog'

import foursquare from 'utils/foursquare'
import { GET_USER_WORKOUTS } from './gql'

import ProfileHeader from './components/ProfileHeader'
import ProfileDetails from './components/ProfileDetails'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import './styles.css'

// Setup the localizer by providing the moment (or globalize) Object
// to the correct localizer.
BigCalendar.momentLocalizer(moment) // or globalizeLocalizer

/* possible reference: https://github.com/scaphold-io/auth0-lock-playground */
class Profile extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      editMode: false,
      userFieldsToUpdate: {},
      todaysDate: moment(),
      user: null,
      events: [],
      eventDialogOpen: false,
      eventDialogInfo: {},
    }
  }

  componentWillReceiveProps (nextProps) {
    const events = []
    const parksDictionary = {}
    const { data } = nextProps

    if (this.props.data.loading !== data.loading) {
      const userWorkouts = data.getUser.Workout.edges
      const userWorkoutRSVPs = data.getUser.WorkoutRSVP.edges

      for (let i = 0; i < userWorkouts.length; i++) {
        const workout = userWorkouts[i].node

        parksDictionary[workout.parkId] = {}

        events.push({
          parkId: workout.parkId,
          start: new Date(workout.startDateTime),
          end: new Date(workout.endDateTime),
        })
      }

      for (let i = 0; i < userWorkoutRSVPs.length; i++) {
        const workout = userWorkoutRSVPs[i].node

        parksDictionary[workout.parkId] = {}

        events.push({
          parkId: workout.parkId,
          rsvp: true,
          start: new Date(workout.startDateTime),
          end: new Date(workout.endDateTime),
        })
      }


      Promise.all(Object.keys(parksDictionary).map((parkId) => {
        return foursquare.getVenueInfoById(parkId)
          .then((venueInfo) => {
            parksDictionary[parkId].title = venueInfo.name
            parksDictionary[parkId].location = venueInfo.location.formattedAddress.toString()
          })
      }))
        .then(() => {
          this.setState({
            user: data.getUser,
            events: events.map((event) => {
              const park = parksDictionary[event.parkId]

              event.title = event.rsvp ? `${park.title} (RSVP'd)` : park.title
              event.location = park.location

              return event
            }),
          })
        })
        .catch((err) => console.log(err))
    }
  }

  onSaveProfileChanges () {
    this.setState({
      editMode: false,
    })
  }

  userFieldsToUpdate (fieldName, value) {
    this.setState({
      userFieldsToUpdate: { ...this.state.userFieldsToUpdate, [fieldName]: value },
    })
  }

  render () {
    const { user, editMode, events, eventDialogInfo, eventDialogOpen } = this.state

    if (user) {
      return (
        <div className='home'>
          <ProfileHeader
            headerPhotoURL={user.headerPhotoURL}
            editMode={editMode}
            onProfileHeaderChange={(url) => this.userFieldsToUpdate('headerPhotoURL', url)}
          />
          <ProfileDetails
            user={user}
            editMode={editMode}
            onEnableEdit={(editMode) => this.setState({ editMode })}
            onSaveProfileChanges={(...args) => this.onSaveProfileChanges(...args)}
            onUserDescriptionChange={(description) => this.userFieldsToUpdate('description', description)}
            onUserNicknameChange={(nickname) => this.userFieldsToUpdate('nickname', nickname)}
            onProfilePhotoChange={(url) => this.userFieldsToUpdate('picture', url)}
          />
          <BigCalendar
            events={events}
            defaultView='week'
            eventPropGetter={(event) => {
              return {
                className: event.rsvp ? 'rsvpd' : '',
              }
            }}
            onSelectEvent={(event) => {
              this.setState({
                eventDialogOpen: true,
                eventDialogInfo: {
                  title: event.title,
                  location: event.location,
                  start: event.start,
                  end: event.end,
                  rsvp: Boolean(event.rsvp),
                },
              })
            }}
          />
          <Dialog
            title={eventDialogInfo.title}
            open={eventDialogOpen}
            onRequestClose={() => this.setState({ eventDialogOpen: false })}
          >
            <div><b>Location:</b> {eventDialogInfo.location}</div>
            <div><b>Start:</b> {moment(eventDialogInfo.start).format('LLLL')}</div>
            <div><b>End:</b> {moment(eventDialogInfo.end).format('LLLL')}</div>
          </Dialog>
        </div>
      )
    }

    return (
      <div className='home'>
        <div>Loading...</div>
      </div>
    )
  }
}

Profile.propTypes = {
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
}

const ProfileWithData = compose(
  graphql(GET_USER_WORKOUTS, {
    options: (props) => ({
      variables: {
        id: JSON.parse(window.localStorage.getItem('scapholdUserId')),
        first: 10,
        where: {
          endDateTime: {
            gte: new Date().toString(),
          },
        },
        orderBy: {
          field: 'startDateTime',
          direction: 'ASC',
        },
      },
    }),
  }),
)(Profile)

export default ProfileWithData
