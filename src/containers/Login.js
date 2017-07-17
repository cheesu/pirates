import React from 'react';
import AdSense from 'react-adsense';
import { Authentication } from 'Components';
import { connect } from 'react-redux';
import { loginRequest } from 'Actions/authentication';

class Login extends React.Component {



  constructor(props) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
  }

  handleLogin(id, pw) {
         return this.props.loginRequest(id, pw).then(
             () => {
                 if(this.props.status === "SUCCESS") {
                     // create session data
                     let loginData = {
                         isLoggedIn: true,
                         username: id
                     };

                     //document.cookie = 'key=' + btoa(JSON.stringify(loginData));
                     //document.cookie = 'key=' + btoa(JSON.stringify(unescape(encodeURIComponent(loginData))));
                     document.cookie = 'key=' + btoa((encodeURIComponent(JSON.stringify(loginData))));


                     Materialize.toast('Welcome, ' + id + '!', 2000);
                     //browserHistory.push('/');
                     this.props.history.push('/game');

                     return true;
                 } else {
                     let $toastContent = $('<span style="color: #FFB4BA">Incorrect username or password</span>');
                     Materialize.toast($toastContent, 2000);
                     return false;
                 }
             }
         );
     }


  render() {
    return (

      <div>
        <AdSense.Google client='ca-pub-9010179770404458'
                slot='2879935324' />
        <Authentication mode={true}
           onLogin={this.handleLogin}/>
      </div>
    );
  }

}



const mapStateToProps = (state) => {
    return {
        status: state.authentication.login.status
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loginRequest: (id, pw) => {
            return dispatch(loginRequest(id,pw));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
