import React from 'react';
import { CurrentUser } from 'Components';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
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

      if(this.state.chat.length>80){
        let reData = this.state.chat;
        reData.splice(0,this.state.chat.length-80);
      }

      var objDiv = document.getElementById("gameChatView"); objDiv.scrollTop = objDiv.scrollHeight;
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
            {this.state.chat.map(function(chat,i){
              if(chat.indexOf('[휴식]')==0){
                return <p className="bla-bla-class chat-green" key={i}>{chat}</p>
              }
              else if(chat.indexOf('[line098098098]')==0){
                return <p className="bla-bla-class chat-line" key={i}></p>
              }
              else if(chat.indexOf('[몬스터]')==0){
                let _text = chat;
                _text = _text.substr(5,_text.length);
                return (<p className="bla-bla-class chat-setmonster" key={i}><span className="chat-setmonster-span"></span> {_text}</p>);
              }
              else if(chat.indexOf('[귓속말]')==0){
                return <p className="bla-bla-class whisper-chat" key={i}>{chat}</p>
              }
              else if(chat.indexOf('[시스템]')==0){
                return <p className="bla-bla-class system-chat" key={i}>{chat}</p>
              }
              else if(chat.indexOf('...')==0){
                return (<p className="bla-bla-class chat-map-effect" key={i} contenteditable><span className="chat-map-effect-span"></span>  {chat}</p>);
              }
              else if(chat.indexOf('[공지사항]')==0){
                return <p className="bla-bla-class notice-chat" key={i}>{chat}</p>
              }
              else if(chat.indexOf('[LEVEL UP!!]')==0){
                return <p className="bla-bla-class levelup-chat" key={i}>{chat}</p>
              }
              else{
                return <p className="bla-bla-class" key={i}>{chat}</p>
              }
            })}


                <ReactCSSTransitionGroup transitionName="search" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                     { /* IMPLEMENT: SHOW SEARCH WHEN SEARCH STATUS IS TRUE */}
                     {this.state.search ? <CurrentUser onClose={this.toggleSearch}
                                                  onSearch={this.props.onSearch}
                                                  socket={this.socket}
                                                  /> : undefined }
                </ReactCSSTransitionGroup>



                <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
                <defs>
                  <filter id="squiggly-0">
                    <feTurbulence id="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" seed="0"/>
                    <feDisplacementMap id="displacement" in="SourceGraphic" in2="noise" scale="6" />
                  </filter>
                  <filter id="squiggly-1">
                    <feTurbulence id="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" seed="1"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
                  </filter>

                  <filter id="squiggly-2">
                    <feTurbulence id="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" seed="2"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
                  </filter>
                  <filter id="squiggly-3">
                    <feTurbulence id="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" seed="3"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
                  </filter>

                  <filter id="squiggly-4">
                    <feTurbulence id="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" seed="4"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
                  </filter>
                </defs>
              </svg>
          </div>
        );
    }
}

export default Gameview;
