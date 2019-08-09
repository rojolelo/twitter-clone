import React, { Component } from 'react';
import firebase from "firebase";
import FollowButton from "./FollowButton";
import UnfollowButton from "./UnfollowButton";
import {Link} from "react-router-dom";


class UserBoxInUserPage extends Component {
    state = { 
        name: "",
        id: "",
        following: "",
        followers: "",
        tweetCount: "",
        notFound: false,
        followingButton: -1,
        profilepic: false,
        coverpic: false,
     }

    /* follow = this.follow.bind(this);
    unfollow = this.unfollow.bind(this); */
    sendToState = this.sendToState.bind(this)

     sendToState(name, id, following, followers, tweetCount, followingButton,profilepic, coverpic){
         this.setState({
            name, id, following, followers, tweetCount, followingButton,profilepic, coverpic
         })
     }

    componentDidMount(){

        const usersDB = firebase.database().ref().child("users");
        const tweetsDB = firebase.database().ref().child("tweets");
        
        let email = "";

        let name = "",
           id = window.location.pathname.replace("/twitter-clone/", ""),
           following = "",
           followers = "",
           tweetCount = 0,
           followingButton = -1,
           profilepic = false,
           coverpic = false;

           // -1 No loggeado
           // 0 Sin seguir
           // 1 Siguiendo
        

        function fromUndefinedToZero (data) {
           if (typeof(data) === "undefined") return 0;
           return data.length;
       }

        

        usersDB.once("value", data => {
           const users = data.val();
           const keys = Object.keys(users);

           for (let i = 0; i < keys.length; i++){
               if (id === users[keys[i]]["id"]) {
                   name = users[keys[i]]["firstName"];
                   following = fromUndefinedToZero(users[keys[i]]["following"]);
                   followers = fromUndefinedToZero(users[keys[i]]["followers"]);
                   email = users[keys[i]]["email"];
                   profilepic = users[keys[i]]["profilepic"]
                   coverpic = users[keys[i]]["coverpic"]                   
                   break;                    
               }
           }

          
        }).then(x => {
           tweetsDB.once("value", data => {
               const tweets = data.val();
               const keys = Object.keys(tweets);

               for (let i = 0; i < keys.length; i++) {
                   if (email === tweets[keys[i]]["email"]) {
                       tweetCount++;
                   }
               }
           }).then(x => {

            if (!profilepic) {
                profilepic = "https://cdn.britannica.com/67/197567-131-1645A26E.jpg"
            }
            if (!coverpic) {
                coverpic = "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80"
            }

                firebase.auth().onAuthStateChanged((user) => {       
                    if (user) { 
                        const loggedEmail = firebase.auth().currentUser.email;
        
                        //FOLLOWING BUTTON ACTIVATION (OR NOT)
                        usersDB.once("value", data => {
                            const users = data.val();
                            const keys = Object.keys(users);

                            for (let i = 0; i < keys.length; i++){
                                if (loggedEmail === users[keys[i]]["email"]){

                                    const userId = users[keys[i]]["id"];

                                    if (id === users[keys[i]]["id"]) break;

                                    if (typeof(users[keys[i]]["following"]) == "undefined"){
                                        followingButton = 0;
                                        break;
                                    }
                                    
                                    
                                    const following = users[keys[i]]["following"];
                                    const followingKeys = Object.keys(users[keys[i]]["following"]);

                                    for (let j = 0; j <followingKeys.length; j++) {
                                        if (id === following[followingKeys[j]]) {
                                            followingButton = 1;
                                            break;
                                        } else {
                                            followingButton = 0;
                                        }
                                    }
                                }
                            }

                            this.setState({
                                name, id, following, followers, tweetCount, followingButton, profilepic, coverpic
                             })

                        })
                    } else {
                        this.setState({
                            name, id, following, followers, tweetCount, followingButton, profilepic, coverpic
                         })
                    }
                })
           })
        })
    }

    follow = () => {
        const usersDB = firebase.database().ref().child("users");
        const email = firebase.auth().currentUser.email;

        let userNotifications = [];
        let newNotification = [];

        //ID of the userPage
        const id = this.state.id;

        let following = undefined;
        let followers = undefined;

        let followingUser = "";

        usersDB.once("value", data => {
            const users = data.val();
            const keys = Object.keys(users)

            for (let i = 0; i < keys.length; i++) {

                //ADDING TO FOLLOWING
                if (users[keys[i]]["email"] === email) {
                    following = users[keys[i]]["following"]
                    followingUser = users[keys[i]]["id"];

                    //Add the follower ID to the notifications
                    newNotification[0] = users[keys[i]]["id"];
                }

                //GET NOTIFICATIONS OF FOLLOWED
                if (id === users[keys[i]]["id"]) {
                    userNotifications = users[keys[i]]["notifications"]
                }
            }

            if (typeof(following) === "undefined") {
                following = [id];
            } else {
                following.push(id);
            }

            //NOTIFICATIONS
            newNotification[1] = new Date().toISOString();
            newNotification[2] = 0;
            newNotification[3] = "follow";
            
            if (!userNotifications){
                userNotifications = [newNotification];
            } else {
                userNotifications.push(newNotification)
            }

            
            usersDB.child(id).child("notifications").set(userNotifications);

            /////////////////////////

            
            for (let i = 0; i < keys.length; i++){

                //ADDING TO FOLLOWERS
                if (users[keys[i]]["id"] === id) {
                    followers = users[keys[i]]["followers"];

                    if (typeof(followers) === "undefined") {
                        followers = [followingUser];
                    } else {
                        followers.push(followingUser);
                    }
                }                
            }

            usersDB.child(id).child("followers").set(followers);
            usersDB.child(followingUser).child("following").set(following);
            
        }).then( x => {
            this.setState({
                followingButton:1,
                followers: this.state.followers +1
            })
        })
    }

    unfollow =() => {
        const usersDB = firebase.database().ref().child("users");
        const email = firebase.auth().currentUser.email;

        let userNotifications = [];

        const id = this.state.id;

        let following = [];
        let followers = [];

        let followingUser = "";

        usersDB.once("value", data => {
            const users = data.val();
            const keys = Object.keys(users)

            for (let i = 0; i < keys.length; i++) {

                //DELETE FROM FOLLOWING
                if (users[keys[i]]["email"] === email) {
                    following = users[keys[i]]["following"]
                    followingUser = users[keys[i]]["id"];
                }

                //GET UNFOLLOWED NOTIFICATIONS
                if (id === users[keys[i]]["id"]){
                    userNotifications = users[keys[i]]["notifications"];
                }
            }

            /// DELETE FOLLOW NOTIFICATIONS
                if (!userNotifications) {
                    userNotifications = [];
                } else if (userNotifications.length === 1) {
                    userNotifications = []
                } else {
                    userNotifications = userNotifications.filter(notification => {
                        return !(notification[0] === followingUser && notification[3] === "follow")
                    })
                }

                usersDB.child(id).child("notifications").set(userNotifications)

            ///////////////////////////////


            if (following.length === 1) {
                following = [];
            } else {
                following = following.filter(followedId => {
                    return followedId !== id;
                })
            }

            for (let i = 0; i < keys.length; i++){

                //DELETE FROM FOLLOWERS
                if (users[keys[i]]["id"] === id) {
                    followers = users[keys[i]]["followers"];

                    if (followers.length === 1) {
                        followers = [];
                    } else {
                        followers.filter(followedId => {
                            return followedId !== followingUser
                        });
                    }
                }

                
            }

            
            usersDB.child(id).child("followers").set(followers);
            usersDB.child(followingUser).child("following").set(following);
            
        }).then(x => {
            this.setState({
                followingButton:0,
                followers: this.state.followers -1
            })
        })
    }


    render() {                

        return ( 
            <div className="userBoxUP-container">
                {/* PROFILE PIC HERE  */}
                {this.state.profilepic ?
                <img id="userBoxUP-image" src={this.state.profilepic} alt="profile picture"/> :
                <img id="userBoxUP-image" src="https://firebasestorage.googleapis.com/v0/b/directorio-de-negocios-a257b.appspot.com/o/whitefondo.jpg?alt=media&token=22ddf22f-d657-43d7-a472-c115e58c1812" alt="profile picture"/>}

                <h3 id="userBoxUP-name">{this.state.name}</h3>
                <p id="userBoxUP-user">@{this.state.id}</p>
                <p id="userBoxUP-description">Non editable description.</p>    

                

                {(this.state.followingButton === -1) ? null : ((this.state.followingButton === 0) ? <FollowButton follow={this.follow}/> : <UnfollowButton unfollow={this.unfollow}/>) }

                    
                    <div className="userBox-content-information userBoxInUserPage-content">
                       <Link to={""} >
                            <div className="userBox-content-tweets">
                                <h5 id="userBox-information">Tweets</h5>
                                <h5 id="userBox-number">{this.state.tweetCount} </h5>
                            </div> 
                        </Link>

                        <Link to={""}> 
                            <div className="userBox-content-following">
                                <h5 id="userBox-information">Following</h5>
                                <h5 id="userBox-number">{this.state.following} </h5>
                            </div> </Link>
                        <Link to={""}>
                            <div className="userBox-content-followers">
                                <h5 id="userBox-information">Followers</h5>
                                <h5 id="userBox-number">{this.state.followers} </h5>
                            </div> 
                        </Link>
                    </div>

            </div>
         );
    }
}
 
export default UserBoxInUserPage;