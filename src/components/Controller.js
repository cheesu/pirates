import React from 'react';

class Controller extends React.Component {

  constructor(props, context) {
          super(props, context);

          this.state = {
              msg: "",
          };
          this.handleChange = this.handleChange.bind(this);
          this.sendMsg = this.sendMsg.bind(this);
          this.handleKeyPress = this.handleKeyPress.bind(this);
      }


      componentDidMount(){
        let sendMsgText = this.props.username + " 님이 도착했습니다. " ;
        this.props.socket.emit('chat', sendMsgText); // 요청
        let addUserName = this.props.username;
        this.props.socket.emit('totalCount', addUserName); // 요청
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

      if(this.state.msg=='/누구'){
        this.props.socket.emit('callUserList', ""); // 요청
        this.setState({
            msg: ''
        });

        return false;
      }

      this.props.socket.emit('chat', sendMsgText); // 요청
      this.setState({
          msg: ''
      });




   }




    render(){

        return (
          <div className="controller-container">

                <button
                  className="controller-btn up"
                  onClick={this.sendMsg}>
                  위
                </button>

                <button
                  className="controller-btn left"
                  onClick={this.sendMsg}>
                  왼쪽
                </button>

                <button
                  className="controller-btn right"
                  onClick={this.sendMsg}>
                  오른쪽
                </button>

                <button
                  className="controller-btn down"
                  onClick={this.sendMsg}>
                  아래
                </button>

            </div>
        );
    }
}

export default Controller;
