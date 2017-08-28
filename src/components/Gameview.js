import React from 'react';
import { CurrentUser } from 'Components';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import cookie from 'react-cookies'
class Gameview extends React.Component {

  constructor(props, context) {
          super(props, context);
          this.state = {
              search: false,
              chat: ['test'],
              socketCh:'0-0'
          };
          this.addChatData = this.addChatData.bind(this);
          this.toggleSearch = this.toggleSearch.bind(this);
          this.setSocketCh = this.setSocketCh.bind(this);
          this.socket = this.props.socket;

      }

      toggleSearch(){
          this.setState({
              search: !this.state.search
          });
      }

    componentDidMount(){
      let addChat = this.addChatData.bind(this);
      this.props.socket.on(this.state.socketCh, function(data){ //현재공간 채팅
        addChat(data);
      });

      this.props.socket.on(this.props.username, function(data){ //귓말
      //  addChat(data);
      addChat(data);
      });


      this.props.socket.on('private', function(data){ //개인
      //  addChat(data);
      addChat(data);
      });

      this.props.socket.on('Gchat', function(data){ //전챗
        addChat(data);
      });

      this.props.socket.on('NoticeChat', function(data){ //공지
        addChat(data);
      });
      this.props.socket.on('slaveInfoChat', function(data){ //노예정보
        addChat(data);
      });

      let setSocketCh = this.setSocketCh.bind(this);
      this.props.socket.on('setLocalCh', function(data){ //채널 셋팅
        setSocketCh(data);
      });



    }

    setSocketCh(ch){
      this.socket.off(this.state.socketCh);
      this.setState({
        socketCh:ch
      });
      let addChat = this.addChatData.bind(this);
      this.props.socket.on(this.state.socketCh, function(data){ //응답
        addChat(data);
      });
    }


    componentWillUnmount () {
    }

    addChatData(data){

      this.setState({
        chat: this.state.chat.concat(data)
      });

      if(this.state.chat.length>10){
        this.setState({
          chat: []
        });
      }

      let chat = data;
      let mode =   cookie.load("mode");
      let addText = "<p>"+data+"</p>"

      if(mode=="comp"){

                if(chat.indexOf('[monsterDieMsg]')==0){
                  let _text = chat;
                  _text = _text.substr(15,_text.length);
                  addText =  "<p class='bla-bla-class' >"+_text+"</p>";
                }else if(chat.indexOf('[몬스터]')==0){
                  let _text = chat;
                  _text = _text.substr(5,_text.length);
                  addText =  "<p class='bla-bla-class'> "+_text+"}</p>";
                }else if(chat.indexOf('[line098098098]')==0){
                  addText =  "<p class='bla-bla-class chat-line'></p>";
                }
                else{
                    addText =  "<p class='bla-bla-class' >"+chat+"</p>";
                }
              }
        else{

              if(chat.indexOf('[휴식]')==0){
                addText =  "<p class='bla-bla-class chat-green' >"+chat+"</p>";
              }
              else if(chat.indexOf('[line098098098]')==0){
                addText =  "<p class='bla-bla-class chat-line' ></p>";
              }
              else if(chat.indexOf('[몬스터]')==0){
                let _text = chat;
                _text = _text.substr(5,_text.length);
                addText =  "<p class='bla-bla-class chat-setmonster' ><span class='chat-setmonster-span'></span> "+_text+"</p>";
              }
              else if(chat.indexOf('[귓속말]')==0){
                addText =  "<p class='bla-bla-class whisper-chat' >"+chat+"</p>";
              }
              else if(chat.indexOf('[시스템]')==0){
                addText =  "<p class='bla-bla-class system-chat' >"+chat+"</p>";
              }
              else if(chat.indexOf('...')==0){
                addText =  "<p class='bla-bla-class chat-map-effect'  ><span class='chat-map-effect-span'></span>  "+chat+"</p>";
              }
              else if(chat.indexOf('[공지사항]')==0){
                addText =  "<p class='bla-bla-class notice-chat' >"+chat+"</p>";
              }
              else if(chat.indexOf('한계')==0){
                addText =  "<p class='bla-bla-class levelup-chat' >"+chat+"</p>";
              }
              else if(chat.indexOf('[LEVEL UP!!]')==0 || chat.indexOf('[강화]')==0){
                addText =  "<p class='bla-bla-class levelup-chat' >"+chat+"</p>";
              }
              else if(chat.indexOf('막혀서')==0||chat.indexOf('벽에')==0){
                addText =  "<p class='bla-bla-class blocking-chat' >"+chat+"</p>";
              }
              else if(chat.indexOf('[monsterDieMsg]')==0){
                let _text = chat;
                _text = _text.substr(15,_text.length);
                addText =  "<p class='bla-bla-class mon-die-chat' >"+_text+"</p>";
              }
              else{
                addText =  "<p class='bla-bla-class' >"+chat+"</p>";
              }
        }

      if($(".bla-bla-class").length>200){
        $(".bla-bla-class").remove();
      }


      $("#gameChatView").append(addText);


      var objDiv = document.getElementById("gameChatView"); objDiv.scrollTop = objDiv.scrollHeight;
      var objDiv = null;
      data = null;
    }


    shouldComponentUpdate(nextProps, nextState) {
            let current = {
                chat: this.state.chat,
                search: this.state.search

            };
          let next = {
              chat: nextState.chat,
              search: nextState.search
          };
          let update = JSON.stringify(current) !== JSON.stringify(next);
          nextProps = null;
          nextState = null;
            return update;
        }

    render(){

        return (
          <div id="gameChatView" className="game-view">
            <div className="current-user-list-btn">
              <ul>
                  <li>현재 위치:<span>{this.state.socketCh}</span></li>
                  <li><a onClick={this.toggleSearch}><i className="material-icons">search</i></a></li>
              </ul>
            </div>


                <ReactCSSTransitionGroup transitionName="search" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                     { /* IMPLEMENT: SHOW SEARCH WHEN SEARCH STATUS IS TRUE */}
                     {this.state.search ? <CurrentUser onClose={this.toggleSearch}
                                                  onSearch={this.props.onSearch}
                                                  socket={this.socket}
                                                  /> : undefined }
                </ReactCSSTransitionGroup>

          </div>
        );
    }
}

export default Gameview;
