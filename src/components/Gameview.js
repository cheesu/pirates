import React from 'react';

class Gameview extends React.Component {

  constructor(props, context) {
          super(props, context);
          this.state = {
              chat: ['test'],
          };
          this.addChatData = this.addChatData.bind(this);
          console.log("생성");
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
      this.state.chat.push(data);
      this.forceUpdate();

    }

    render(){
        return (
          <div className="game-view">
            {this.state.chat.map(function(chat,i){
              return <p className="bla-bla-class" key={i}>{chat}</p>})}
          </div>
        );
    }
}

export default Gameview;
