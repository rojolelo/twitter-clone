import React, { Component } from 'react';
import firebase from "firebase";

class FollowButton extends Component {
    state = {  }
    follow = this.follow.bind(this)

    follow(){
        this.props.follow();
    }

    render() { 
        
        return ( 
            <div className="follow-unfollow">
            <span className="follow-button" onClick={this.follow}>Follow</span>
            </div>
         );
    }
}
 
export default FollowButton;