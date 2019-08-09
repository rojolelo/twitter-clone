import React, { Component } from 'react';
import firebase from  "firebase";
import SearchContainer from './SearchContainer';
import {Link} from "react-router-dom";
import NotificationsContainer from './Notifications/NotificationsContainer';

;
let usersArray = [];
let logged = false;
let firstCheck = false;

class Header extends Component {
    state = { 
        search: "",
        searchResult : [],
        profilepic: "https://cdn.britannica.com/67/197567-131-1645A26E.jpg",
        notifications: [],
        unseenNotifications: 0,
        showNotifications: false,
     }
    refSearch = React.createRef();

    Logout = this.Logout.bind(this)
    search = this.search.bind(this)
    LogIn = this.LogIn.bind(this)    

    LogIn() {
        window.location.replace("/twitter-clone/")        
    }

    componentDidMount(){

        
        

        

        
        firebase.auth().onAuthStateChanged((user) => {        
            if (user) { 
              const email = firebase.auth().currentUser.email;
              const usersDB = firebase.database().ref().child("users");
                let loggedUserId = false;
              let profilepic = "";

              usersDB.once("value", data =>{
                  const users = data.val();
                  const keys = Object.keys(users);

                  for (let i = 0; i < keys.length; i++) {
                      if (users[keys[i]]["email"] === email) {
                            loggedUserId = users[keys[i]]["id"];
                            
                          if (!!users[keys[i]]["profilepic"]) {
                               profilepic= users[keys[i]]["profilepic"];                               
                               break;                                
                          }
                      }
                  }                    
              }).then(() => {


                ////////NOTIFICATIONS

                if (loggedUserId){
                    usersDB.child(loggedUserId).child("notifications").on("value", snapshot =>{
                        
                        const newNotifications = snapshot.val()
                        let unseenNotifications = 0;


                        if (!!newNotifications){
                         for (let i = 0; i < newNotifications.length; i++){
                            if (newNotifications[i][2] === 0){
                                unseenNotifications++;
                            }
                         }
                        } else {
                            return null;
                        }

                        this.setState({ 
                            
                            unseenNotifications,
                            notifications: snapshot.val()
                        })
                    })
                }

                //////////////////

                  if (profilepic.length > 0){
                      this.setState({
                          profilepic,
                          logged: true
                      })
                  } else {
                      this.setState({
                          logged:true
                        })
                  }
              })
              
            }
          });
    }

    search() {     
        let searchResult=[];
        usersArray= []; 
        const usersDB = firebase.database().ref().child("users")
        const regex = new RegExp(this.refSearch.current.value, "i");

        if (this.refSearch.current.value === "") {
            this.setState({
                search: ""
            })
            return null;
        };

        usersDB.once("value", data =>{
            const users = data.val();
            const keys = Object.keys(users)            
            let count = 0;

            for (let i = 0; i < keys.length; i++)   {
                if (count > 5) return null;
                
                if (regex.test(users[keys[i]]["id"]) || regex.test(users[keys[i]]["firstName"])) {
                    usersArray.push(users[keys[i]]);
                    count++;
                }
            }
            
        }).then(x => {           
            searchResult = [... new Set (usersArray)];
            this.setState({
                searchResult, 
                search: this.refSearch.current.value
            })
        })
    }

    Logout(){
        this.props.logOut();
    }

    toggleSettings = () => {
        this.props.toggleSettings();
    }

    toggleNotifications = () => {
        this.setState({
            showNotifications: !this.state.showNotifications
        })
    }

    render() { 

        
        if (this.state.searchResult.length > 0) this.state.searchResult = getUnique(this.state.searchResult, "id");
        var next = false;

        function getUnique(arr,comp){

            //store the comparison  values in array
            const unique =  arr.map(e=> e[comp]). 
                    // store the keys of the unique objects
                    map((e,i,final) =>final.indexOf(e) === i && i) 
                    // eliminate the dead keys & return unique objects
                    .filter((e)=> arr[e]).map(e=>arr[e]);

            return unique
        }

        ///////////////////////////////////////////////////////////////

        let notificationsToShow;

        if (!!this.state.notifications) {
            const orderedNotifications = this.state.notifications.sort((a,b) => {
                var timeA = new Date(a[1]).getTime()
                var timeB = new Date(b[1]).getTime()
                  return timeB - timeA;
           })

           notificationsToShow = orderedNotifications.slice(0,9)
        }

        
////////////////////////////////////////////////////////////////////////
       
        if (this.state.logged) {
            return ( 
                <div className="header-container">
                    <div className="header-left">
                    <Link to="/">
                        <h3 className="header-button">Home</h3>
                    </Link>
                    <h3 className="header-button" onClick={this.toggleNotifications}>Notifications</h3>
                    {this.state.unseenNotifications > 0 ? <span className="header-notification-number">{this.state.unseenNotifications}</span> : null}
                    {this.state.showNotifications ? <NotificationsContainer notifications={notificationsToShow}/> : null}
                    <h3 className="header-button disabled-button" >Messages</h3>
                    </div>
                    <div className="header-mid">
                    <h3 id="header-logo">Logo</h3>    
                    </div>
                    <div className="header-right">
                    <input onChange={this.search} ref={this.refSearch} type="text" id="header-search" placeholder="Search..."/>
                    <SearchContainer search={this.state.searchResult} searchState={this.state.search}/>
                    <img id="header-profile-picture" onClick={this.toggleSettings} src={this.state.profilepic}/>
                    <button id="header-logout" onClick={this.Logout}>Log Out</button>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="header-container">
                    <div className="header-left">
                        <h3 className="header-button header-logout">Home</h3>
                        <h3 className="header-button header-logout">Notifications</h3>
                        <h3 className="header-button header-logout">Messages</h3>
                    </div>
                    <div className="header-mid">
                        <h3 id="header-logo">Logo</h3>    
                    </div>
                    <div className="header-right">
                        <input onChange={this.search} ref={this.refSearch} type="text" id="header-search" placeholder="Search..."/>
                        <SearchContainer search={this.state.searchResult} searchState={this.state.search} />
                        <img id="header-profile-picture" src="https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/512x512/plain/user.png"/>
                        <button id="header-logout" onClick={this.LogIn}>Log In</button>
                    </div>
                </div>
            )
        }
    }
}
 
export default Header;