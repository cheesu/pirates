import React from 'react';
import axios from 'axios';

class Controller extends React.Component {
  constructor(props, context) {
          super(props, context);


          this.state = {
              msg: "",
              map:[],
              monster:null,
              next:false,
              prev:false,
          };

          this.endTime = 99;
          this.socketCh = '0-0';
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
          this.getMapAxio = this.getMapAxio.bind(this);
          this.moveNextMap = this.moveNextMap.bind(this);
          this.movePrevMap = this.movePrevMap.bind(this);


          this.mapName = "푸른해변";

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

        // 전투 상황
        let fighting = this.setFighting.bind(this);
        let fightingHP = this.setFightingHP.bind(this);
        this.props.socket.on(this.props.username+"전투", function(data){ //몹 채팅
            if(data=="endFight"){
              fighting();
            }
            else if(data.indexOf('[HP]')==0){
              let dataArr = data.split("[HP]");
              fightingHP(dataArr[1]);
            }

        });

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
               map:mapArr
             });
             this.socketCh = '0-0';
             this.mapLocal = [0,0];
             this.mapName = response.data.mapInfo.mapName;

             this.props.socket.emit('chat', this.mapName+"-"+this.socketCh+":ch:"+this.props.username+"님께서 도착 하셨습니다.");
             this.props.socket.emit('setLocalCh', this.mapName+"-"+this.socketCh);

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
               map:mapArr
             });

             this.socketCh = mapY.length+'-'+mapY[mapY.length].length;
             this.mapLocal = [mapY.length,mapY[mapY.length].length];
             this.mapName = response.data.mapInfo.mapName;

             this.props.socket.emit('chat', this.mapName+"-"+this.socketCh+":ch:"+this.props.username+"님께서 도착 하셨습니다.");
             this.props.socket.emit('setLocalCh', this.mapName+"-"+this.socketCh);

           }).catch((error) => {
               console.log(error);
           });
      }

      // 체력
      setFightingHP(data){
        this.userHP = data;
        if(this.userHP < 0){
          this.fighting = false;
          this.props.socket.emit('private',"전투중 의식을 잃고 쓰러집니다.");
          this.mapLocal = [0,0];
          this.props.socket.emit('setLocalCh', "0-0");
          this.props.socket.emit('chat', "0-0:ch:"+this.props.username+"님께서 죽었다 깨어났습니다.");
          this.props.socket.emit('private',"정신을 차려보니 시작점에서 깨어납니다.");
        }
      }
      // 전투중 설정
      setFighting(){
        this.fighting = false;
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

        if(this.endTime==moveTimerS){
          console.log("연속 클릭 하지 마라");
          return false;
        }
        this.endTime = moveTimerS;


        if(this.socketCh=="0-0"){
          this.fighting = false;
        }

        if(this.fighting){
          this.props.socket.emit('private',"전투중입니다. 이동 할 수 없습니다.");
          return false;
        }

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

          if(mapArr[map[0]][map[1]]==-1){
            map[0] = map[0]+1;
            this.props.socket.emit('move', "벽에 막혀 그쪽 으로 이동 할 수 없습니다.");
            return false;
          }
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
          if(mapArr[map[0]][map[1]]==-1){
            map[1] = map[1]+1;
            this.props.socket.emit('move', "벽에 막혀 그쪽 으로 이동 할 수 없습니다.");
            return false;
          }
          if(map[1]<0){
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
          if(mapArr[map[0]][map[1]]==-1){
            map[1] = map[1]-1;
            this.props.socket.emit('move', "벽에 막혀 그쪽 으로 이동 할 수 없습니다.");
            return false;
          }
          if(map[1]>mapXLimit){
            this.props.socket.emit('move', "막혀서 못감"); // 요청
            map[1] = mapXLimit;
            return false;
          }else{
            this.props.socket.emit('move', "동쪽으로 이동 합니다." );
          }
        }
        else if(dir=="down"){
          dirText= "남";
          map[0] = map[0]+1;

          if(mapArr[map[0]][map[1]]==-1){
            map[0] = map[0]-1;
            this.props.socket.emit('move', "벽에 막혀 그쪽 으로 이동 할 수 없습니다.");
            return false;
          }

          if(map[0]>mapYLimit){
            this.props.socket.emit('move', "막혀서 못감"); // 요청
            map[0] = mapYLimit;
            return false;
          }else{
            this.props.socket.emit('move', "남쪽으로 이동 합니다." );
          }
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
        else{
          if(this.state.next||this.state.prev){
            this.setState({
              next:false,
              prev:false
            });
          }
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
        attackInfo.fighting = this.fighting;

        this.props.socket.emit('attack',attackInfo);
        this.fighting = true;
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
                    <li><a onClick={this.viewLocalMap}  ><i className="medium  material-icons controller-btn map-location waves-effect waves-light">my_location</i></a></li>
                    <li><a onClick={this.attack}  className="waves-effect waves-light btn red controller-btn attack-btn">Attack</a></li>
                    {this.state.next ? nextMap : undefined }
                    {this.state.prev ? prevMap : undefined }
                </ul>



            </div>
        );
    }
}

export default Controller;
