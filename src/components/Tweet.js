/* PARTE SUPERIOR: LLEVA, ID, HORA
    PARTE MEDIA: MENSAJE
    PARTE BAJA: LIKES, RESPUESTAS Y RETWEETS
 */

import React, { Component } from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faComment as faReply, faRetweet, faHeart, faHamburger, faHeartBroken} from "@fortawesome/free-solid-svg-icons";
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
    }


    componentDidMount(){
        const {name, user, message, likes, retweets, retweetedBy, date, tweetId, likesNumber, retweetedByNumber, showRetweetedBy, matchingRetweeted } = this.props.tweet;
        let profilepic = false;
        
        const tweetsDB = firebase.database().ref().child("tweets").child(tweetId).child("likes");
        let email;
        const usersDB = firebase.database().ref().child("users");

        if (!!firebase.auth().currentUser){
            email = firebase.auth().currentUser.email
        }

        let loggedUser = "";

        const tweetDate = new Date(date);
        const thisMoment = new Date()
        let timeAgo = (thisMoment-tweetDate)/1000;
        let showTime = "";
        
        let likedByLogged = false;

        

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

            for (let i = 0; i < keys.length; i++){
                if (count === 2) break;
                if (email === users[keys[i]]["email"]) {
                    loggedUser = users[keys[i]]["id"];
                    count++;
                }

                if (user === users[keys[i]]["id"]) {
                    if (!!users[keys[i]]["profilepic"]) {
                        profilepic = users[keys[i]]["profilepic"];
                        count++;
                    } else {
                        profilepic = "https://cdn.britannica.com/67/197567-131-1645A26E.jpg"
                        count++;
                    }
                }
            }
        }).then(x => {
            tweetsDB.once("value", data=>{
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
                    name, user, message, likes, retweets, retweetedBy, date, showTime, tweetId, likedByLogged, likesNumber, retweetedByNumber, showRetweetedBy, matchingRetweeted, profilepic
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


        const tweetsDB = firebase.database().ref().child("tweets").child(this.state.tweetId).child("likes");
        const usersDB = firebase.database().ref().child("users");

        let loggedUser = "";
        let likes = [];

        if (!Boolean(email))  return null;

        usersDB.once("value", data =>{
            const users = data.val();
            const keys = Object.keys(users);

            for (let i = 0; i < keys.length; i++){
                if (email === users[keys[i]]["email"]) {
                    loggedUser = users[keys[i]]["id"];
                    break;
                }
            }
        })

        tweetsDB.once("value", data => {
            likes = data.val()
            if (!likes) {
                likes = [loggedUser];
            } else {
                likes.push(loggedUser);
            }
        }).then(x =>{
            tweetsDB.set(likes);

            this.setState({
                likedByLogged: true,
                likesNumber: this.state.likesNumber+1})
        })


    }

    dislike = () => {
        let email;

        if (!!firebase.auth().currentUser){
            email = firebase.auth().currentUser.email
        } else {
            return null;
        }

        const tweetsDB = firebase.database().ref().child("tweets").child(this.state.tweetId).child("likes");
        const usersDB = firebase.database().ref().child("users");

        let loggedUser = "";
        let likes = [];

        usersDB.once("value", data =>{
            const users = data.val();
            const keys = Object.keys(users);

            for (let i = 0; i < keys.length; i++){
                if (email === users[keys[i]]["email"]) {
                    loggedUser = users[keys[i]]["id"];
                    break;
                }
            }
        })

        tweetsDB.once("value", data => {
            likes = data.val()
            if (likes.length === 1) {
                likes = [];
            } else {
                likes = likes.filter(userid => {
                    console.log(userid !== loggedUser)
                    return userid !== loggedUser
                });
            }
        }).then(x =>{
            console.log(likes)
            tweetsDB.set(likes)
            this.setState({
                likedByLogged: false,
                likesNumber: this.state.likesNumber-1
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
        const tweetsDB = firebase.database().ref().child("tweets").child(this.state.tweetId).child("retweetedBy");
        
        let loggedUser = "";


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
        
                    for (let i = 0; i < keys.length; i++){
                        if (users[keys[i]]["email"] === email) {
                            loggedUser = users[keys[i]]["id"];
                            break;
                        }
                    }
        
                    
                }).then(x =>{
                    tweetsDB.once("value", data =>{
                        let retweetedBy = data.val()
                        const retweetDate = new Date().toISOString();
                        const newRetweet = [loggedUser, retweetDate];
                        /* let newArray = [];
                        
                        for (let i = 0; i < keys.length; i++){
                            newArray.push(retweetedBy[keys[i]])
                        } */

                        if (!retweetedBy) {
                            retweetedBy = [newRetweet];
                        } else {
                            retweetedBy.push(newRetweet);
                        }
        
                        tweetsDB.set(retweetedBy);
        
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

     render(){   

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
                                {this.state.message}
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
                                <FontAwesomeIcon id="react-icon" icon={faHamburger}/>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </React.Fragment>
        );}
 }
  
 export default Tweet;