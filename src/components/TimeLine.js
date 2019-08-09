import React, { Component } from 'react';
import Tweet from './Tweet';
import firebase from "firebase";
import WriteTweet from './WriteTweet';
import { faTintSlash } from '@fortawesome/free-solid-svg-icons';


class TimeLine extends React.Component {

  constructor(props) {
      super(props);

      this.state = { 
          loading: false,
          following: [],
          userPage: true,
          tweetsToShow: [],
          updated: false,
          pageChanged:false,
          userData: {},
          newTweets: [],
      }

      this.refreshRender=this.refreshRender.bind(this)
      this.searchTweets=this.searchTweets.bind(this)
      this.matchUsers=this.matchUsers.bind(this)
      this.matchUsersRetweet=this.matchUsersRetweet.bind(this)
      this.reRender = this.reRender.bind(this)
      this.searchOneTweet= this.searchOneTweet.bind(this)
      
    }
    
    
    componentDidMount(){
      const tweetRegex = new RegExp ("/tweet");
      const pathname = window.location.pathname;
      if (tweetRegex.test(pathname)){
         this.searchOneTweet();
        } else {
      this.searchTweets()
    }
    }
         
     reRender(tweetsToShow, userPage){         
       this.setState({tweetsToShow, updated:true, pageChanged: false, userPage})
     }
    



     //THIS IS FOR UPDATING 1 TWEET, WHEN WRITTEN AND SENT.
     refreshRender(tweetData, tweetId){
       this.setState({
         newTweets: [tweetData,...this.state.newTweets]
       })
    }
    //////////////////////////////////////////////////////////


    searchOneTweet(){
      //THIS IS WHEN YOU NEED ONLY 1 TWEET IN THE TIMELINE
      //WHEN YOU ARE REDIRECTED FROM THE NOTIFICATIONS
      const id = window.location.pathname.replace("/tweet/", "");

      let tweetsToShow = [];

        var userData = {};

      const tweetsDB = firebase.database().ref().child("tweets");
      const usersDB = firebase.database().ref().child("users");

      tweetsDB.once("value", data => {
        let tweets = data.val()
        const keys = Object.keys(tweets)
        let count = 0;
        let approved;
        for (let i = 0; i < keys.length; i++){

          if (count === 1) break;

          approved = false;
          

          if (tweets[keys[i]]["tweetId"] === id) {

            approved = true;
            count++;

            //GET USER OF TWEET
            userData["id"] = tweets[keys[i]]["user"];
            
            
            //CHECK HOW MANY LIKES
            if (!!tweets[keys[i]]["likes"]){
              tweets[keys[i]]["likesNumber"]= tweets[keys[i]]["likes"].length;
            } else {
              tweets[keys[i]]["likesNumber"]= 0;
            }

            //NUMBER OF RETWEETS
            if(!!tweets[keys[i]]["retweetedBy"]) {
              tweets[keys[i]]["retweetedByNumber"] = tweets[keys[i]]["retweetedBy"].length;
            }

            //ORDERING DATE
            tweets[keys[i]]["orderingDate"] = tweets[keys[i]]["date"];

            //SHOWRETWEETEDBY
            tweets[keys[i]]["showRetweetedBy"] = false;

          } 

          if (approved) {
          tweetsToShow.push(tweets[keys[i]])
          }
        }      
        
      
      },error => {console.log(error)}).then(() => {

        usersDB.once("value", data => {
          const users = data.val();
          const keys = Object.keys(users)

          userData["userPage"] = true;            
          
 
          for (let i = 0; i < keys.length; i++) {
              if (userData["id"] === users[keys[i]]["id"] ) {
                  userData["email"] = users[keys[i]].email
                  userData["name"] = users[keys[i]].firstName
                  userData["following"] = [id];
              }
          }
         
      }).then(x =>{

        this.reRender(tweetsToShow, userData["userPage"]);
      
    })


      })
           

          
    }

    searchTweets() {
        let tweetsToShow = [];

        var userData = {};

      const tweetsDB = firebase.database().ref().child("tweets");
      const usersDB = firebase.database().ref().child("users");
           

          usersDB.once("value", data => {
            const users = data.val();
            const keys = Object.keys(users)

            const id = window.location.pathname.replace("/twitter-clone/", "");
            userData["userPage"] = id.length > 1;            
            

            let userEmail;
            if (!userData["userPage"]){     
            userEmail = firebase.auth().currentUser.email;
            }
            
            
            

            if (userData["userPage"]) {
              for (let i = 0; i < keys.length; i++) {
                if (id === users[keys[i]]["id"] ) {
                    userData["email"] = users[keys[i]].email
                    userData["name"] = users[keys[i]].firstName
                    userData["id"] = users[keys[i]].id
                    userData["following"] = [id];
                }
            }

            } else {

              for (let i = 0; i < keys.length; i++) {
                
                  if (userEmail === users[keys[i]]["email"] ) {
                      userData["email"] = users[keys[i]].email
                      userData["name"] = users[keys[i]].firstName
                      userData["id"] = users[keys[i]].id
                      userData["following"] = users[keys[i]].following;
                  }
              }
            }


            //THIS ADD TO FOLLOWING IS FOR SHOWING OWN USER'S TWEETS
            if (typeof(userData["following"]) === "undefined") {
              userData["following"] = [userData["id"]];
            } else {
              userData["following"].push(userData["id"]);
            }            
        }).then(x =>{

            tweetsDB.once("value", data => {
              let tweets = data.val()
              const keys = Object.keys(tweets)
              let count = 0;
              let approved;
              for (let i = 0; i < keys.length; i++){

                approved = false;
                

                if (this.matchUsers(userData["following"],tweets[keys[i]]["user"])) {

                  approved = true;

                  
                  
                  //CHECK HOW MANY LIKES
                  if (!!tweets[keys[i]]["likes"]){
                    tweets[keys[i]]["likesNumber"]= tweets[keys[i]]["likes"].length;
                  } else {
                    tweets[keys[i]]["likesNumber"]= 0;
                  }

                  //NUMBER OF RETWEETS
                  if(!!tweets[keys[i]]["retweetedBy"]) {
                    tweets[keys[i]]["retweetedByNumber"] = tweets[keys[i]]["retweetedBy"].length;
                  }

                  
                  tweets[keys[i]]["orderingDate"] = tweets[keys[i]]["date"];

                  //SHOWRETWEETEDBY
                  tweets[keys[i]]["showRetweetedBy"] = false;

                  //PUSH FOUND TWEET
                  /* tweetsToShow.push(tweets[keys[i]])
                  count++; */
                } 

                
                if (this.matchUsersRetweet(userData["following"],tweets[keys[i]]["retweetedBy"])) {

                  approved = true;


                  //CHECK HOW MANY LIKES
                  if (!!tweets[keys[i]]["likes"]){
                    tweets[keys[i]]["likesNumber"]= tweets[keys[i]]["likes"].length;
                  } else {
                    tweets[keys[i]]["likesNumber"]= 0;
                  }

                  //NUMBER OF RETWEETS
                  if(!!tweets[keys[i]]["retweetedBy"]) {
                    tweets[keys[i]]["retweetedByNumber"] = tweets[keys[i]]["retweetedBy"].length;
                  }

                  var matches = this.matchUsersRetweet(userData["following"],tweets[keys[i]]["retweetedBy"]);
                  
                  tweets[keys[i]]["matchingRetweeted"] = matches;

                  //ITS SUPPOSED TO TAKE THE LAST DATE
                  tweets[keys[i]]["orderingDate"] = matches[matches.length-1][1];
                  
                  //SHOWRETWEETEDBY
                  tweets[keys[i]]["showRetweetedBy"] = true;

                  //PUSH FOUND TWEET
                 
                }

                if (approved) {
                tweetsToShow.push(tweets[keys[i]])
                  count++;
                }
              }      
              
            
            },error => {console.log(error)})
            .then( x => {
            this.reRender(tweetsToShow, userData["userPage"]);
          })

        })


           
      
    }

    matchUsers(userId, tweetUser) { 
      if (typeof(userId) === "string") userId = [userId];
      return Boolean(userId.find(userId =>{
        return userId === tweetUser
      }))
    }

    matchUsersRetweet(following, retweetedBy) { 

      if (!retweetedBy) return false;

      let matchs = [];
      var found = undefined;

      for (let i = 0; i<retweetedBy.length; i++){
        found = following.find(followingUser =>{
          return followingUser === retweetedBy[i][0]
        })
        if (!!found) {
          matchs.push(retweetedBy[i])
        }
      }

      if (matchs.length === 0) {
        return false;
      }

      return matchs;
    }
    

    
    render() { 
  
            // SORTING FROM DATE
            var showingTweets = this.state.tweetsToShow.sort( (a,b) => {       
              var timeA = new Date(a["orderingDate"]).getTime()
              var timeB = new Date(b["orderingDate"]).getTime()
              return timeB - timeA;
              })

              var showingNewTweets = this.state.newTweets;

        return ( 
            <div className="timeLine-container">

              {this.state.userPage ?  null : <WriteTweet refreshRender={this.refreshRender}/>}

              {showingNewTweets.map((tweet,i) => {            
                      return (
                          <Tweet key={tweet.tweetId} tweet={tweet}/>
                      )
                  })
              }

              {showingTweets.map((tweet,i) => {           
                      return (
                          <Tweet key={i} tweet={tweet} />
                      )
                  })
              }
            </div>
         );
    }
}
 
export default TimeLine;