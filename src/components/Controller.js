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
              map:mapArr,
              monster:null,
          };


          this.endTime = 99;
          this.socketCh = '0-0';
          this.map = mapArr;
          this.mapLocal = [0,0];
          this.fighting = false;
          this.userHP = 1;

          this.moveUp = this.moveUp.bind(this);
          this.moveLeft = this.moveLeft.bind(this);
          this.moveRight = this.moveRight.bind(this);
          this.moveDown = this.moveDown.bind(this);
          this.actionMove = this.actionMove.bind(this);
          this.viewLocalMap = this.viewLocalMap.bind(this);
          this.attack = this.attack.bind(this);
          this.setLocalMonster = this.setLocalMonster.bind(this);
          this.setFighting = this.setFighting.bind(this);
          this.setFightingHP = this.setFightingHP.bind(this);


      }

      componentDidMount(){
        console.log(this.props.username);
        this.props.socket.emit('addUser', this.props.username);
        // 몬스터 셋팅
        let setLocalMonster = this.setLocalMonster.bind(this);
        this.props.socket.on("setMonster", function(data){ //몹 채팅
          setLocalMonster(data);
        });

        // 전투 상황
        let fighting = this.setFighting.bind(this);
        let fightingHP = this.setFightingHP.bind(this);
        this.props.socket.on(this.props.username+"전투", function(data){ //몹 채팅
            console.log("[전투]"+data);
            if(data=="endFight"){
              fighting();
            }
            else if(data.indexOf('[HP]')==0){
              let dataArr = data.split("[HP]");
              console.log(dataArr[1]);
              fightingHP(dataArr[1]);
            }

        });

      }

      // 체력
      setFightingHP(data){
        this.userHP = data;
        if(this.userHP < 0){
          this.fighting = false;
          this.props.socket.emit('private',"전투중 의식을 잃고 쓰러집니다.");
          this.props.socket.emit('setLocalCh', "0-0");
          this.props.socket.emit('chat', "0-0:ch:"+this.props.username+"님께서 죽었다 깨어났습니다.");
          this.props.socket.emit('private',"정신을 차려보니 시작점에서 깨어납니다.");
        }
      }
      // 전투중 설정
      setFighting(){
        this.fighting = false;
        console.log("전투 셋팅"+this.fighting);
      }

      // 몹 설정
      setLocalMonster(data){
        console.log("받아온 몬스터 데이터");
        console.log(data);

        this.setState({
          monster:data
        });

        if(data!=null){
          this.props.socket.emit('private', data.appearMsg+" : "+ data.name+"의 남은 체력"+data.hp);
        }else{
          this.props.socket.emit('private', "스산하니 무언가라도 당장 튀어 나올 것 같습니다.");
        }
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


        if(this.fighting){
          this.props.socket.emit('private',"전투중입니다. 이동 할 수 없습니다.");
          return false;
        }

        var map = this.mapLocal;
        var mapArr = this.state.map;
        var mapY =map[0];
        var mapX =map[1];


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

        if(mapArr[map[0]][map[1]]==-1){
          this.props.socket.emit('move', "벽에 막혀 그쪽 으로 이동 할 수 없습니다.");
          return false;
        }

        mapArr[mapY][mapX] = 0;


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
        //this.props.socket.emit('private',"공격 대상이 없습니다.");

        console.log("몬스터 체크");
        console.log(this.state.monster);
        if(this.state.monster==null){
          this.props.socket.emit('private',"공격 대상이 없습니다.");
          return false;
        }

        let attackInfo = new Object();
        attackInfo.userName = this.props.username;
        attackInfo.ch = this.socketCh;
        attackInfo.target = this.state.monster.name;
        attackInfo.fighting = this.fighting;

        console.log(attackInfo);

        this.props.socket.emit('attack',attackInfo);
        this.fighting = true;
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
