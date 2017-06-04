import React from 'react';
import { connect } from 'react-redux';
import { Chat, Gameview , Controller} from 'Components';
import { getStatusRequest  } from 'Actions/authentication';
const uri = 'http://127.0.0.1:3303/';
const options = { transports: ['websocket'] };


class Game extends React.Component {

  constructor(props, context) {
          super(props, context);
          //this.socket = io.connect('http://127.0.0.1:3303');
        //  this.socket =io('http://localhost:4000/twon',{'forceNew': true});
          this.socket =io({'forceNew': true});
        //  this.socket =io('http://localhost:4000/twon');
          var userName = this.props.status.currentUser;
          this.socket.emit('addUser', userName);
          //this.socket.emit('chat', userName);
      }

      componentWillUnmount(){
        console.log("home 윌 언마운트 소켓 디스커넥트 고침");

        this.socket.disconnect();
      }

      componentDidMount() {
           // get cookie by name
           function getCookie(name) {
               var value = "; " + document.cookie;
               var parts = value.split("; " + name + "=");
               if (parts.length == 2) return parts.pop().split(";").shift();
           }

           // get loginData from cookie
           let loginData = getCookie('key');
           // if loginData is undefined, do nothing
           if(typeof loginData === "undefined") return;
           // decode base64 & parse json
           loginData = JSON.parse(atob(loginData));
           // if not logged in, do nothing
           if(!loginData.isLoggedIn) return;
           // page refreshed & has a session in cookie,
           // check whether this cookie is valid or not
           this.props.getStatusRequest().then(
               () => {
                   // if session is not valid
                   if(!this.props.status.valid) {
                       // logout the session
                       loginData = {
                           isLoggedIn: false,
                           username: ''
                       };

                       document.cookie='key=' + btoa(JSON.stringify(loginData));

                       // and notify
                       let $toastContent = $('<span style="color: #FFB4BA">Your session is expired, please log in again</span>');
                       Materialize.toast($toastContent, 4000);

                   }
               }
           );
       }

    render() {
      const game = (
            <div className="view-container">
              <Gameview
                socket={this.socket}
                socketG={this.socketG}
                username = {this.props.status.currentUser}
                />
              <Chat
                socket={this.socket}
                socketG={this.socketG}
                username = {this.props.status.currentUser}
                />
              <Controller
                socket={this.socket}
                socketG={this.socketG}
                username = {this.props.status.currentUser}
                />
            </div>
      );

        return (
            <div className="wrapper">
                { this.props.isLoggedIn && typeof this.props.username === "undefined" ? game : undefined }
            </div>
        );
    }
}



const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.authentication.status.isLoggedIn,
        status: state.authentication.status
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getStatusRequest: () => {
            return dispatch(getStatusRequest());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);
