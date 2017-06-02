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
          this.socket = this.props.socket
          console.log("생성");
      }

      toggleSearch(){
          console.log("인게임 토글 서치");
          this.setState({
              search: !this.state.search
          });
      }

    componentDidMount(){
      console.log("디드 마운트");
      let addChat = this.addChatData.bind(this);
      this.props.socket.on(this.state.socketCh, function(data){ //응답
        addChat(data);
      });

      this.props.socketG.on('move', function(data){ //응답
        addChat(data);
      });

      let setSocketCh = this.setSocketCh.bind(this);
      this.props.socketG.on('setLocalCh', function(data){ //응답
        console.log("소켓G 셋팅 게임뷰");
        setSocketCh(data);
      });



    }

    setSocketCh(ch){
      console.log(ch+"<-셋팅");
      this.setState({
        socketCh:ch
      });
      let addChat = this.addChatData.bind(this);
      this.props.socket.on(this.state.socketCh, function(data){ //응답
        addChat(data);
      });
    }


    componentWillUnmount () {
      console.log("윌언마운트");
    }

    addChatData(data){
      this.setState({
        chat: this.state.chat.concat(data)
      });

      var objDiv = document.getElementById("gameChatView"); objDiv.scrollTop = objDiv.scrollHeight;
    }

    render(){
        return (
          <div id="gameChatView" className="game-view">
            <div className="current-user-list-btn">
              <ul>
                  <li><a onClick={this.toggleSearch}><i className="material-icons">search</i></a></li>
              </ul>
            </div>
            {this.state.chat.map(function(chat,i){
              return <p className="bla-bla-class" key={i}>{chat}</p>})}

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
