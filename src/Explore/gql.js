import gql from 'graphql-tag'

export const GET_THROUGH_VIEWER = gql`
query GetThroughViewer($first: Int, $where:WorkoutWhereArgs, $orderBy:[WorkoutOrderByArgs]) {
    viewer{
      allWorkouts(first: $first, where:$where, orderBy:$orderBy){
        edges {
          node {
            id
            parkId
            startDateTime
            title
            description
            pictureURL
            startDateTime
            endDateTime
            requestTrainer
            recurring
            type
            slug
            Workout {
              id
              nickname
              username
              picture
            }
            RSVPsForWorkout{
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`

export const GET_BY_SLUG = gql`
query GetBySlug($where:WorkoutWhereArgs) {
    viewer{
      allWorkouts(where:$where){
        edges {
          node {
            id
            parkId
            startDateTime
            title
            description
            pictureURL
            startDateTime
            endDateTime
            requestTrainer
            recurring
            type
            slug
            Workout {
              id
              nickname
              username
              picture
            }
            RSVPsForWorkout{
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`

export const SUBSCRIBE_TO_WORKOUTS = gql`
  subscription newWorkouts($subscriptionFilter:WorkoutSubscriptionFilter) {
    subscribeToWorkout(mutations:[createWorkout], filter: $subscriptionFilter) {
      mutation
      value {
        id
        parkId
        startDateTime
        title
        description
        pictureURL
        startDateTime
        endDateTime
        requestTrainer
        recurring
        type
      }
    }
  }
`
