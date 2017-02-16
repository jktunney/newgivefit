import React, { PropTypes, Component } from 'react';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';
import GridList from 'material-ui/GridList'
import {GoogleMapLoader, GoogleMap, Marker} from 'react-google-maps';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';
import ParkFeed from './subComponents/ParkFeed';
import GymFeed from './subComponents/GymFeed';
import DayPicker from './subComponents/DayPicker';
import GroupCreatorWithData from './subComponents/GroupCreator'
import {searchNearby} from 'utils/googleApiHelpers';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import classes from './styles.module.css';


const styles = {
  root: {
    display: 'flex',
		flex : 1,
		overflowY : 'hidden'
  },
  gridList: {
    width: 500,
    paddingTop:100,
    position : 'relative',
    background : '#e5e5e5',
		display : 'flex'
  },
  workout : {
    padding : '20px 12px 10px',
    boxSizing : 'border-box'
  }
};

class GridComponent extends Component {
    constructor(props){
      console.log('GridComponent props', props)
      super(props);
      // grab our googleMaps obj from whever she may lay
      var googleMaps = this.props.googleMaps ||
        (window.google && // eslint-disable-line no-extra-parens
          window.google.maps) ||
        this.googleMaps;

      if (!googleMaps) {
        console.error(// eslint-disable-line no-console
          'Google map api was not found in the page.');
        return;
      }
      this.state = {
        activeIndex : -1,
        parks: [],
        parksAndGyms: [],
        markers: [],
        pagination: null,
				loadedMapData : false
      };
      // now grab the services we need
      this.googleMaps = googleMaps;
      this.geocoder = new googleMaps.Geocoder();
      /*this.placesService = new googleMaps.PlacesService(map);*/
      this.clickMarker = null;
      this.infowindow = new googleMaps.InfoWindow;
    }
    /*Working on Google API for location fetching
    This google apis return the places in sets of 20, the maximum number of places that an api can fetch is 60. If you carefully observe the response of the google places api, it has a parameter called next_pagetoken. So the second time you hit the API u need to pass this next_pagetoken to fetch the next set of schools.@ChithriAjay
    how to do multiple types
    http://stackoverflow.com/questions/19625228/google-maps-api-multiple-keywords-in-place-searches*/
    componentDidMount(){

	    //search and add parks to state
	    // searchNearby(this.googleMaps, div, parks)
	    //   .then((results, pagination) => {
	    //     console.log('searchNearby parks', results)
	    //     console.log('searchNearby pagination', pagination)
	    //     this.setState({
	    //       parks: results,
	    //       pagination
	    //     })
	    //   }).catch((status, result) => {
	    //     console.error('error', status, result)
	    //   })
	    // //search and add gyms to state
	    // searchNearby(this.googleMaps, div, gyms)
	    //   .then((results, pagination) => {
	    //     console.log('searchNearby gyms', results)
	    //     console.log('searchNearby pagination', pagination)
	    //     this.setState({
	    //       parksAndGyms: this.state.parks.concat(results),
	    //       pagination
	    //     })
	    //   }).catch((status, result) => {
	    //     console.error('error', status, result)
	    //   })
			const div = document.createElement('div')
			const self = this;
	    /*const {googleMaps} = this.props;*/
	    //Need to update these searches when a new map center is created
	    //baltimore parks search params
	    const parks = {
	      location: { lat: 39.2904, lng: -76.6122 },
	      radius: 5000,
	      type: 'park'
	    }
	    //baltimore gym search params
	    const gyms = {
	      location: { lat: 39.2904, lng: -76.6122 },
	      radius: 5000,
	      type: 'gym'
	    }
			try{
				//search and add parks to state
			 const parksPromise = searchNearby(self.googleMaps, div, parks);
			 const gymsPromise = searchNearby(self.googleMaps, div, gyms);
			 Promise.all([parksPromise,gymsPromise]).then(([parksResult,gymsResult])=>{
				 self.setState({
					 parks : parksResult,
					 parksAndGyms: parksResult.concat(gymsResult),
					 loadedMapData : true
				 });
			 })

		 }catch(err){
			 console.log(err);
		 }


    }


    /*gets us our map on click location,
    may pass for location queries in the future*/
    geocodeLatLng(obj) {
    const {map} = this._googleMapComponent.props;
    //var input = "40,-90";
    //var latlngStr = input.split(',', 2);
    var latlng = {lat: obj.latLng.lat(), lng: obj.latLng.lng()};
    this.geocoder.geocode({'location': obj.latLng}, (results, status)=>{
      if (status === 'OK') {
        if (results[1]) {
          //why is map not setting to the actual center? appears to be offset by the feed
          map.setCenter(latlng);
          //Display location infowindow on hover
          /*this.infowindow.setContent(results[1].formatted_address);*/
          this.props.onPlaceSelect({
              coordinates : latlng,
              address : results[1].formatted_address
          });
          /*this.infowindow.open(map, marker);*/
        } else {
          //window.alert('No results found');
        }
        } else {
        //window.alert('Geocoder failed due to: ' + status);
        }
      });
    }
    markerClick(index){
      this.setState({activeIndex : index});
    }
    render(){
      const {props} = this;
			console.log('rerender')
			const {loadedMapData} = this.state;
      const {activeIndex, parks, parksAndGyms, markers} = this.state;
      //Build placeById object
      const placeById = {};
      parksAndGyms.forEach(s => {
        /*const place_id = s.place_id*/
        //console.log('each spot', s)
        /*const workout = workouts.find(w => w.placeId == place_id)*/
        placeById[s.place_id] = {
          /*comments: workout.comments,*/
          googleData: {
            title: s.name,
            position : {
                lat : s.geometry.location.lat(),
                lng : s.geometry.location.lng()
            },
            rating: s.rating,
            photos: s.photos ? s.photos[0].getUrl({'maxWidth': 500, 'maxHeight': 750}) : null,
            vicinity: s.vicinity,
            types: s.types
          }
        }
      })

      props.workouts.forEach(s => {
        //console.log('s workout props', s)
        placeById[s.node.id] = {
          /*comments: workout.comments,*/
          googleData: {
            title: s.node.title,
            position : {
                lat : parseFloat(s.node.lat),
                lng : parseFloat(s.node.lng)
            },
            photos: s.node.image,
            types: 'park'
          }
        }
      })
      //list with google data
      const gListView = parks.length ?
                <div style={styles.gridList} >
                <DayPicker className={classes.stackedTop} profile={props.profile} geocoder={this.geocoder}/>
                <div className={classes.workoutList}>
                  { Object.keys(placeById).map((item, index) => (
                  <div key={index} style={styles.workout}> {!item ||
                      (placeById[item].googleData.types.indexOf('park') !== -1 ?
                      <ParkFeed
                        active={activeIndex===index}
                        data={placeById[item]} />
                        :
                      <GymFeed
                        active={activeIndex===index}
                        data={placeById[item]}
                     />)}
                      </div>
                  ))}
                  </div> </div> :
               <Card>
              <CircularProgress size={80} />
              </Card>
      return (
            <div style={styles.root} className="__app__body__container">
            <section className="__app__body__container__left" ref={(node)=>this.mapSection = node}>
              { loadedMapData ? <GoogleMapLoader
                 containerElement={
                   <div
                     {...props.containerElementProps}
                     style={{
                       height: "100%",
                     }}
                   />
                 }
                 googleMapElement={
                   <GoogleMap
                    ref={(map) => { this._googleMapComponent = map ; } }
                    defaultZoom={13}
                    defaultCenter={{ lat: 39.287014134966526, lng: -76.55342102050781 }}
                    onClick={(...args)=>{
                      console.log("map args", ...args);
                      return this.geocodeLatLng(...args)
                     }}
                   >
                     {parksAndGyms.length ? Object.keys(placeById).map((marker, index) => {
                       return (
                         <Marker
                          key={index}
                           {...placeById[marker].googleData}
                           onClick={()=>this.markerClick(index)}
                           onRightclick={() => console.log(marker,index)} />
                       );
                     }) : null}
                   </GoogleMap>
                 }
               /> : null}
             </section>
             {gListView}
            </div>

        );
    }
}

//export default GridComponent;
const LOGGED_IN_USER = gql`
  query LoggedInUser {
    viewer {
      user {
        id
        username
        nickname
      }
    }
  }
`;

//Get some WorkoutGroups
const GET_THROUGH_VIEWER = gql`
  query GetThroughViewer($first: Int) {
    viewer {
      allWorkoutGroups(first: $first) {
        edges {
          node {
          id
          image
          title
          lat
          lng
          avatar
          contentSnippet
          }
        }
      }
  }
}
`;

//How many WorkoutGroups to return
const FIRST = 8;

const GridComponentWithData =  compose(
  graphql(GET_THROUGH_VIEWER, {
    options: (props) => ({
      variables: { first : FIRST }
    }),
  }),
    graphql(LOGGED_IN_USER, {
      props: ({ data }) =>  ({
        loggedInUser: data.viewer ? data.viewer.user : null
      })
    })
)(GridComponent);

export default GridComponentWithData;
