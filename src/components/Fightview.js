import React from 'react';
import { CurrentUser } from 'Components';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
class Fightview extends React.Component {

  constructor(props, context) {
          super(props, context);
          this.state = {
              chat: [''],
              socketCh:this.props.attackInfo.ch,
          };
          this.addChatData = this.addChatData.bind(this);
          this.socket = this.props.socket;
      }



    componentDidMount(){
      let addChat = this.addChatData.bind(this);
      this.props.socket.on(this.state.socketCh+"fight", function(data){ //전투 정보
        addChat(data);
      });

      this.props.socket.on(this.props.username+"fight", function(data){ //
      addChat(data);
      });
    }



    componentWillUnmount () {
      this.props.socket.off(this.state.socketCh+"fight");
      this.props.socket.off(this.props.username+"fight");


    }

    addChatData(data){
      this.setState({
        chat: this.state.chat.concat(data)
      });

      if(this.state.chat.length>80){
        let reData = this.state.chat;
        reData.splice(0,this.state.chat.length-80);
      }

      let objDiv =  document.getElementById("fightView");
      objDiv.scrollTop = objDiv.scrollHeight;
    }




    render(){
        return (
          <div id="fightView" className="fight-view">

            {this.state.chat.map(function(chat,i){

              if(chat.indexOf('[line098098098]')==0){
                return <p className="bla-bla-class chat-line" key={i}></p>
              }
              else if(chat.indexOf('[귓속말]')==0){
                return <p className="bla-bla-class whisper-chat" key={i}>{chat}</p>
              }
              else if(chat.indexOf('[공지사항]')==0){
                return <p className="bla-bla-class notice-chat" key={i}>{chat}</p>
              }
              else{
                return <p className="bla-bla-class" key={i}>{chat}</p>
              }
            })}


          </div>
        );
    }
}

export default Fightview;
