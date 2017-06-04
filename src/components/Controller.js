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
              map:mapArr
          };


          this.endTime = 99;
          this.socketCh = '0-0';
          this.map = mapArr;
          this.mapLocal = [0,0];
          this.moveUp = this.moveUp.bind(this);
          this.moveLeft = this.moveLeft.bind(this);
          this.moveRight = this.moveRight.bind(this);
          this.moveDown = this.moveDown.bind(this);
          this.actionMove = this.actionMove.bind(this);
          this.viewLocalMap = this.viewLocalMap.bind(this);
          this.attack = this.attack.bind(this);


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
        var d = new Date();
        var moveTimerS = d.getSeconds();

        if(this.endTime==moveTimerS){
          console.log("연속 클릭 하지 마라");
          return false;
        }
        this.endTime = moveTimerS;

        var map = this.mapLocal;
        var mapArr = this.state.map;
        var mapY =map[0];
        var mapX =map[1];
          mapArr[mapY][mapX] = 0;

        var dirText ="";

        if(dir=="up"){
          dirText= "북";
          map[0] = map[0]-1;
          if(map[0]<0){
            map[0] = 0;
            this.props.socket.emit('move', "막혀서 못감"); // 요청
            return false;
          }else{

            this.props.socket.emit('move', "북쪽으로 이동 합니다." );
          }
        }
        else if(dir=="left"){
          dirText= "서";
          map[1] = map[1]-1;
          if(map[1]<0){
            console.log(map);
            this.props.socket.emit('move', "막혀서 못감"); // 요청
            map[1] = 0;
            return false;
          }else{
            this.props.socket.emit('move', "서쪽으로 이동 합니다." );
          }
        }
        else if(dir=="right"){
          dirText= "동";
          map[1] = map[1]+1;
          if(map[1]>11){
            this.props.socket.emit('move', "막혀서 못감"); // 요청
            map[1] = 11;
            return false;
          }else{
            this.props.socket.emit('move', "동쪽으로 이동 합니다." );
          }
        }
        else if(dir=="down"){
          dirText= "남";
          map[0] = map[0]+1;
          if(map[0]>3){
            this.props.socket.emit('move', "막혀서 못감"); // 요청
            map[0] = 3;
            return false;
          }else{
            this.props.socket.emit('move', "남쪽으로 이동 합니다." );
          }
        }


         mapY =map[0];
         mapX =map[1];
        mapArr[mapY][mapX] = 2;
        var socketChan = mapY+"-"+mapX;
        this.setState({
          map:mapArr
        });

        var prevCh = this.socketCh;
        this.socketCh = socketChan;
        this.mapLocal = map;
        this.props.socket.emit('chat', socketChan+":ch:"+this.props.username+"님께서 도착 하셨습니다.");
        this.props.socket.emit('setLocalCh', socketChan);
        //this.props.socket.emit('chat', socketChan+":ch:"+"도착도착도착");
        //this.viewLocalMap();



        this.props.socket.emit('chat', prevCh+":ch:"+this.props.username+"님께서 "+dirText+"쪽으로 이동 하셨습니다.");

      }

      /*유저 이동 이벤트 끝*/


      attack(){
        var d = new Date();
        var moveTimerS = d.getSeconds();

        if(this.endTime==moveTimerS){
          console.log("연속 클릭 하지 마라");
          return false;
        }
        this.endTime = moveTimerS;

        this.props.socket.emit('private',"공격 대상이 없습니다.");
      }


    render(){

        return (
          <div className="controller-container">


                <ul>
                    <li><a onClick={this.moveUp}  ><i className="medium  material-icons controller-btn up waves-effect waves-light">navigation</i></a></li>
                    <li><a onClick={this.moveLeft}><i className="medium material-icons controller-btn left waves-effect waves-light">navigation</i></a></li>
                    <li><a onClick={this.moveRight}><i className="medium material-icons controller-btn right waves-effect waves-light">navigation</i></a></li>
                    <li><a onClick={this.moveDown}><i className="medium material-icons controller-btn down waves-effect waves-light">navigation</i></a></li>
                </ul>

                <ul>
                    <li><a onClick={this.viewLocalMap}  ><i className="medium  material-icons controller-btn map-location waves-effect waves-light">my_location</i></a></li>
                    <li><a onClick={this.attack}  className="waves-effect waves-light btn red controller-btn attack-btn">Attack</a></li>

                </ul>


            </div>
        );
    }
}

export default Controller;
