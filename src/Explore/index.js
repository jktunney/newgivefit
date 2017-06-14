import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'react-apollo'

import { GET_THROUGH_VIEWER, SUBSCRIBE_TO_WORKOUTS } from './gql'
import GridContainer from './GridContainer'

import './styles.css'

class Explore extends React.Component {
  constructor (props, context) {
    super(props, context)

    this.centerLatLng = null

    const { defaultLat, defaultLng } = this.props.route
    const { query } = this.props.location

    // create and add listener to addActivity event
    /* this.subscribeToNewWorkouts = this.subscribeToNewWorkouts.bind(this)
    var eventListener = new EventEmitter()
    eventListener.on('createWorkout', this.subscribeToNewWorkouts) */

    this.centerLatLng = {
      lat: query.lat ? parseFloat(query.lat) : defaultLat,
      lng: query.lng ? parseFloat(query.lng) : defaultLng,
    }
    this.state = {
      workouts: [],
    }
  }
  componentWillReceiveProps (nextProps) {
    console.log('nextProps', nextProps)
    if (!nextProps.loading) {
      this.setState({
        workouts: nextProps.viewer.allWorkouts.edges,
      })
    }
    if (!this.subscription && !nextProps.loading) {
      console.log('are we hitting the subscription?', nextProps)
      console.log('are we hitting the subscription? props', this.props)
      this.subscription = this.props.subscribeToMore({
        document: SUBSCRIBE_TO_WORKOUTS,
        variables: {
          subscriptionFilter: {
            endDateTime: {
              gte: new Date().toString(),
            },
          },
        },
        updateQuery: (prev, { subscriptionData }) => {
          console.log('updateQuery prev', prev)
          console.log('updateQuery subscriptionData', subscriptionData)
          if (!subscriptionData.data) {
            return prev
          }
          return {
            viewer: {
              allWorkouts: {
                edges: [
                  ...prev.viewer.allWorkouts.edges,
                  {
                    node: subscriptionData.data.subscribeToWorkout.value,
                  },
                ],
              },
            },
          }
        },
      })
    }
  }

  render () {
    console.log('explore props', this.props)
    const { profile, footerActiveTab } = this.props
    let workoutGroups = []

    return (
      <div className='explore_container'>
        <GridContainer
          centerLatLng={this.centerLatLng}
          onPlaceSelect={(place) => {
            data.refetch({
              latLng: place.address,
            })
            return null
          }}
          profile={profile}
          workoutGroups={workoutGroups}
          workouts={this.state.workouts}
          footerActiveTab={footerActiveTab}
        />
      </div>
    )
  }
}

Explore.propTypes = {
  route: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object,
  footerActiveTab: PropTypes.string.isRequired,
  viewer: PropTypes.object,
}

// for recurring workouts, create microservice that creates a
// number of workouts corresponding to each number of times requested
const withData = graphql(GET_THROUGH_VIEWER, {
  options: ({ params }) => ({
    variables: {
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
  props: ({ data: { viewer, loading, subscribeToMore } }) => ({
    viewer, loading, subscribeToMore,
  }),
})

const ExploreWithData = withData(Explore)

export default ExploreWithData
