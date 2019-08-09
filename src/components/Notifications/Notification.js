import React, { Component } from 'react';
import {Link} from "react-router-dom";

class Notification extends Component {

    state = {

    }

    seenNotification = this.seenNotification.bind(this)

    seenNotification () {
        this.props.seenNotification(this.props.notification);
    }

    render(){ 
   
    const notification = this.props.notification;

    const isTweet = Boolean(notification[4])
    let text= "";
    const user = notification[0];

    if (notification[3] === "follow"){
        text = "is following you."
    } else if (notification[3] === "like") {
        text = "liked you tweet."
    } else if (notification[3] === "retweet"){
        text = "has retweeted your tweet."
    } else if (notification[3] === "mention") {
        text = "has mentioned you in a tweet."
    }

    let seen;

    if (!notification[2]) seen = "unseen"; else seen="seen";

   

    return ( 
<React.Fragment>
        { isTweet ?

        
        <div className={`notification-container ${seen}`} onClick={this.seenNotification}>
                    <p className="notification-text">
                        <Link to={user}>
                        <span className="notification-user">@{user} </span>
                        </Link>     
                        <Link to={`/tweet/${notification[4]}`}>
                        {text}
                        </Link>
                    </p>
                </div>
        

        :

        <div className={`notification-container ${seen}`} onClick={this.seenNotification}>
            <p className="notification-text">
                <Link to={user}>
                <span className="notification-user">@{user} </span>
                </Link>                
                {text}
            </p>
        </div>
    }
    </React.Fragment>
     );}
}
 
export default Notification;