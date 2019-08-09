import React from 'react';
import firebase from "firebase";
import {BrowserRouter, Switch, Link, Route} from "react-router-dom"
import Header from './components/Header';
import TimeLine from './components/TimeLine';
import UserBox from './components/UserBox';
import LandingPage from './components/LandingPage';
import RegisterPopUp from './components/RegisterPopUp';
import LoggedLanding from './components/LoggedLanding';
import Loading from './components/Loading';
import UserPage from './components/UserPage';
import ChangeThings from './components/ChangeThings';

const firebaseConfig = {
    apiKey: "AIzaSyCbz4cCoC6aj2XaDIpqp4E7uKfUIuLkij0",
    authDomain: "directorio-de-negocios-a257b.firebaseapp.com",
    databaseURL: "https://directorio-de-negocios-a257b.firebaseio.com",
    projectId: "directorio-de-negocios-a257b",
    storageBucket: "directorio-de-negocios-a257b.appspot.com",
    messagingSenderId: "156581943217",
    appId: "1:156581943217:web:2838e8736b764738"
}

firebase.initializeApp(firebaseConfig);

const usersDB = firebase.database().ref().child("users")
const tweetsDB = firebase.database().ref().child("tweets")

let logged = false;
let loading = true;
let firstCheck = false;
let stateSetted = false;

const Extructura = {
  "id" : "rojolelo",
  "firstName" : "Ronny",
  "lastName" : "Legones",
  "email" : ["otrocorreo@correo.com"],
  "following": [],
   "followers" : []
}


export default class App extends React.Component {
	state= {
    showPopUp: false,
    loading: loading,
  }
  toggleRegisterPopUp = this.toggleRegisterPopUp.bind(this)
  register = this.register.bind(this)
  logIn = this.logIn.bind(this)
  logOut = this.logOut.bind(this);

  loadingFalse = () => {
    this.setState({
      loading:false
    })
  }

  toggleRegisterPopUp(){
    this.setState({
      showPopUp: !this.state.showPopUp
    })
  }

  logIn(email, password){
    this.setState({loading: true})
    firebase.auth().signInWithEmailAndPassword(email, password).catch(error => {
      if (error.code === "auth/invalid-email"){
        window.alert("The email address is badly formatted")
      } else if (error.code === "auth/wrong-password"){
        window.alert("The password you entered is incorrect")
      } else if (error.code === "auth/user-not-found"){
        window.alert("The user doesnt exist.")
      }
    }).then(() => {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          logged = true;
          this.setState({
            loading:false
          })
        } else {
          this.setState({loading:false})
        }
      })
    })  
  }

  logOut(){
    firebase.auth().signOut().then(()=>{
      logged = false;
      window.location.replace("/twitter-clone/")
      this.setState({})
  });
  }
  
  register(userData){{
    console.log(userData)

    const {name, userId, email, password} = userData;


    const newUser = {
      "id" : userId,
      "firstName" : name,
      "email" : email,
      "following": [],
       "followers" : []
    }

    var userCredential = firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
      // Handle Errors here.
      console.log(error.code);
      console.log(error.message);
      // ...
    }).then(result => {
      if (result) {
        usersDB.child(userId).update(newUser)        
      }
      console.log("user in db")

      firebase.auth().signInWithEmailAndPassword(email, password).catch(error => {
        console.log(error)
      }).then(result => {
        window.location.reload()
      })  
    })
    
  }}

  toggleSettings = () => {
    this.setState({
      toggleSettings: !this.state.toggleSettings
    })
  }

  renderLogged() {
    return (
      <BrowserRouter basename={process.env.PUBLIC_URL}>

                <Route exact path={"/tweet/:id"} render={() => {
                  const id = window.location.pathname.replace("/tweet/", "")
                    return (
                      <React.Fragment>
                        <Header logOut={this.logOut} toggleSettings={this.toggleSettings}/>

                        {this.state.toggleSettings ? <ChangeThings toggleSettings={this.toggleSettings}/> : null}
                    
                        <LoggedLanding key={id}/>
                      </React.Fragment>
                  )
                }}/>
                
                <Route exact path={"/:id"} render={() => {
                    const id = window.location.pathname.replace("/twitter-clone/", "")
                    return (
                      <React.Fragment>
                        <Header logOut={this.logOut} key={id} toggleSettings={this.toggleSettings}/>
                    
                        {this.state.toggleSettings ? <ChangeThings toggleSettings={this.toggleSettings}/> : null}

                        <UserPage key={id} id={id}/>
                      </React.Fragment>
                  )
                }}/>
                
                <Route exact path={"/"} render={() => {
                    return (
                      <React.Fragment>
                        <Header logOut={this.logOut} toggleSettings={this.toggleSettings}/>

                        {this.state.toggleSettings ? <ChangeThings toggleSettings={this.toggleSettings}/> : null}
                    
                        <LoggedLanding/>
                      </React.Fragment>
                  )
                }}/>
        </BrowserRouter>
    )
  }
 
  renderNoLogged(){
    return (
        <BrowserRouter basename={process.env.PUBLIC_URL}>
            <Route exact path={"/:id"} render={() => {
                    const id = window.location.pathname.replace("/twitter-clone/", "")
                    return (
                      <React.Fragment key={id}>
                        <Header logOut={this.logOut}/>
                    
                      
                        <UserPage key={id}/>
                      </React.Fragment>
                  )
                }}/>  

            <Route exact path={"/"} render={() => {
                return (
                  <React.Fragment>
                  {this.state.showPopUp ? <RegisterPopUp toggleRegisterPopUp={this.toggleRegisterPopUp} register={this.register} /> : null}
                  {this.state.loading ? <Loading/> : null}
                  <LandingPage 
                  logIn={this.logIn}
                  toggleRegisterPopUp={this.toggleRegisterPopUp}/>                  
                  </React.Fragment>
                )
            }}/>
        </BrowserRouter>
        )
  }
  

	render() {

// Loading for checking already Logged user    
      if (!firstCheck) {
        firebase.auth().onAuthStateChanged(function(user) {        
          if (user) {
            firstCheck = true;  
            logged=true;
            loading = false;              

          } else {
            loading = false;
            firstCheck = true;            
          }
        });        
      } 

        var interval = setInterval( x => {
          if (stateSetted === false && firstCheck) {
            stateSetted = true;
            this.setState({
              loading: false
            })
          }
        }, 2000)
///////////////////////////////////////////////////      

      

        
        if (logged) {          
          return (
            <React.Fragment>
              {this.renderLogged()}
            </React.Fragment>
          )
        } else {
          return (
            <React.Fragment>
              {this.renderNoLogged()}
            </React.Fragment>
          )
        } 
	}
}


