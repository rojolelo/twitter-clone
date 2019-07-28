import React, { Component } from 'react';
import {Link} from "react-router-dom";
import firebase from "firebase";

class UserBox extends Component {
    state = { 
        name: "",
        id: "",
        following: "",
        followers : "",
        tweetCount: "",
        profilepic: false,
        coverpic: false,
     }

     componentDidMount(){
         const usersDB = firebase.database().ref().child("users");
         const tweetsDB = firebase.database().ref().child("tweets");
         const email = firebase.auth().currentUser.email;

         function fromUndefinedToZero (data) {
            if (typeof(data) === "undefined") return 0;
            return data.length;
        }

         let name = "",
            id = "",
            following = "",
            followers = "",
            tweetCount = 0,
            profilepic = false,
            coverpic = false;

         usersDB.once("value", data => {
            const users = data.val();
            const keys = Object.keys(users);

            for (let i = 0; i < keys.length; i++){
                if (email === users[keys[i]]["email"]) {
                    name = users[keys[i]]["firstName"];
                    id = users[keys[i]]["id"];
                    following = fromUndefinedToZero(users[keys[i]]["following"]);
                    followers = fromUndefinedToZero(users[keys[i]]["followers"]);
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
                this.setState({
                    name, id, following, followers, tweetCount, profilepic, coverpic
                })
            })
         })
     }


    render() {   

        let image;

        if (!this.state.coverpic) {
            image= "https://firebasestorage.googleapis.com/v0/b/directorio-de-negocios-a257b.appspot.com/o/whitefondo.jpg?alt=media&token=22ddf22f-d657-43d7-a472-c115e58c1812";
        } else {
            image = this.state.coverpic
        }

        const style = {
            height: 95+"px",
            width: 100+"%",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundImage: `url(${image})`,
        }
        
        return (
            <div className="userBox-container">
                    
                    <div className="userBox-background" style={style}></div>

                <div className="userBox-content">
                    <div className="userBox-content-top">
                                <div className="userBox-content-picture">
                                    <picture>
                                        {
                                        this.state.profilepic ?
                                        <img id="profile-picture" src={this.state.profilepic}/> :
                                        <img id="profile-picture" src="https://firebasestorage.googleapis.com/v0/b/directorio-de-negocios-a257b.appspot.com/o/whitefondo.jpg?alt=media&token=22ddf22f-d657-43d7-a472-c115e58c1812"/>
                                        }
                                    </picture>
                                </div>
                        <div className="userBox-content-right">
                            <Link to={`${this.state.id}`}>
                                <div id="userBox-name" className="userBox-content-name">{this.state.name}</div>
                                <div id="userBox-userId" className="userBox-content-userId">@{this.state.id}</div>
                            </Link>
                        </div>
                    </div>

                    <div className="userBox-content-information">
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
            </div>
          );
    }
}
 
export default UserBox;