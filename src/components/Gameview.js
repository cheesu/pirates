import React from 'react';
import { CurrentUser } from 'Components';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
class Gameview extends React.Component {

  constructor(props, context) {
          super(props, context);
          this.state = {
              search: false,
              chat: ['test'],
          };
          this.addChatData = this.addChatData.bind(this);
          this.toggleSearch = this.toggleSearch.bind(this);
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
      this.props.socket.on('chat', function(data){ //응답
        addChat(data);
      });

    /*  this.props.socket.on('callUserList', function(data){ //응답
      console.log("유저목록 출력");
      console.log(data);
      //  addChat(data);
      });
*/
      }



    componentWillUnmount () {
      console.log("윌언마운트");
    }

    addChatData(data){
      this.setState({
        chat: this.state.chat.concat(data)
      });
      /*this.state.chat.push(data);
      this.forceUpdate();*/
    }

    render(){
        return (
          <div className="game-view">
            <div>
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
