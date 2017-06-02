import React from 'react';

class Chat extends React.Component {

  constructor(props, context) {
          super(props, context);

          this.state = {
              msg: "",
              socketCh:'0-0'
          };
          this.handleChange = this.handleChange.bind(this);
          this.sendMsg = this.sendMsg.bind(this);
          this.handleKeyPress = this.handleKeyPress.bind(this);
          this.setSocketCh = this.setSocketCh.bind(this);
      }


      componentDidMount(){
        let sendMsgText = this.props.username + " 님이 입장 하셨습니다. " ;
        this.props.socket.emit('chat', this.state.socketCh+":ch:"+sendMsgText); // 요청
        let addUserName = this.props.username;
        this.props.socket.emit('totalCount', addUserName); // 요청

        let setSocketCh = this.setSocketCh.bind(this);
        this.props.socketG.on('setLocalCh', function(data){
          console.log("소켓 셋팅 챗"+data);
          setSocketCh(data);
        });
      }

      setSocketCh(ch){
        this.setState({
          socketCh:ch
        });
      }

      handleChange(e) {
          let nextState = {};
          nextState[e.target.name] = e.target.value;
          this.setState(nextState);
      }

      handleKeyPress(e) {
             if(e.charCode==13) {
                     this.sendMsg();
             }
         }
    sendMsg(){
      let sendMsgText = this.props.username + " : " + this.state.msg;
      if(this.state.msg.length==0){
        return false;
      }

      console.log("샌드 채널 "+this.state.socketCh );
      this.props.socket.emit('chat', this.state.socketCh+":ch:"+sendMsgText); // 요청
      this.setState({
          msg: ''
      });




   }




    render(){

        return (
          <div className="input-field chat-input-wrapper">
                  <input
                  name="msg"
                  type="text"
                  className="validate input-chat"
                  onChange={this.handleChange}
                  value={this.state.msg}
                  onKeyPress={this.handleKeyPress}/>

                <button
                  className="chat-send-btn waves-effect waves-light btn"
                  onClick={this.sendMsg}>
                  send
                </button>
            </div>
        );
    }
}

export default Chat;
