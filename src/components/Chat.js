import React from 'react';

class Chat extends React.Component {

  constructor(props, context) {
          super(props, context);

          this.state = {
              msg: "",
          };
          this.handleChange = this.handleChange.bind(this);
          this.sendMsg = this.sendMsg.bind(this);
      }


      componentDidMount(){
        let sendMsgText = this.props.username + " 님이 입장 하셨습니다. " ;
        this.props.socket.emit('chat', sendMsgText); // 요청
      }

      handleChange(e) {
          let nextState = {};
          nextState[e.target.name] = e.target.value;
          this.setState(nextState);
      }


    sendMsg(){
      let sendMsgText = this.props.username + " : " + this.state.msg;

      this.props.socket.emit('chat', sendMsgText); // 요청
      this.setState({
          msg: ''
      });
   }




    render(){

        return (
          <div className="input-field">
                  <input
                  name="msg"
                  type="text"
                  className="validate input-chat"
                  onChange={this.handleChange}
                  value={this.state.msg}/>

                <button onClick={this.sendMsg}>
                  send
                </button>
            </div>
        );
    }
}

export default Chat;
