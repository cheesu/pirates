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

          this.moveUp = this.moveUp.bind(this);
          this.moveLeft = this.moveLeft.bind(this);
          this.moveRight = this.moveRight.bind(this);
          this.moveDown = this.moveDown.bind(this);
          this.actionMove = this.actionMove.bind(this);
          this.viewLocalMap = this.viewLocalMap.bind(this);


      }

      componentDidMount(){
      /*  let sendMsgText = this.props.username + " 님이 도착했습니다. " ;
        this.props.socket.emit('chat', sendMsgText); // 요청
        let addUserName = this.props.username;
        this.props.socket.emit('totalCount', addUserName); // 요청
*/

      }


      //맵 보여주기
      viewLocalMap(){
          let map = this.state.map;
          this.props.socket.emit('viewMap',map); // 요청

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
        //this.props.socket.emit('move', dir+"쪽으로 이동"); // 요청
        var map = this.state.mapLocal;
        var mapArr = this.state.map;
        var mapY =map[0];
        var mapX =map[1];
          mapArr[mapY][mapX] = 0;

        if(dir=="up"){
          map[0] = map[0]-1;
          if(map[0]<0){
            map[0] = 0;
            this.props.socket.emit('move', "막혀서 못감"); // 요청
            return false;
          }
        }
        else if(dir=="left"){
          map[1] = map[1]-1;
          if(map[1]<0){
            console.log(map);
            this.props.socket.emit('move', "막혀서 못감"); // 요청
            map[1] = 0;
            return false;
          }
        }
        else if(dir=="right"){
          map[1] = map[1]+1;
          if(map[1]>11){
            this.props.socket.emit('move', "막혀서 못감"); // 요청
            map[1] = 11;
            return false;
          }
        }
        else if(dir=="down"){
          map[0] = map[0]+1;
          if(map[0]>3){
            this.props.socket.emit('move', "막혀서 못감"); // 요청
            map[1] = 3;
            return false;
          }

        }


         mapY =map[0];
         mapX =map[1];
        mapArr[mapY][mapX] = 2;
        var socketChan = mapY+"-"+mapX;
        this.setState({
          mapLocal: map,
          socketCh:socketChan,
          map:mapArr
        });

        this.props.socket.emit('setLocalCh', socketChan);
        //this.props.socket.emit('chat', socketChan+":ch:"+"도착도착도착");
        this.viewLocalMap();
        this.props.socket.emit('chat', socketChan+":ch:"+"현재 위치 ["+socketChan+"]");
      }

      /*유저 이동 이벤트 끝*/





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
