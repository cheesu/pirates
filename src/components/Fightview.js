import React from 'react';
import { CurrentUser } from 'Components';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import cookie from 'react-cookies'
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

      this.props.socket.on(this.props.attackInfo.userName+"fight", function(data){ //
      addChat(data);
      });
    }



    componentWillUnmount () {
      this.props.socket.off(this.state.socketCh+"fight");
      this.props.socket.off(this.props.attackInfo.userName+"fight");


    }

    addChatData(data){
    /*  this.setState({
        chat: this.state.chat.concat(data)
      });

      if(this.state.chat.length>250){
        this.setState({
          chat: []
        });
      }*/

      let chat = data;
      let mode =   cookie.load("mode");
      let addText = "<p>"+data+"</p>"

     try{
      if(mode=="comp"){
          if(chat.indexOf('[line098098098]')==0){
            addText =" <p class='bla-bla-class' ></p>";
          }else if(chat.indexOf('[monsterDieMsg]')==0){
            let _text = chat;
            _text = _text.substr(15,_text.length);
            addText =" <p class='bla-bla-class' >"+_text+"</p>";
          }else{
            addText =" <p class='bla-bla-class' >"+chat+"</p>";
          }
      }
      else{
        if(chat.indexOf('[피격]')==0){
               addText =" <p class='bla-bla-class chat-Shoot' >"+chat+"</p>";
             }
             else if(chat.indexOf('[item]')==0){
               addText =" <p class='bla-bla-class chat-item' >"+chat+"</p>";
             }
             else if(chat.indexOf('[skill]')==0){
               addText =" <p class='bla-bla-class chat-skill' >"+chat+"</p>";
             }
             else if(chat.indexOf('[line098098098]')==0){
               addText =" <p class='bla-bla-class chat-line' ></p>";
             }
             else if(chat.indexOf('[귓속말]')==0){
               addText =" <p class='bla-bla-class whisper-chat' >"+chat+"</p>";
             }
             else if(chat.indexOf('[공지사항]')==0){
               addText =" <p class='bla-bla-class notice-chat' >"+chat+"</p>";
             }
             else if(chat.indexOf('[시스템]')==0){
               addText =" <p class='bla-bla-class system-chat' >"+chat+"</p>";
             }
             else if(chat.indexOf('Critical!!!!')==0){
               addText =" <p class='bla-bla-class cri-chat' >"+chat+"</p>";
             }
             else if(chat.indexOf('[monsterDieMsg]')==0){
               let _text = chat;
               _text = _text.substr(15,_text.length);
               addText =" <p class='bla-bla-class mon-die-chat' >"+_text+"</p>";
             }
           else{
             addText =" <p class='bla-bla-class' >"+chat+"</p>";
           }
         }
       }catch (e) {
           console.log(e);
           addText =" <p class='bla-bla-class' >채팅창 오류... 복구중....</p>";
      } finally{
      }






      if($(".bla-bla-class").length>150){
        $(".bla-bla-class").remove();
      }
      $("#fightView").append(addText);

      let objDiv =  document.getElementById("fightView");
      objDiv.scrollTop = objDiv.scrollHeight;
    }


    shouldComponentUpdate(nextProps, nextState) {
      let current = {
          chat: this.state.chat,
          };
      let next = {
          chat: nextState.chat,
          };
      let update = JSON.stringify(current) !== JSON.stringify(next);
      return update;
    }

    render(){
        return (
          <div id="fightView" className="fight-view">

          </div>
        );
    }
}

export default Fightview;
