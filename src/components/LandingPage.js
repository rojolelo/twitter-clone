import React from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch, faPeopleCarry, faComment as faReply} from "@fortawesome/free-solid-svg-icons";

class LandingPage extends React.Component {

    logIn = this.logIn.bind(this);

    emailRef = React.createRef()
    passwordRef = React.createRef();

    logIn(e){
        e.preventDefault();

        const email = this.emailRef.current.value;
        const password = this.passwordRef.current.value;

        this.props.logIn(email,password)
    }

    render(){
            return (  
            
            <div className="landing-page-container">
                <div className="landing-page-left">
                    <div className="landing-page-left-text-container">
                        <div className="landing-page-left-1 landing-page-left-text">
                            <h3><FontAwesomeIcon icon={faSearch}/>    Twitter Clone</h3>
                        </div>
                        <div className="landing-page-left-2 landing-page-left-text">
                            <h3><FontAwesomeIcon icon={faPeopleCarry}/>    Made by:</h3>
                        </div>
                        <div className="landing-page-left-3 landing-page-left-text">
                            <h3><FontAwesomeIcon icon={faReply}/>    Ronny Legones</h3>
                        </div>
                    </div>
                </div>

                <div className="landing-page-right">
                    <div className="landing-page-login">
                        <form onSubmit={this.logIn}>
                        <input className="login-input" ref={this.emailRef} type="text" placeholder="Email or Username"/>
                        <input className="login-input" ref={this.passwordRef} type="password" placeholder="Password"/>
                        <button className="login-btn" type="submit" >Login</button>                        
                        </form>
                        <p className="login-forgot">Forgot your password?</p>
                    </div>


                    <div className="landing-page-right-text-container">
                        <div className="landing-page-right-box">
                            <div className="landing-page-right-box-text">
                                <FontAwesomeIcon icon={faSearch}/>
                                <h3 id="hola">    Discover what is happening at this moment.</h3>
                            </div>
                            <div className="landing-page-right-box-join">
                                <h3 className="join-twitter">Join Twitter today.</h3>
                                <div className="landing-page-btn-signup" onClick={this.props.toggleRegisterPopUp}>Sign Up</div>
                                <div className="landing-page-btn-login">Login</div>
                            </div>
                        </div>                    
                    </div>
                </div>

                

                <div className="landing-page-footer">

                </div>
            </div>
        );}
}
 
export default LandingPage;