/* PARTE SUPERIOR: LLEVA, ID, HORA
    PARTE MEDIA: MENSAJE
    PARTE BAJA: LIKES, RESPUESTAS Y RETWEETS
 */

import React, { Component } from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faComment as faReply, faRetweet, faHeart, faTrash} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom"
import firebase from "firebase";
import { thisExpression } from '@babel/types';
import Swal from "sweetalert2";

 class Tweet extends React.Component {

    state = {
        name: "",
        user: "",
        profilepic: false,
        message: "",
        likes: [],
        likesNumber: "",
        retweets: "",
        retweetedBy :"",
        retweetedByNumber: "",
        date: "",
        showTime: "",
        tweetId: "",
        likedByLogged: false,
        showRetweetedBy: false,
        matchingRetweeted: "",
        loggedUser: "0",
        deleted: false
    }

    
    componentDidMount(){
        const {name, user, message, likes, retweets, retweetedBy, date, tweetId, likesNumber, retweetedByNumber, showRetweetedBy, matchingRetweeted } = this.props.tweet;
        let profilepic = false;
        var newMessage = [];     
        

        
        //MENTIONED USERS IN THE MESSAGE
        const mentionRegex = /@\w+/g;
        var mentionedUsers = message.match(mentionRegex);
     /*    for (let i = 0; i < mentionedUsers.length; i++){
            mentionedUsers[i] = mentionedUsers[i].replace("@", "");
            mentionedUsers[i] = [mentionedUsers[i], 0];
        } */
        // the number inside of mentioned users array determines if the users exists.

        const approvedUsers = {};

        //////////////////////////
        
        const tweetLikesDB = firebase.database().ref().child("tweets").child(tweetId).child("likes");
        let email;
        const usersDB = firebase.database().ref().child("users");

        //CHECK IF LOGGED
        if (!!firebase.auth().currentUser){
            email = firebase.auth().currentUser.email
        }

        let loggedUser = "";

        const tweetDate = new Date(date);
        const thisMoment = new Date()
        let timeAgo = (thisMoment-tweetDate)/1000;
        let showTime = "";
        
        let likedByLogged = false;

        
        // TIME AGO TO SHOW
        if        (timeAgo < 61) {
            showTime = `${Math.floor(timeAgo)} seconds ago`
        } else if (timeAgo < 3600) {
            timeAgo = Math.floor(timeAgo / 60);
            showTime = `${timeAgo} minutes ago`
            if (timeAgo === 1) showTime = `${timeAgo} minute ago`
        } else if (timeAgo < 86400) {
            timeAgo = Math.floor(timeAgo / 3600);
            showTime = `${timeAgo} hours ago`
            if (timeAgo === 1) showTime = `${timeAgo} hour ago`
        } else if (timeAgo < 604800) {
            timeAgo = Math.floor(timeAgo / 86400);
            showTime = `${timeAgo} days ago`
            if (timeAgo === 1) showTime = `${timeAgo} day ago`
        } else if (timeAgo < 2419200) {
            timeAgo = Math.floor(timeAgo / 604800);
            showTime = `${timeAgo} weeks ago`
            if (timeAgo === 1) showTime = `${timeAgo} week ago`
        } else if (timeAgo < 29030400) {
            timeAgo = Math.floor(timeAgo / 2419200);
            showTime = `${timeAgo} months ago`
            if (timeAgo === 1) showTime = `${timeAgo} month ago`
        } else {
            timeAgo = Math.floor(timeAgo / 29030400);
            showTime = `${timeAgo} years ago`
            if (timeAgo === 1) showTime = `${timeAgo} year ago`
        }

        usersDB.once("value", data =>{
            const users = data.val();
            const keys = Object.keys(users);
            let count= 0;

            //  GET LOGGED USER ID IN ORDER TO CHECK LIKED
            for (let i = 0; i < keys.length; i++){
                // if (count === 2) break;
                if (email === users[keys[i]]["email"]) {
                    loggedUser = users[keys[i]]["id"];
                    count++;
                }

            //GET TWEETER USER TO GET PROFILEPIC
                if (user === users[keys[i]]["id"]) {
                    if (!!users[keys[i]]["profilepic"]) {
                        profilepic = users[keys[i]]["profilepic"];
                        count++;
                    } else {
                        profilepic = "https://cdn.britannica.com/67/197567-131-1645A26E.jpg"
                        count++;
                    }
                }

            //CREATE PROPERTY IF USER IS FOUND - SO IT CAN BE CHECKED IF USER EXISTS.
                if (!!mentionedUsers) {
                    for (let j = 0; j < mentionedUsers.length; j++) {
                        if (mentionedUsers[j].replace("@","") == users[keys[i]]["id"]){
                            approvedUsers[mentionedUsers[j].replace("@","")] = 1
                        }
                    }
                }
            }

            // PENDANT: SPLIT THEN <FRAGMENT> THE STRING WITH HTML TO SHOW IN REACT
            var splittedMessage = message.split(" ");
            
                  
            for (let i = 0; i < splittedMessage.length; i++) {
                if (splittedMessage[i][0] == "@" && approvedUsers.hasOwnProperty(splittedMessage[i].replace("@",""))) {
                        newMessage.push(<React.Fragment><Link to={splittedMessage[i].replace("@", "")} ><span className="mention-user">{splittedMessage[i]}</span></Link></React.Fragment>)
                        newMessage.push(" ")
                } else {
                    newMessage.push(splittedMessage[i])
                    newMessage.push(" ")
                }                
            }






        }).then(x => {
            tweetLikesDB.once("value", data=>{
                const likes = data.val();
    
                if (!likes) {
                    return null
                } else {
                    for (let i = 0; i < likes.length; i++){
                        if (likes[i] === loggedUser) {
                            likedByLogged = true;
                        }
                    }
                }
            }).then(x => {
                this.setState({
                    name, 
                    user, 
                    message : newMessage, 
                    likes, 
                    retweets, 
                    retweetedBy, 
                    date, 
                    showTime, 
                    tweetId, 
                    likedByLogged, 
                    likesNumber, 
                    retweetedByNumber, 
                    showRetweetedBy, 
                    matchingRetweeted, 
                    profilepic, 
                    loggedUser,
                    updated: true
                })
            })
        })

        
    }

    like = () => {
        let email;

        if (!!firebase.auth().currentUser){
            email = firebase.auth().currentUser.email
        } else {
            return null;
        }


        const tweetLikesDB = firebase.database().ref().child("tweets").child(this.state.tweetId).child("likes");
        const usersDB = firebase.database().ref().child("users");

        let loggedUser = "";
        let likes = [];
        let userNotifications = [];
        let newNotification = [];

        if (!Boolean(email))  return null;

        usersDB.once("value", data =>{
            const users = data.val();
            const keys = Object.keys(users);

            

            for (let i = 0; i < keys.length; i++){
                if (email === users[keys[i]]["email"]) {
                    loggedUser = users[keys[i]]["id"];
                    newNotification[0] = users[keys[i]]["id"];
                }

                if (this.state.user === users[keys[i]]["id"]) {
                    userNotifications = users[keys[i]]["notifications"]
                }
            }

            newNotification[1] = new Date().toISOString();
            newNotification[2] = 0;
            newNotification[3] = "like";
            newNotification[4] = this.state.tweetId;

            // newNotification = [user, date, 0, like, twID]

            if (!userNotifications) {
                userNotifications = [newNotification]
            } else {
                userNotifications.push(newNotification)
            }
           
        }).then(() => {
            tweetLikesDB.once("value", data => {
                likes = data.val()
                if (!likes) {
                    likes = [loggedUser];
                } else {
                    likes.push(loggedUser);
                }
            }).then(x =>{
                tweetLikesDB.set(likes);

                //SEND NOTIFICATION ONLY IF USER IS DIFFERENT.
                // OBJECTIVE: NOT SELF NOTIFICATIONS.
                if (newNotification[0] !== this.state.user){
                    usersDB.child(this.state.user).child("notifications").set(userNotifications);
                }

                this.setState({
                    likedByLogged: true,
                    likesNumber: this.state.likesNumber+1})
            })
        })

        



    }

    dislike = () => {
        let email;

        if (!!firebase.auth().currentUser){
            email = firebase.auth().currentUser.email
        } else {
            return null;
        }

        let userNotifications = [];
        let newNotification = [];

        const tweetLikesDB = firebase.database().ref().child("tweets").child(this.state.tweetId).child("likes");
        const usersDB = firebase.database().ref().child("users");

        let loggedUser = "";
        let likes = [];

        usersDB.once("value", data =>{
            const users = data.val();
            const keys = Object.keys(users);

            for (let i = 0; i < keys.length; i++){
                if (email === users[keys[i]]["email"]) {
                    loggedUser = users[keys[i]]["id"];
                }

                //GET DISLIKED TWEET USER NOTIFICATIONS
                if (this.state.user === users[keys[i]]["id"]){
                    userNotifications = users[keys[i]]["notifications"];
                }
            }

            /////DELETE LIKE NOTIFICATION
            if (!userNotifications){
                userNotifications = [];
            } else if (userNotifications.length === 1) {
                userNotifications = []
            } else {
                userNotifications = userNotifications.filter(notification => {
                    return !(notification[0] === loggedUser && notification[4] === this.state.tweetId)
                })
            }

            if (loggedUser !== this.state.user) {
            usersDB.child(this.state.user).child("notifications").set(userNotifications)
            }
            //////////////////////////////

        }).then(() => {

            tweetLikesDB.once("value", data => {
                likes = data.val()
                if (likes.length === 1) {
                    likes = [];
                } else {
                    likes = likes.filter(userid => {
                        return userid !== loggedUser
                    });
                }
            }).then(x =>{
                tweetLikesDB.set(likes)
                this.setState({
                    likedByLogged: false,
                    likesNumber: this.state.likesNumber-1
                })
            })

        })

        


    }

    retweet =() => {
        
        let email;

        if (!!firebase.auth().currentUser){
            email = firebase.auth().currentUser.email
        } else {
            return null;
        }
        
        const usersDB = firebase.database().ref().child("users");
        const tweetRetweetedDB = firebase.database().ref().child("tweets").child(this.state.tweetId).child("retweetedBy");
        
        let loggedUser = "";

        let userNotifications = [];
        let newNotification = [];


        Swal.fire({
            title: 'Wanna retweet this?',
            type: 'info',
            showCancelButton: true,
            confirmButtonColor: '#1da1f2',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Retweet'
          }).then((result) => {
            if (result.value) {

                usersDB.once("value", data =>{
                    const users = data.val();
                    const keys = Object.keys(users);
                    let count = 0;
        
                    for (let i = 0; i < keys.length; i++){
                        if (count === 2) break;
                        if (users[keys[i]]["email"] === email) {
                            loggedUser = users[keys[i]]["id"];
                            newNotification[0] = users[keys[i]]["id"];
                            count++
                        }

                        if (users[keys[i]]["id"] === this.state.user) {
                            userNotifications = users[keys[i]]["notifications"];
                            count++
                        }
                    }

                    newNotification[1] = new Date().toISOString();
                    newNotification[2] = 0;
                    newNotification[3] = "retweet";
                    newNotification[4] = this.state.tweetId;

                    // newNotification = [user, date, 0, like, twID]

                    if (!userNotifications) {
                        userNotifications = [newNotification]
                    } else {
                        userNotifications.push(newNotification)
                    }

        
                    
                }).then(x =>{
                    tweetRetweetedDB.once("value", data =>{
                        let retweetedBy = data.val()
                        const retweetDate = new Date().toISOString();
                        const newRetweet = [loggedUser, retweetDate];
                     
                        if (!retweetedBy) {
                            retweetedBy = [newRetweet];
                        } else {
                            retweetedBy.push(newRetweet);
                        }
        
                        tweetRetweetedDB.set(retweetedBy);
                        usersDB.child(this.state.user).child("notifications").set(userNotifications);
        
                    }).then(x=>{
                        Swal.fire(
                            'Retweeted!',
                            "",
                            'success'
                          )
                          this.setState({
                              retweetedByNumber: this.state.retweetedByNumber+1
                          })
                    })
        
        
                })


              
            }
          })

        

    }

    deleteTweet = () =>{
        const usersDB = firebase.database().ref().child("users");
        const tweetsDB = firebase.database().ref().child("tweets");
        let sameUser = false;

        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
          }).then((result) => {
            if (result.value) {
                usersDB.once("value", data => {
                    const users = data.val();
                    const keys = Object.keys(users);
        
                    for (let i = 0; i < keys.length; i++){
                        if (this.state.loggedUser === users[keys[i]]["id"]) {
                            sameUser = true;
                            break;
                        }
                    }
        
                    if (sameUser == false) return null;
        
                    //THIS DELETES TWEET.
                    tweetsDB.child(this.state.tweetId).set(null);
        
                }).then( () => {
                    this.setState({
                        deleted:true
                    })
                    Swal.fire(
                        'Deleted!',
                        'Your tweet has been deleted.',
                        'success'
                      )
                })
            }
          })

        

        
    }

     render(){   

        if (this.state.deleted) return null;

        let image;

        if (!this.state.profilepic) {
            image = "https://firebasestorage.googleapis.com/v0/b/directorio-de-negocios-a257b.appspot.com/o/whitefondo.jpg?alt=media&token=22ddf22f-d657-43d7-a472-c115e58c1812";
        } else {
            image = this.state.profilepic;
        }

        return ( 
            <React.Fragment>
                
                <div className="Contenedor">

                { this.state.showRetweetedBy ?
                <div className="retweetedBy">
                    <FontAwesomeIcon icon={faRetweet}/> <span>Retweet by {this.state.matchingRetweeted[this.state.matchingRetweeted.length-1][0]}</span>
                </div> : null}

                <div className="tweet-container">            
                    <div className="tweet-picture">
                        <img id="tweet-picture" src={image}/>
                    </div>

                    <div className="tweet-inside-container">
                        <div className="tweet-top">
                            <Link to={`/${this.state.user}`}>
                            <span className="tweet-userName">{this.state.name} </span>
                            </Link>
                            <Link to={`/${this.state.user}`}>
                            <span className="tweet-userId">@{this.state.user}</span>
                            </Link>
                            <span className="tweet-date">{this.state.showTime}</span>
                        </div>

                        <div className="tweet-mid">
                            <div className="tweet-mid-message">
                                {!!this.state.message.length ? this.state.message.map(word => word) : null}
                            </div>
                        </div>

                        <div className="tweet-bot">
                            <div className="tweet-bot-icon">
                                <FontAwesomeIcon id="react-icon" icon={faReply}/>
                            </div>
                            <div className="tweet-bot-icon">
                                <FontAwesomeIcon id="react-icon" onClick={this.retweet}  icon={faRetweet}/>
                                {this.state.retweetedByNumber > 0 ? <span>{this.state.retweetedByNumber}</span> : null}
                            </div>
                            <div className="tweet-bot-icon">    
                                {this.state.likedByLogged ? <FontAwesomeIcon id="react-icon" className="liked-heart" icon={faHeart} onClick={this.dislike} /> : <FontAwesomeIcon id="react-icon" icon={faHeart} onClick={this.like} />}                                
                                {this.state.likesNumber > 0 ? <span>{this.state.likesNumber}</span> : null}
                            </div>
                            <div className="tweet-bot-icon">
                                {this.state.loggedUser == this.state.user ? <FontAwesomeIcon id="react-icon" onClick={this.deleteTweet} icon={faTrash}/> : null}
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </React.Fragment>
        );}
 }
  
 export default Tweet;