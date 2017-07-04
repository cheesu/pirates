import React from 'react';
import { connect } from 'react-redux';
import { Chat, Gameview , Controller, Mapview} from 'Components';
import { getStatusRequest  } from 'Actions/authentication';
import { userItemRequest  } from 'Actions/item';
const uri = 'http://127.0.0.1:3303/';
const options = { transports: ['websocket'] };


class Game extends React.Component {

  constructor(props, context) {
          super(props, context);
          this.state = {
              monster:null,
          };

          this.socket =io({'forceNew': true});
          this.setLocalMonster = this.setLocalMonster.bind(this);

      }

      componentWillUnmount(){
        console.log("home 윌 언마운트 소켓 디스커넥트 고침");

        this.socket.disconnect();
      }

      componentDidMount() {
        if(this.props.status.currentUser==""){
          this.props.history.push('/login');
        }
        else{
          this.socket.emit('addUser', this.props.status.currentUser, this.props.status.lv);
          this.socket.on(this.props.username+"[중복접속]", function(data){ //몹 채팅
          location.href="/login";
          });
        }



        // 몬스터 셋팅

        this.socket.on("setMonster", function(data){
          this.setLocalMonster(data);
        }.bind(this));


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

       // 몹 설정
   setLocalMonster(data){
         this.monster=data;
     }

    render() {
      const game = (
            <div className="view-container">
              <Mapview
                socket={this.socket}
                username = {this.props.status.currentUser}
                />

              <Gameview
                socket={this.socket}
                username = {this.props.status.currentUser}
                />
              <Chat
                socket={this.socket}
                username = {this.props.status.currentUser}
                />
              <Controller
                socket={this.socket}
                username = {this.props.status.currentUser}
                userInfo = {this.props.status}
                getStatusRequest = {this.props.getStatusRequest}
                userItemRequest = {this.props.userItemRequest}
                userItems = {this.props.userItems}
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
        status: state.authentication.status,
        userItems: state.item.items,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getStatusRequest: () => {
            return dispatch(getStatusRequest());
        },
        userItemRequest: () => {
            return dispatch(userItemRequest());
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Game);
