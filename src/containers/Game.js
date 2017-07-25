import React from 'react';
import { connect } from 'react-redux';
import { Chat, Gameview , Controller, Mapview,HomeText} from 'Components';
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
          this.handleKeyPress = this.handleKeyPress.bind(this);
      }

  handleKeyPress(e) {
  //  $("#contrillerContainer").focus();
  }

      componentWillUnmount(){
        console.log("home 윌 언마운트 소켓 디스커넥트 고침");
        this.socket.disconnect();
      }

      componentDidMount() {
        this.props.getStatusRequest();
        // 몬스터 셋팅

            if(this.props.status.currentUser==""){
              //  this.props.history.push('/login');
              }
              else{
                this.socket.emit('addUser', this.props.status.currentUser, this.props.status.lv);
                this.socket.on(this.props.username+"[중복접속]", function(data){ //몹 채팅
                location.href="/login";
                });
              }

       }

       componentDidUpdate(prevProps, prevState){
         if(prevProps.status.currentUser=="" && this.props.status.currentUser!=""){
           console.log("재접 애드유저");
           this.socket.emit('addUser', this.props.status.currentUser, this.props.statuslv);
         }
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

      const homeText = (<HomeText />)

        return (
            <div className="wrapper" onKeyPress={this.handleKeyPress}>
                { this.props.status.currentUser != "" && typeof this.props.username === "undefined" ? game :homeText }
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
