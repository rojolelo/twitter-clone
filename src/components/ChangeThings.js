import React, { Component } from 'react';
import firebase from "firebase";

class ChangeThings extends Component {
    state = { 
        profilePic: "",
        coverPic: "",
        loading: "",
        completed: false,
        filesToUpload: 0,
        uploadedFiles: 0,
        profileLink: "",
        coverLink: "",
     }

    profilePicHandler = (e) => {
         const profilePicFile = e.target.files[0]

         this.setState({
             profilePic: profilePicFile
         })
     }

    coverPicHandler = (e) => {
        const coverPicFile = e.target.files[0]

        this.setState({
            coverPic: coverPicFile
        })
    }

    //////////////////////////////////////////////////////////////////////////

    upload = (e) => {
        const profilePic = this.state.profilePic;
        const coverPic = this.state.coverPic;   

        const usersDB = firebase.database().ref().child("users");

        const email = firebase.auth().currentUser.email;
        const profileStorageRef = firebase.storage().ref(`/${email}/profilepics/${profilePic.name}`)
        const coverStorageRef = firebase.storage().ref(`/${email}/coverpics/${coverPic.name}`)
        


        if (typeof(this.state.profilePic) === "object" && typeof(this.state.coverPic) === "object"){

            this.setState({filesToUpload: 2})
            
             profileStorageRef.put(profilePic).on("state_changed",snapshot => {
                let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                this.setState({loading: percentage})

            }, error => {
                console.log(error);  

            }, () => {
                //UPLOAD PROFILEPIC LINK
                usersDB.once("value", data => {
                    const users = data.val();
                    const keys = Object.keys(users);

                    profileStorageRef.getDownloadURL().then((url) => {
                        for (let i = 0; i < keys.length; i++){
                            if (users[keys[i]]["email"] === email) {
                                usersDB.child(users[keys[i]]["id"]).child("profilepic").set(url)                             
                                break;
                            }
                        }
                    })

                    
                }).then(() => {
                    this.setState({
                        completed: false,
                        loading: 0,
                        uploadedFiles: 1,
                    })                    
                })

                //UPLOAD COVERPIC LINK
                coverStorageRef.put(coverPic).on("state_changed",snapshot => {
                    let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    this.setState({loading: percentage})
                }, error => {
                    console.log(error);                
                }, () => {
                    usersDB.once("value", data => {
                        const users = data.val();
                        const keys = Object.keys(users);
    
                        coverStorageRef.getDownloadURL().then((url) => {
                            for (let i = 0; i < keys.length; i++){
                                if (users[keys[i]]["email"] === email) {
                                    usersDB.child(users[keys[i]]["id"]).child("coverpic").set(url)                             
                                    break;
                                }
                            }
                        })
    
                        
                    }).then(() => {
                        this.setState({
                            completed: true,
                            loading: 0,
                            uploadedFiles: 2,
                        })
                    })
                })
            } )
        } else if (typeof(this.state.profilePic) === "object" && typeof(this.state.coverPic) === "string") {
            
            //UPLOAD ONLY PROFILEPIC
            this.setState({filesToUpload: 1})

            profileStorageRef.put(profilePic).on("state_changed",snapshot => {
                let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                this.setState({loading: percentage})
            }, error => {
                console.log(error);                
            }, () => {


                usersDB.once("value", data => {
                    const users = data.val();
                    const keys = Object.keys(users);

                    profileStorageRef.getDownloadURL().then((url) => {
                        for (let i = 0; i < keys.length; i++){
                            if (users[keys[i]]["email"] === email) {
                                usersDB.child(users[keys[i]]["id"]).child("profilepic").set(url)                             
                                break;
                            }
                        }
                    })

                    
                }).then(() => {
                    this.setState({
                        completed: true,
                        loading: 0,
                        uploadedFiles: 1,
                    })
                })

            } )

        } else {

            //UPLOAD ONLY COVERPIC
            this.setState({filesToUpload: 1})

            coverStorageRef.put(coverPic).on("state_changed",snapshot => {
                let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                this.setState({loading: percentage})
            }, error => {
                console.log(error);                
            }, () => {
                usersDB.once("value", data => {
                    const users = data.val();
                    const keys = Object.keys(users);

                    coverStorageRef.getDownloadURL().then((url) => {
                        for (let i = 0; i < keys.length; i++){
                            if (users[keys[i]]["email"] === email) {
                                usersDB.child(users[keys[i]]["id"]).child("coverpic").set(url)                             
                                break;
                            }
                        }
                    })

                    
                }).then(() => {
                    this.setState({
                        completed: true,
                        loading: 0,
                        uploadedFiles: 1,
                    })
                })
            })
        }

}

    toggleSettings = () => {
        this.props.toggleSettings();
    }

    render() { 

        

        return ( 
            <div className="changeThings-container">
                <div className="changeThings-content">
                    <form >
                    <h3>Change Profile Picture</h3>
                    <input type="file" onChange={this.profilePicHandler} className="upload-image" name="profile-picture-file"/>
                    <h3>Change Big Profile Picture</h3>
                    <input type="file" onChange={this.coverPicHandler} className="upload-image" name="profileBig-picture-file"/>
                    <div className="changeThings-buttons">
                        {this.state.loading > 0 ? <h3>Uploading... {this.state.uploadedFiles} of {this.state.filesToUpload} </h3> : null}
                        {this.state.completed ? <h3>Image{"(s)"} uploaded.</h3> : null}
                    <button type="button" onClick={this.upload} className="upload-button">Upload</button>
                    
                    <button type="button" onClick={this.toggleSettings} className="close-button">Close</button>
                    </div>
                    </form>
                </div>   
            </div>
         );
    }
}
 
export default ChangeThings;