import React from 'react'
import UserBox from "./UserBox";
import TimeLine from "./TimeLine"
import firebase from "firebase";

var userData = {};
var propsSent = false;
var homeTweets = {};
var tweetMessage = "";

class LoggedLanding extends React.Component {    

    componentWillMount(){

    }
   

    render (){
        const email = firebase.auth().currentUser.email
        const usersDB = firebase.database().ref().child("users");
        const tweetsDB = firebase.database().ref().child("tweets");

        tweetsDB.once("value", data => {
            const tweets = data.val();
            const keys = Object.keys(tweets);
            let tweetCount = 0;
            let tweetHomeCount = 0;

            for (let i = 0; i < keys.length; i++) {
                if (tweets[keys[i]].email === email) {
                    tweetCount++;
                }                
            }

            userData["tweetCount"] = tweetCount;
        })

        
        

        usersDB.once("value", data => {
            const users = data.val()
            const keys = Object.keys(users)

            for (let i = 0; i < keys.length; i++) {
               if (users[keys[i]].email === email) {
                   userData["email"] = email;
                   userData["name"] = users[keys[i]].firstName;
                   userData["userId"] = users[keys[i]].id;
                   userData["following"] = users[keys[i]].following;
                   userData["followers"] = users[keys[i]].folowers;
               }
            }
        }).catch(error => {console.log(error)})

        //INTERVAL FOR LOADING INFO
        if (!propsSent){
            var interval = setInterval(x => {
                if (Boolean(userData.name) || Boolean(userData.tweetCount)) {
                    clearInterval(interval)
                    propsSent = true;
                    this.setState({})
                }
            }, 2000)
        }
        ////////////////////////////////////////////////////////////////////

        return ( 
            
            <React.Fragment>
                <div className="app-container">
                                <div className="app-left">
                                <UserBox userData={userData}/>
                                </div>
                    
                                <div className="app-mid">
                                <TimeLine userData={userData}/>
                                </div>

                                <div className="app-right">
                                </div>
                </div>
            </React.Fragment>
            
        );}
}
 
export default LoggedLanding;