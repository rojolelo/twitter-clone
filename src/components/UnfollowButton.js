import React, { Component } from 'react';
import firebase from "firebase";

class UnfollowButton extends Component {
    state = {  }

    unfollow = this.unfollow.bind(this)

    unfollow(){
        this.props.unfollow();
    }

    render() { 
        return ( 
            <div className="follow-unfollow">
            <span className="unfollow-button" onClick={this.unfollow}>Unfollow</span>
            </div>
         );
    }
}
 
export default UnfollowButton;