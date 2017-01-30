import React, {Component} from 'react';
import {Tab, Tabs, Slider} from 'material-ui';
import GroupCreatorWithData from './GroupCreator';

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
};

class DayPicker extends Component{
	constructor(props){
		super(props)
		console.log('props of daypicker', props)
	}
	handleActive(tab) {
	  alert(`A tab with this route property ${tab.props['data-route']} was activated.`);
	}
	render(){
		const {props} = this;
		return(
			<div className={props.className || ''}>
				<Tabs>
				    <Tab label="Mon" />
				    <Tab label="Tues" />
				   	<Tab label="Wed" />
				    <Tab label="Thurs" />
				    <Tab label="Fri" />
				    <Tab label="Sat" />
				    <Tab label="Sun" />
				  </Tabs>
				<div>
					<GroupCreatorWithData
						geocoder={props.geocoder}
						profile={props.profile}
					/>
				</div>
			</div>
		)
	}
}

export default DayPicker;