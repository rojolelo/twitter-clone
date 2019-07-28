import React, { Component } from 'react';
import firebase from  "firebase";
import SearchContainer from './SearchContainer';
import {Link} from "react-router-dom";

;
let usersArray = [];
let logged = false;
let firstCheck = false;

class Header extends Component {
    state = { 
        search: "",
        searchResult : [],
        profilepic: "https://cdn.britannica.com/67/197567-131-1645A26E.jpg"
     }
    refSearch = React.createRef();

    Logout = this.Logout.bind(this)
    search = this.search.bind(this)
    LogIn = this.LogIn.bind(this)    

    LogIn() {
        window.location.replace("/")        
    }

    componentDidMount(){
        firebase.auth().onAuthStateChanged((user) => {        
            if (user) { 
              const email = firebase.auth().currentUser.email;
              const usersDB = firebase.database().ref().child("users");
              let profilepic = "";

              usersDB.once("value", data =>{
                  const users = data.val();
                  const keys = Object.keys(users);

                  for (let i = 0; i < keys.length; i++) {
                      if (users[keys[i]]["email"] === email) {
                          if (!!users[keys[i]]["profilepic"]) {
                               profilepic= users[keys[i]]["profilepic"];
                               break;                                
                          }
                      }
                  }                    
              }).then(() => {
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

        
////////////////////////////////////////////////////////////////////////
       
        if (this.state.logged) {
            return ( 
                <div className="header-container">
                    <div className="header-left">
                    <Link to="/">
                        <h3 className="header-button">Home</h3>
                    </Link>
                    <h3 className="header-button">Notifications</h3>
                    <h3 className="header-button">Messages</h3>
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