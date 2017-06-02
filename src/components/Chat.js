import React from 'react';

class Chat extends React.Component {

  constructor(props, context) {
          super(props, context);

          this.state = {
              msg: "",
              socketCh:'0-0'
          };

          this.endTime = 99;
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
        this.props.socket.on('setLocalCh', function(data){
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


      var d = new Date();
      var moveTimerS = d.getSeconds();

      if(this.endTime==moveTimerS){
        console.log("연속 채팅 하지 마라");
        return false;
      }
      this.endTime = moveTimerS;

      let sendMsgText = this.props.username + " : " + this.state.msg;
      if(this.state.msg.length==0){
        return false;
      }


      console.log(sendMsgText.indexOf('/전체'));
      if(this.state.msg.indexOf('/전체')==0){
        let sendMG ="[All] : "+this.props.username + " : " +this.state.msg.substring(3,this.state.msg.length);
        this.props.socket.emit('Gchat', sendMG); // 요청
        this.setState({
            msg: ''
        });
        return false;
      }

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
