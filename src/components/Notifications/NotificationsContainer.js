import React, { Component } from 'react';
import Notification from "./Notification"
import firebase from "firebase";

class NotificationsContainer extends Component {
    state = {  }

    seenNotification = (notification) =>{
        const usersDB = firebase.database().ref().child("users");
        const email = firebase.auth().currentUser.email;
        let oldNotifications = [];
        let loggedUserId = "";

        // notification[2] = 1;

        usersDB.once("value", data =>{
            const users = data.val();
            const keys = Object.keys(users);

            

            for (let i = 0; i < keys.length; i++) {
                if (email == users[keys[i]]["email"]){
                    oldNotifications = users[keys[i]]["notifications"];
                    loggedUserId = users[keys[i]]["id"];
                    break;
                }
            }

            for (let i = 0; i < oldNotifications.length; i++){
                if (
                        notification[0] === oldNotifications[i][0] &&
                        notification[1] === oldNotifications[i][1] &&
                        notification[2] === oldNotifications[i][2] &&
                        notification[3] === oldNotifications[i][3]
                ) {
                    oldNotifications[i][2] = 1;
                    break
                }
            }

            
        }).then(() =>{
            usersDB.child(loggedUserId).child("notifications").set(oldNotifications);
        })
    }
    
    render() { 



        if (!this.props.notifications) {
            return (
                <div className="notifications-container">
                    <p>There are not notifications to show.</p>
                 </div>
            )
        } else if (this.props.notifications.length === 0) {
            return (<div className="notifications-container">
                    <p>There are not notifications to show.</p>
                 </div>)
        }

        return ( 
            <div className="notifications-container">
                {this.props.notifications.map((notification,i) => {
                   return <Notification notification={notification} seenNotification={this.seenNotification} key={i}/>
                })}
            </div>
         );
    }
}
 
export default NotificationsContainer;