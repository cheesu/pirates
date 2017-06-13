import React from 'react';
import axios from 'axios';
import {debounce} from 'throttle-debounce';
import { Fight } from 'Components';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
class Controller extends React.Component {
  constructor(props, context) {
          super(props, context);


          this.state = {
              msg: "",
              map:[],
              monster:null,
              next:false,
              prev:false,
              fighting:false,
              userHP:100,
              userMaxHP:100,
          };

          this.endTime = 99;
          this.socketCh = '0-0';
          this.mapLocal = [0,0];
          this.attackInfo = null;
          this.moveUp = this.moveUp.bind(this);
          this.moveLeft = this.moveLeft.bind(this);
          this.moveRight = this.moveRight.bind(this);
          this.moveDown = this.moveDown.bind(this);
          this.actionMove = this.actionMove.bind(this);
          this.viewLocalMap = this.viewLocalMap.bind(this);
          this.attack = this.attack.bind(this);
          this.attack = debounce(500,this.attack);
          this.setLocalMonster = this.setLocalMonster.bind(this);
          this.setFighting = this.setFighting.bind(this);
          this.setFightingHP = this.setFightingHP.bind(this);
          this.getMapAxio = this.getMapAxio.bind(this);
          this.moveNextMap = this.moveNextMap.bind(this);
          this.movePrevMap = this.movePrevMap.bind(this);
          this.toggleFight = this.toggleFight.bind(this);

          this.mapName = "푸른해변";

      }

      toggleFight(){
          this.setState({
              fighting: !this.state.fighting
          });
          setLocalMonster(null);
      }

      componentDidMount(){

        this.getMapAxio();
        this.props.socket.emit('addUser', this.props.username);

        this.props.socket.on(this.props.username+"[중복접속]", function(data){ //몹 채팅
        location.href="/login";
        });


        // 몬스터 셋팅
        let setLocalMonster = this.setLocalMonster.bind(this);
        this.props.socket.on("setMonster", function(data){ //몹 채팅
          setLocalMonster(data);
        });


        let fightingHP = this.setFightingHP.bind(this);
        this.props.socket.on(this.props.username+"currentUserHP", function(data){ //몹 채팅
            fightingHP(data);
        });



        console.log(this.props.userInfo);

      }


      getMapAxio(){
         axios.get('/api/map/getMap/' + this.mapName)
            .then((response) => {
              var map = response.data.mapInfo.map;
              var mapY = map.split("br");
              var mapArr = [];
              for(var count = 0; count<mapY.length; count++){
                mapArr.push(mapY[count].split(","));
              }
              this.setState({
                map:mapArr
              });
              this.viewLocalMap();
              this.mapName = response.data.mapInfo.mapName;
            }).catch((error) => {
                console.log(error);
            });
      }


      moveNextMap(){
        axios.get('/api/map/nextMap/' + this.mapName)
           .then((response) => {
             var map = response.data.mapInfo.map;
             var mapY = map.split("br");
             var mapArr = [];
             for(var count = 0; count<mapY.length; count++){
               mapArr.push(mapY[count].split(","));
             }
             this.setState({
               map:mapArr,
               prev:true,
               next:false,
             });
             this.socketCh = '0-0';
             this.mapLocal = [0,0];
             this.mapName = response.data.mapInfo.mapName;
             this.props.socket.emit('chat', this.mapName+"-"+this.socketCh+":ch:"+this.props.username+"님께서 도착 하셨습니다.");
             this.props.socket.emit('setLocalCh', this.mapName+"-"+this.socketCh);
             this.viewLocalMap();

           }).catch((error) => {
               console.log(error);
           });
      }

      movePrevMap(){
        axios.get('/api/map/prevMap/' + this.mapName)
           .then((response) => {
             var map = response.data.mapInfo.map;
             var mapY = map.split("br");
             var mapArr = [];
             for(var count = 0; count<mapY.length; count++){
               mapArr.push(mapY[count].split(","));
             }
             this.setState({
               map:mapArr,
               prev:false,
               next:true,
             });
             this.socketCh = (mapY.length-1)+'-'+(mapArr[mapArr.length-1].length-1);
             this.mapLocal = [mapY.length-1,mapArr[mapArr.length-1].length-1];
             this.mapName = response.data.mapInfo.mapName;

             this.props.socket.emit('chat', this.mapName+"-"+this.socketCh+":ch:"+this.props.username+"님께서 도착 하셨습니다.");
             this.props.socket.emit('setLocalCh', this.mapName+"-"+this.socketCh);
             this.viewLocalMap();

           }).catch((error) => {
               console.log(error);
           });
      }

      // 체력
      setFightingHP(data){
        let userHPArr = data.split("-");
        let userHP= "";
        let currentHP = Number(userHPArr[0]);
        let maxHP = Number(userHPArr[1]);

        this.setState({
          userHP:currentHP,
        });

        if(this.state.userMaxHP!=maxHP){
          this.setState({
            userMaxHP:maxHP,
          });
        }

        if(this.state.userHP <= 0){
          this.props.socket.emit('private',"전투중 의식을 잃고 쓰러집니다.");
          this.mapLocal = [0,0];
          this.props.socket.emit('setLocalCh', "0-0");
          this.props.socket.emit('chat', "0-0:ch:"+this.props.username+"님께서 죽었다 깨어났습니다.");
          this.props.socket.emit('private',"정신을 차려보니 시작점에서 깨어납니다.");



        }
      }
      // 전투중 설정
      setFighting(){
        this.setState({
          monster:null
        });
      }

      // 몹 설정
      setLocalMonster(data){
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
/*
        if(this.endTime==moveTimerS){
          console.log("연속 클릭 하지 마라");
          return false;
        }
        this.endTime = moveTimerS;
*/



        var map = this.mapLocal;
        var mapArr = this.state.map;

        var mapY =map[0];
        var mapX =map[1];

        var mapYLimit = mapArr.length;
        var mapXLimit = mapArr[0].length;
        var dirText ="";

        if(dir=="up"){
          dirText= "북";
          map[0] = map[0]-1;


          if(map[0]<0){
            map[0] = 0;
            this.props.socket.emit('move', "막혀서 못감"); // 요청
            return false;
          }
          else if(mapArr[map[0]][map[1]]==-1){
            map[0] = map[0]+1;
            this.props.socket.emit('move', "벽에 막혀 그쪽 으로 이동 할 수 없습니다.");
            return false;
          }
          else{
            this.props.socket.emit('move', "북쪽으로 이동 합니다." );
          }
        }
        else if(dir=="left"){
          dirText= "서";
          map[1] = map[1]-1;

          if(map[1]<0){
            this.props.socket.emit('move', "막혀서 못감"); // 요청
            map[1] = 0;
            return false;
          }
          else if(mapArr[map[0]][map[1]]==-1){
            map[1] = map[1]+1;
            this.props.socket.emit('move', "벽에 막혀 그쪽 으로 이동 할 수 없습니다.");
            return false;
          }
          else{
            this.props.socket.emit('move', "서쪽으로 이동 합니다." );
          }

        }
        else if(dir=="right"){
          dirText= "동";
          map[1] = map[1]+1;

          if(map[1]>=mapXLimit){
            this.props.socket.emit('move', "막혀서 못감"); // 요청
            map[1] = mapXLimit-1;
            return false;
          }
          else if(mapArr[map[0]][map[1]]==-1){
            map[1] = map[1]-1;
            this.props.socket.emit('move', "벽에 막혀 그쪽 으로 이동 할 수 없습니다.");
            return false;
          }
          else{
            this.props.socket.emit('move', "동쪽으로 이동 합니다." );
          }


        }
        else if(dir=="down"){
          dirText= "남";
          map[0] = map[0]+1;
          console.log(map);
          if(map[0]>=mapYLimit){
            console.log("막혀따아");
            this.props.socket.emit('move', "막혀서 못감"); // 요청
            map[0] = mapYLimit-1;
            return false;
            console.log("막혀따아2");
          }
          else if(mapArr[map[0]][map[1]]==-1){
            console.log("막혀따아3");
            map[0] = map[0]-1;
            this.props.socket.emit('move', "벽에 막혀 그쪽 으로 이동 할 수 없습니다.");
            return false;
          }
          else{
            this.props.socket.emit('move', "남쪽으로 이동 합니다." );
          }


        }


        if(!this.state.next&&!this.state.prev){
              mapArr[mapY][mapX] = 0;
        }
        else if(this.state.next){
          mapArr[mapY][mapX] =3;
        }
        else if(this.state.prev){
          mapArr[mapY][mapX] = 4;
        }

        // 다음맵으로 이동
        if(mapArr[map[0]][map[1]]==3){
          this.setState({
            next:true,
          });
        }
        else if(mapArr[map[0]][map[1]]==4){
          this.setState({
            prev:true,
          });
        }
        else if(this.state.next||this.state.prev){
            this.setState({
              next:false,
              prev:false
            });
        }





         mapY =map[0];
         mapX =map[1];

        mapArr[mapY][mapX] = 2; // 이동 타겟 지점
        console.log(mapArr);
        var socketChan = mapY+"-"+mapX;
        this.setState({
          map:mapArr
        });

        var prevCh = this.socketCh;
        this.socketCh = socketChan;
        this.mapLocal = map;
        this.props.socket.emit('chat', this.mapName+"-"+socketChan+":ch:"+this.props.username+"님께서 도착 하셨습니다.");
        this.props.socket.emit('setLocalCh', this.mapName+"-"+socketChan);
        this.props.socket.emit('chat', this.mapName+"-"+prevCh+":ch:"+this.props.username+"님께서 "+dirText+"쪽으로 이동 하셨습니다.");
        this.viewLocalMap();
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

        if(this.state.monster==null){
          this.props.socket.emit('private',"공격 대상이 없습니다.");
          return false;
        }



          let attackInfo = new Object();
          attackInfo.userName = this.props.username;
          attackInfo.ch = this.mapName+"-"+this.socketCh;
          attackInfo.target = this.state.monster.name;
          attackInfo.userMaxHP = this.state.userMaxHP;
          attackInfo.userHP = this.state.userHP;
          attackInfo.fighting = false;
            console.log(attackInfo);
          this.attackInfo = attackInfo;
          this.toggleFight();
      }




    render(){

      const nextMap = (
              <li><a onClick={this.moveNextMap}  className="waves-effect waves-light btn red controller-btn attack-btn">다음맵으로</a></li>
      );
      const prevMap = (
              <li><a onClick={this.movePrevMap}  className="waves-effect waves-light btn red controller-btn attack-btn">이전맵으로</a></li>
      );

        return (
          <div className="controller-container">


                <ul>
                    <li><a onClick={this.moveUp}  ><i className="medium  material-icons controller-btn up waves-effect waves-light">navigation</i></a></li>
                    <li><a onClick={this.moveLeft}><i className="medium material-icons controller-btn left waves-effect waves-light">navigation</i></a></li>
                    <li><a onClick={this.moveRight}><i className="medium material-icons controller-btn right waves-effect waves-light">navigation</i></a></li>
                    <li><a onClick={this.moveDown}><i className="medium material-icons controller-btn down waves-effect waves-light">navigation</i></a></li>
                </ul>

                <ul>
                { /*    <li><a onClick={this.viewLocalMap}  ><i className="medium  material-icons controller-btn map-location waves-effect waves-light">my_location</i></a></li> */}
                    <li><a onClick={this.attack.bind(this)}  className="waves-effect waves-light btn red controller-btn attack-btn">Attack</a></li>
                    {this.state.next ? nextMap : undefined }
                    {this.state.prev ? prevMap : undefined }
                </ul>

                <ReactCSSTransitionGroup transitionName="search" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                     { /* IMPLEMENT: SHOW SEARCH WHEN SEARCH STATUS IS TRUE */}
                     {this.state.fighting ? <Fight onClose={this.toggleFight}
                                                  attackInfo={this.attackInfo}
                                                  socket={this.props.socket}
                                                  /> : undefined }
                </ReactCSSTransitionGroup>



            </div>
        );
    }
}

export default Controller;
