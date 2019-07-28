import React, { Component } from 'react';
import TimeLine from "./TimeLine";
import firebase from "firebase";
import UserBoxInUserPage from './UserBoxInUserPage';


class UserPage extends Component {
    state = { 
        loaded : false,
        coverpic: false,
     }

     componentDidMount(){

        const usersDB = firebase.database().ref().child("users");
        const id = this.props.id;
        let coverpic = false;

        usersDB.once("value", data => {
            const users = data.val();
            const keys = Object.keys(users)
            

            for (let i = 0; i < keys.length; i++) {
                if (id === users[keys[i]]["id"]) {
                    if (!!users[keys[i]]["coverpic"]) {
                        coverpic = users[keys[i]]["coverpic"]
                    }
                   
                }

            }
        }).then(() => {
            if (!coverpic) {
                coverpic = "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80"
            }
        this.setState({
                    coverpic
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
            height: 300+"px",
            width: 100+"%",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundImage: `url(${image})`,
            backgroundColor: "white",
            marginTop: "50px"
        }
        return ( 
            <React.Fragment>  

                <div className="userpage-background" style={style}></div>             

                <div className="app-container app-container-userPage">

                
                                    <div className="app-left">
                                    <UserBoxInUserPage/>
                                    </div>
                        
                                    <div className="app-mid">
                                    <TimeLine/>
                                    </div>
                </div>
            </React.Fragment>
         );
    }
}
 
export default UserPage;