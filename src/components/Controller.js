import React from 'react';

class Controller extends React.Component {

  constructor(props, context) {
          super(props, context);

          let mapArr = [[2,0,0,-1,-1,0,-1,0,-1,0,0,0],
                      [0,0,0,0,0,0,0,0,-1,0,0,0],
                      [0,0,0,0,0,-1,0,0,0,0,0,0],
                      [0,0,0,0,0,0,0,0,-1,0,0,0]
                      ]

          this.state = {
              msg: "",
              mapLocal:[0,0],
              map:mapArr,
              socketCh:'0-0'
          };
          this.handleChange = this.handleChange.bind(this);
          this.sendMsg = this.sendMsg.bind(this);

          this.moveUp = this.moveUp.bind(this);
          this.moveLeft = this.moveLeft.bind(this);
          this.moveRight = this.moveRight.bind(this);
          this.moveDown = this.moveDown.bind(this);
          this.actionMove = this.actionMove.bind(this);
          this.handleKeyPress = this.handleKeyPress.bind(this);
          this.viewLocalMap = this.viewLocalMap.bind(this);


      }

      componentDidMount(){
      /*  let sendMsgText = this.props.username + " 님이 도착했습니다. " ;
        this.props.socket.emit('chat', sendMsgText); // 요청
        let addUserName = this.props.username;
        this.props.socket.emit('totalCount', addUserName); // 요청
*/

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

      //맵 보여주기
      viewLocalMap(){
          let map = this.state.map;

          this.props.socket.emit('viewMap', map); // 요청

      }


      /*유저 이동 이벤트*/
      moveUp(){
          this.actionMove("up");
      }
      moveLeft(){
          this.actionMove("left");
      }
      moveRight(){
          this.actionMove("right");
      }
      moveDown(){

          this.actionMove("down");
      }

      actionMove(dir){
        //this.props.socketG.emit('move', dir+"쪽으로 이동"); // 요청
        let map = this.state.mapLocal;
        if(dir=="up"){
          map[0] = map[0]-1;
          if(map[0]<0){
            map[0] = 0;
            this.props.socketG.emit('move', "막혀서 못감"); // 요청
            return false;
          }
        }
        else if(dir=="left"){
          map[1] = map[1]-1;
          if(map[1]<0){
            this.props.socketG.emit('move', "막혀서 못감"); // 요청
            map[1] = 0;
            return false;
          }
        }
        else if(dir=="right"){
          map[1] = map[1]+1;
        }
        else if(dir=="down"){
          console.log("아래로 이동");
          map[0] = map[0]+1;

        }



        this.setState({
          mapLocal: map,
          socketCh:map[0]+'-'+map[1]
        });

        console.log("컨트롤러 소켓채널 "+this.state.socketCh);

        this.props.socketG.emit('setLocalCh', this.state.socketCh);
        this.props.socket.emit('chat', this.state.socketCh+":ch:"+"도착도착도착");
        this.viewLocalMap();

      }

      /*유저 이동 이벤트 끝*/

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
                  onClick={this.moveUp}>
                  위
                </button>

                <button
                  className="controller-btn left"
                  onClick={this.moveLeft}>
                  왼쪽
                </button>

                <button
                  className="controller-btn right"
                  onClick={this.moveRight}>
                  오른쪽
                </button>

                <button
                  className="controller-btn down"
                  onClick={this.moveDown}>
                  아래
                </button>

            </div>
        );
    }
}

export default Controller;
