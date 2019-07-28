import React from 'react'

class RegisterPopUp extends React.Component {

    register = this.register.bind(this)

    refName= React.createRef()
    refEmail= React.createRef()
    refPassword= React.createRef()
    refUserId = React.createRef()

    register(e){
        e.preventDefault()

        const name=this.refName.current.value
        const userId= this.refUserId.current.value
        const email=this.refEmail.current.value
        const password=this.refPassword.current.value

        if (name.length < 2) {
            window.alert("Your name is too short.")
            return null;
        } else if (userId.length < 4) {
            window.alert("Your user id is too short.")
            return null;
        } else if (email.length < 5) {
            window.alert ("Your email is too short")
            return null;
        } else if (password < 4){
            window.alert("Your password is too short.")
            return null;
        }

        const registerData = {
            name,
            email,
            password,
            userId
        }
        
        this.props.register(registerData);
    }
    render(){
    return ( 
        <div className="register-popup-container" >
            <div className="register-popup-inner">
                <h1>Register</h1>
                
                <form onSubmit={this.register}>
                    <div>
                        <label>Name:</label>
                        <input type="text" maxLength={20} placeholder="your name" ref={this.refName}/>
                    </div>
                    <div>
                        <label>User ID:</label>
                        <input type="text" maxLength={15} placeholder="your id" ref={this.refUserId}/>
                    </div>
                    <div>
                        <label>E-mail:</label>
                        <input type="email" maxLength={30} placeholder="your email" ref={this.refEmail}/>
                    </div>
                    <div>
                        <label>Password:</label>
                        <input type="text" maxLength={16} placeholder="password" ref={this.refPassword}/>
                    </div>
                <button type="submit">Sign Up</button>
                </form>
                <button type="button" onClick={this.props.toggleRegisterPopUp}>Close</button>
            </div>
        </div>
     );}
}
 
export default RegisterPopUp;