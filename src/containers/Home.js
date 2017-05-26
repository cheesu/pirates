import React from 'react';
import { connect } from 'react-redux';
import { Chat, Gameview } from 'Components';
import { getStatusRequest  } from 'Actions/authentication';
const uri = 'http://127.0.0.1:3303/';
const options = { transports: ['websocket'] };


class Home extends React.Component {

  constructor(props, context) {
          super(props, context);
          console.log("홈 컨스트럭트 소켓 커넥션");
          //this.socket = io.connect('http://127.0.0.1:3303');
          this.socket =io({'forceNew': true});
          var userName = this.props.status.currentUser;
          this.socket.emit('addUser', userName);
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

           console.log(loginData);
           console.log("통과 이전");
           // if loginData is undefined, do nothing
           if(typeof loginData === "undefined") return;
           console.log("통과1");
           // decode base64 & parse json
           loginData = JSON.parse(atob(loginData));
           // if not logged in, do nothing
           if(!loginData.isLoggedIn) return;
           console.log("통과2");
           // page refreshed & has a session in cookie,
           // check whether this cookie is valid or not
           this.props.getStatusRequest().then(
               () => {
                 console.log("겟 스테이터스 리퀘스트 home");
                   console.log(this.props.status);
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
            <div>
              <Gameview
                socket={this.socket}
                />
              <Chat
                socket={this.socket}
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

export default connect(mapStateToProps, mapDispatchToProps)(Home);
