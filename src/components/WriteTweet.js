import React, {Component} from 'react'
import firebase from "firebase";

var userData = {};

class WriteTweet extends Component {
    state = { 
        tweet : "",
        profilepic: false,
        mentions: [],
     }
    refTweetText = React.createRef();
    sendTweet=this.sendTweet.bind(this);
    writeTweet=this.writeTweet.bind(this);
    cleanState = this.cleanState.bind(this);

    checkMention = () => {
        const mentionRegex = /@\w+/g;

        if (!this.state.tweet.match(mentionRegex)) return null;

        let users = this.state.tweet.match(mentionRegex);

        for (let i = 0; i < users.length; i++){
            users[i] = users[i].replace("@", "");
        }

        return users;        
        
    }

    componentDidMount(){
        const usersDB = firebase.database().ref().child("users");
        const email = firebase.auth().currentUser.email;
        let profilepic = false;

        usersDB.once("value", data =>{
            const users = data.val();
            const keys = Object.keys(users);

            for (let i = 0; i < keys.length; i++){
                if (email === users[keys[i]]["email"]){
                    if (!!users[keys[i]]["profilepic"]){
                        profilepic = users[keys[i]]["profilepic"];
                    } else {
                        profilepic = "https://cdn.britannica.com/67/197567-131-1645A26E.jpg";
                    }
                }
            }
        }).then(() =>{
            this.setState({
                profilepic
            })
        })
    }
    cleanState(tweetData,tweetId){
        this.props.refreshRender(tweetData,tweetId);
        this.setState({
            tweet: ""
        })
    }

    writeTweet(){
        this.setState({
            tweet : this.refTweetText.current.value
        })
    }

    sendTweet(){
        const tweetMessage= this.state.tweet;
        const mentionedUsers = this.checkMention();

        let newNotification = [];
        let usersNotifications = {};
        let oldNotifications = [];        

        if (tweetMessage.length === 0) return null;

        
        const userEmail = firebase.auth().currentUser.email;
        const tweetsDB = firebase.database().ref().child("tweets")
        const usersDB = firebase.database().ref().child("users")
        
            usersDB.once("value", data => {
                const users = data.val();
                const keys = Object.keys(users)

                for (let i = 0; i < keys.length; i++){
                    if (userEmail === users[keys[i]].email) {
                        userData["email"] = userEmail;
                        userData["name"] = users[keys[i]].firstName;
                        userData["userId"] = users[keys[i]].id;
                    }

                    if (!!mentionedUsers) {
                        for (let j = 0; j < mentionedUsers.length; j++) {
                            if (mentionedUsers[j] === users[keys[i]]["id"]) {
                                usersNotifications[users[keys[i]]["id"]] = users[keys[i]]["notifications"];
                            }
                        }
                    }
                }

            }).then(x => {
                const tweetDate= new Date().toISOString();
                const tweetData = {
                    date : tweetDate,
                    email : userEmail,
                    message : tweetMessage,
                    name : userData["name"],
                    user: userData["userId"]
                }
                const tweetId = tweetsDB.push().key;
                tweetData["tweetId"] = tweetId;
                tweetsDB.child(tweetId).update(tweetData)

                //NOTIFICATION TO MENTIONED USERS
                if (!!mentionedUsers) {
                    for (let i = 0; i < mentionedUsers.length; i++){
                        newNotification[0] = mentionedUsers[i];
                        newNotification[1] = new Date().toISOString()
                        newNotification[2] = 0;
                        newNotification[3] = "mention";
                        newNotification[4] = tweetId;

                        oldNotifications = usersNotifications[mentionedUsers[i]];

                        if (!oldNotifications) {
                            oldNotifications = [newNotification];
                        } else {
                            oldNotifications.push(newNotification)
                        };

                        //HASOWNPROPERTY CHECKS IF USER EXISTS, IF IT DOES. IT SENDS NOTIFICATION
                        //CHECKS IF THE USER WHO WROTE THE TWEET IS MENTIONED, THEN NO NOTIFICATION WILL BE SEND.


                        if (userData["userId"] === newNotification[0] ||
                         !usersNotifications.hasOwnProperty(newNotification[0])) {

                        } else {
                        usersDB.child(newNotification[0]).child("notifications").set(oldNotifications);
                        }
                    }
                }

                this.cleanState(tweetData,tweetId)            
            })
        
        

        
    }

    

    render() { 

        let image;

        if (!this.state.profilepic) {
            image = "https://firebasestorage.googleapis.com/v0/b/directorio-de-negocios-a257b.appspot.com/o/whitefondo.jpg?alt=media&token=22ddf22f-d657-43d7-a472-c115e58c1812";
        } else {
            image = this.state.profilepic;
        }


        return ( 
            <div className="write-container">
                <div className="write-picture-container">
                <img id="write-profile-picture" src={image}/>
                </div>
                
                <div className="write-input-container">
                    <textarea ref={this.refTweetText} onChange={this.writeTweet} value={this.state.tweet} maxLength="250" className="write-input" type="text" placeholder="What's happening?" />
                    <div className="write-bottom-container">
                        <button type="button" className="write-tweet" onClick={this.sendTweet}>Tweet</button>
                    </div>
                </div>
            </div>
         );
    }
}
 
export default WriteTweet;