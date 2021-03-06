import React from 'react';
import axios from 'axios';
import {debounce} from 'throttle-debounce';
import { Fight, Store, ChangeJob, Enhancement } from 'Components';
import cookie from 'react-cookies'
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
              rest:false,
              store:false,
              openStore:false,
              changeJob:false,
              openChangeJob:false,
              enhancement:false,
              openEnhancement:false,
              party:false,
              partyMember:[this.props.username],
              mapMsg:[]
          };

          this.endTime = 99;

          this.attackInfo = null;
          this.moveUp = this.moveUp.bind(this);
          this.moveLeft = this.moveLeft.bind(this);
          this.moveRight = this.moveRight.bind(this);
          this.moveDown = this.moveDown.bind(this);
          this.actionMove = this.actionMove.bind(this);
          this.viewLocalMap = this.viewLocalMap.bind(this);
          this.attack = this.attack.bind(this);
          this.attack = debounce(500,this.attack);
          this.rest = debounce(500,this.rest);
          this.setLocalMonster = this.setLocalMonster.bind(this);
          this.setFighting = this.setFighting.bind(this);
          this.checkDead = this.checkDead.bind(this);
          this.getMapAxio = this.getMapAxio.bind(this);
          this.moveNextMap = this.moveNextMap.bind(this);
          this.movePrevMap = this.movePrevMap.bind(this);
          this.toggleFight = this.toggleFight.bind(this);
          this.toggleRest = this.toggleRest.bind(this);
          this.toggleOpenStore = this.toggleOpenStore.bind(this);
          this.toggleOpenChangeJob = this.toggleOpenChangeJob.bind(this);
          this.toggleOpenEnhancement = this.toggleOpenEnhancement.bind(this);
          this.storeKind = 'normal';

          this.saveMap = this.saveMap.bind(this);
          this.handleKeyPress = this.handleKeyPress.bind(this);

          this.mapName = this.props.userInfo.mapName;

          if(this.mapName==undefined){
            this.mapName = "항구";
          }

        let cookieMapLocal =   cookie.load("map");

        if(cookieMapLocal==undefined){
          cookieMapLocal = "0-0";
        }


          this.socketCh = cookieMapLocal;
          let localArr = cookieMapLocal.split("-");
          this.mapLocal = [localArr[0]*1,localArr[1]*1];
      }

/*
      shouldComponentUpdate(nextProps, nextState){
        let update = JSON.stringify(this.props) !== JSON.stringify(nextProps);
        return update;
          }
*/

handleKeyPress(e) {

       if(e.charCode==97) {
          this.actionMove("left");
       }
       else if(e.charCode==119){
         this.actionMove("up");
       }
       else if(e.charCode==115){
         this.actionMove("down");
       }
       else if(e.charCode==100){
         this.actionMove("right");
       }
       else if(e.charCode==32){
         this.attack();
       }
       else if(e.charCode==114){
         this.rest();
       }


   }


toggleOpenEnhancement(){
    this.setState({
        OpenEnhancement: !this.state.OpenEnhancement
    });
}
      toggleFight(){
          this.setState({
              fighting: !this.state.fighting
          });
      }

      toggleOpenStore(){
          this.setState({
              openStore: !this.state.openStore
          });
      }

      toggleOpenChangeJob(){
          this.setState({
              openChangeJob: !this.state.openChangeJob
          });
      }


      componentDidMount(){

        if(this.mapName==""){
          this.props.getStatusRequest();

          this.mapName = this.props.userInfo.mapName;
        }

        $("#contrillerContainer").attr("tabIndex",0);
        $("#contrillerContainer").focus();
        this.props.getStatusRequest();
        this.props.userItemRequest();


        this.getMapAxio();


        // 몬스터 셋팅
        let setLocalMonster = this.setLocalMonster.bind(this);
        this.props.socket.on("setMonster", function(data){ //몹 채팅
          setLocalMonster(data);
        });


        this.props.socket.on(this.props.username+"CONTROLLDEAD", function(data){ //귓말
        this.checkDead();
        }.bind(this));


        // 초대 수락 받음
        this.props.socket.on(this.props.username+"accept", function(data){
          if(!this.state.party){
            this.setState({
              party: true
            });
          }

        this.setState({
          partyMember: this.state.partyMember.concat(data)
        });
        this.props.socket.emit("party", data+"님 께서 파티에 들어오셨습니다.",this.state.partyMember);
        this.props.socket.emit("party", "현재 파티 멤버 - "+this.state.partyMember,this.state.partyMember);
        this.props.socket.emit("setPartyMember", this.state.partyMember);
        }.bind(this));

        // 파티 멤버 셋팅
        this.props.socket.on(this.props.username+"setPartyMember", function(data){ //귓말
          if(this.state.partyMember != data){
            this.setState({
              partyMember: data
            });
          }
        }.bind(this));

        // 파티 초대 받음
        this.props.socket.on(this.props.username+"invite", function(data){
          if(this.state.party){
            this.props.socket.emit("party", data.target+"님은 이미 파티중입니다.",[data.sendUser]);
          }
          else if(this.state.fighting){
            this.props.socket.emit("party", data.target+"님은 전투중 입니다. 전투중엔 초대 요청을 받을 수 없습니다.",[data.sendUser]);
          }else{
            var con_test = confirm(data.sendUser+"님이 파티 요청을 하였습니다. 수락 하시겠습니까? ");
            if(con_test){
              this.props.socket.emit("party", data.target+"님 께서 요청을 수락 하였습니다.",[data.sendUser]);
              this.props.socket.emit("accept", data.sendUser,data.target);
              this.setState({
                party: true
              });
            }else{
              this.props.socket.emit("party", data.target+"님 께서 요청을 거절 하였습니다.",[data.sendUser]);
            }
          }

        }.bind(this));

        // 파티 멤버 셋팅
        this.props.socket.on("checkParty", function(data){ //귓말
          this.props.socket.emit("private", "현재 파티 멤버 - "+this.state.partyMember,this.state.partyMember);
        }.bind(this));

        let toggleRest = this.toggleRest.bind(this);
        this.props.socket.on("restEnd", function(data){ //몹 채팅
          toggleRest(false);
        });

        // 파티 멤버 탈퇴
        this.props.socket.on("disconnecParty", function(disconnetUser){ //귓말
            if(this.state.partyMember.indexOf(disconnetUser)!= -1){
              this.props.socket.emit("party", disconnetUser+"님 께서 파티를 떠났습니다..",this.state.partyMember);
              this.state.partyMember.splice(this.state.partyMember.indexOf(disconnetUser),1);
              this.setState({
                partyMember: this.state.partyMember
              });

              if(this.state.partyMember.length == 1){
                this.setState({
                  party: false
                });
              }
            }
        }.bind(this));


      }

      toggleRest(data){
        this.setState({
            rest: data
        });
        data = null;
      }


      getMapAxio(){
         axios.get('/api/map/getMap/' + this.mapName)
            .then((response) => {
              var map = response.data.mapInfo.map;
              var mapY = map.split("br");
              var mapArr = [];
              for(let count = 0; count<mapY.length; count++){
                mapArr.push(mapY[count].split(","));
              }

              var bossArea = response.data.bossLocal;
              if(bossArea!='null'){
                var bossAreaArr = bossArea.split("-");
                mapArr[bossAreaArr[0]][bossAreaArr[1]] = 99;
              }

              this.setState({
                map:mapArr,
                mapMsg:response.data.mapInfo.msg
              });
              this.viewLocalMap();
              this.mapName = response.data.mapInfo.mapName;

              map,mapY,mapArr = null;

            }).catch((error) => {
                console.log(error);
            });
      }

      saveMap(){
        let targetMapName = this.mapName;
        if(this.mapName.indexOf("예배당")!=-1 || this.mapName.indexOf("주교실")!=-1 || this.mapName.indexOf("신전")!=-1){
          targetMapName = "빛의항구";
        }
          axios.get('/api/account/saveMap/' + targetMapName)
             .then((response) => {
               console.log(response.data);
                console.log(response.data.msg);
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

             var bossArea = response.data.bossLocal;

             if(bossArea!='null'){
               var bossAreaArr = bossArea.split("-");
               mapArr[bossAreaArr[0]][bossAreaArr[1]] = 99;
             }

             this.setState({
               map:mapArr,
               prev:true,
               next:false,
               mapMsg:response.data.mapInfo.msg
             });
             this.socketCh = '0-0';
             this.mapLocal = [0,0];
             this.mapName = response.data.mapInfo.mapName;
             this.props.socket.emit('chat', this.mapName+"-"+this.socketCh+":ch:"+this.props.username+"님께서 도착 하셨습니다.");
             this.props.socket.emit('setLocalCh', this.mapName+"-"+this.socketCh);
             this.viewLocalMap();
             map,mapY,mapArr = null;

             this.saveMap();
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

             var bossArea = response.data.bossLocal;

             if(bossArea!='null'){
               var bossAreaArr = bossArea.split("-");
               mapArr[bossAreaArr[0]][bossAreaArr[1]] = 99;
             }

             this.setState({
               map:mapArr,
               prev:false,
               next:true,
               mapMsg:response.data.mapInfo.msg
             });
             this.socketCh = (mapY.length-1)+'-'+(mapArr[mapArr.length-1].length-1);
             this.mapLocal = [mapY.length-1,mapArr[mapArr.length-1].length-1];
             this.mapName = response.data.mapInfo.mapName;

             this.props.socket.emit('chat', this.mapName+"-"+this.socketCh+":ch:"+this.props.username+"님께서 도착 하셨습니다.");
             this.props.socket.emit('setLocalCh', this.mapName+"-"+this.socketCh);
             this.viewLocalMap();
             map,mapY,mapArr = null;
             this.saveMap();
           }).catch((error) => {
               console.log(error);
           });
      }

      // 체력
      checkDead(){
          this.props.socket.emit('private',"전투중 의식을 잃고 쓰러집니다.");
          this.mapName="항구";
          this.getMapAxio();
          this.mapLocal = [0,0];
          this.props.socket.emit('setLocalCh', "0-0");
          this.props.socket.emit('chat', "0-0:ch:"+this.props.username+"님께서 죽었다 깨어났습니다.");
          this.props.socket.emit('private',"정신을 차려보니 시작점에서 깨어납니다.");

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
          this.props.socket.emit('private', "[몬스터]"+data.appearMsg+" :[LV:"+ data.lv+"]");
        }else{

          let msgArr = this.state.mapMsg;
          let msgCount = Math.floor(Math.random() * msgArr.length);
            let random = Math.floor(Math.random() * 100) + 1;
            if(random < 8){
                this.props.socket.emit('private', "..."+msgArr[msgCount]);
            }
        }
      }



      //맵 보여주기
      viewLocalMap(){
          let map = this.state.map;
          this.props.socket.emit('viewMap',map, this.mapLocal); // 요청
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
        this.props.socket.emit('restEnd', this.props.username);
        this.setState({
          rest:false
        });


        var map = this.mapLocal;
        var mapArr = this.state.map;

        var mapY =map[0];
        var mapX =map[1];

        var mapYLimit = mapArr.length;
        var mapXLimit = mapArr[mapY].length;
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
          if(map[0]>=mapYLimit){
            this.props.socket.emit('move', "막혀서 못감"); // 요청
            map[0] = mapYLimit-1;
            return false;
          }
          else if(mapArr[map[0]][map[1]]==-1){
            map[0] = map[0]-1;
            this.props.socket.emit('move', "벽에 막혀 그쪽 으로 이동 할 수 없습니다.");
            return false;
          }
          else{
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
        else if(this.state.next||this.state.prev){
            this.setState({
              next:false,
              prev:false
            });
        }

        // 상점
        if(mapArr[map[0]][map[1]]==9){
          this.storeKind = "normal";

          if(this.mapName=="루비파이선 갑판-3"){
            this.storeKind = "ship";
          }

          this.setState({
            store:true,
          });
        }else if(this.state.store){
          this.setState({
            store:false,
          });
        }







        // 전직
        if(mapArr[map[0]][map[1]]==11){
          this.setState({
            changeJob:true,
          });
        }else if(this.state.changeJob){
          this.setState({
            changeJob:false,
          });
        }

        // 무기강화
        if(mapArr[map[0]][map[1]]==12){
          this.setState({
            enhancement:true,
          });
        }else if(this.state.enhancement){
          this.setState({
            enhancement:false,
          });
        }




         mapY =map[0];
         mapX =map[1];

        var socketChan = mapY+"-"+mapX;


        var prevCh = this.socketCh;
        this.socketCh = socketChan;
        this.mapLocal = map;
        this.props.socket.emit('chat', this.mapName+"-"+socketChan+":ch:"+this.props.username+"님께서 도착 하셨습니다.");
        this.props.socket.emit('setLocalCh', this.mapName+"-"+socketChan);
        this.props.socket.emit('chat', this.mapName+"-"+prevCh+":ch:"+this.props.username+"님께서 "+dirText+"쪽으로 이동 하셨습니다.");
        this.viewLocalMap();
        cookie.save("map", socketChan, { path: '/' });

        map,mapArr,mapY,mapX,mapYLimit,mapXLimit,dirText = null;

      }

      /*유저 이동 이벤트 끝*/


      attack(){
        if(this.state.rest){

          this.props.socket.emit('private',"휴식중에 공격 할 수 없습니다.");
          return false
        }

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
          attackInfo.mapName = this.mapName;
          attackInfo.target = this.state.monster.name;
          attackInfo.userMaxHP = this.props.userInfo.max_hp
          attackInfo.userHP = this.props.userInfo.hp;
          attackInfo.fighting = false;
          attackInfo.party = this.state.party;
          attackInfo.partyMember = this.state.partyMember;
          this.attackInfo = attackInfo;

          console.log(this.attackInfo);
          this.toggleFight();
          this.setLocalMonster(null);
      }


      rest(){
        this.setState({
            rest: true
        });
        this.props.socket.emit('rest', this.props.username);
      }



      shouldComponentUpdate(nextProps, nextState) {
              let current = {
                  store: this.state.store,
                  changeJob: this.state.changeJob,
                  next:this.state.next,
                  prev:this.state.prev,
                  fighting:this.state.fighting,
                  openStore:this.state.openStore,
                  openChangeJob:this.state.openChangeJob,
                  user: this.props.userInfo,
              };
            let next = {
                store: nextState.openStore,
                next:nextState.next,
                prev:nextState.prev,
                fighting:nextState.fighting,
                openStore:nextState.openStore,
                openChangeJob:nextState.openChangeJob,
                changeJob: nextState.changeJob,
                user: nextProps.userInfo,
            };




            let update = JSON.stringify(current) !== JSON.stringify(next);
              return update;
          }

    componentDidUpdate(prevProps, prevState){
      if(prevProps.userInfo.currentUser=="" && this.props.userInfo.currentUser!=""){
        this.props.socket.emit('addUser', this.props.userInfo.currentUser, this.props.userInf.lv);

        this.mapName = this.props.userInfo.mapName;
        this.getMapAxio();
      }
    }

    render(){
      const nextMap = (
              <li><a onClick={this.moveNextMap}  className="waves-effect waves-light btn red controller-btn attack-btn">NEXT MAP</a></li>
      );
      const prevMap = (
              <li><a onClick={this.movePrevMap}  className="waves-effect waves-light btn red controller-btn attack-btn">PREV MAP</a></li>
      );
      const store = (
              <li><a onClick={this.toggleOpenStore}  className="waves-effect waves-light btn red controller-btn attack-btn">Store</a></li>
      );
      const changeJob = (
              <li><a onClick={this.toggleOpenChangeJob}  className="waves-effect waves-light btn red controller-btn attack-btn">전직</a></li>
      );

      const enhancement = (
              <li><a onClick={this.toggleOpenEnhancement}  className="waves-effect waves-light btn red controller-btn attack-btn">무기 강화</a></li>
      );

        return (
          <div id="contrillerContainer" className="controller-container" onKeyPress={this.handleKeyPress} >
                <ul>
                    <li><a onClick={this.moveUp}  ><i className="medium  material-icons controller-btn up waves-effect waves-light">navigation</i></a></li>
                    <li><a onClick={this.moveLeft}><i className="medium material-icons controller-btn left waves-effect waves-light">navigation</i></a></li>
                    <li><a onClick={this.moveRight}><i className="medium material-icons controller-btn right waves-effect waves-light">navigation</i></a></li>
                    <li><a onClick={this.moveDown}><i className="medium material-icons controller-btn down waves-effect waves-light">navigation</i></a></li>
                </ul>

                <ul>
                { /*    <li><a onClick={this.viewLocalMap}  ><i className="medium  material-icons controller-btn map-location waves-effect waves-light">my_location</i></a></li> */}
                    <li><a onClick={this.attack.bind(this)}  className="waves-effect waves-light btn red controller-btn attack-btn">Attack</a></li>
                    <li><a onClick={this.rest.bind(this)}  className="waves-effect waves-light btn green controller-btn rest-btn">휴식</a></li>
                    {this.state.next ? nextMap : undefined }
                    {this.state.prev ? prevMap : undefined }
                    {this.state.store ? store : undefined }
                    {this.state.changeJob ? changeJob : undefined }
                    {this.state.enhancement ? enhancement : undefined }


                </ul>

                <ReactCSSTransitionGroup transitionName="search" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                     { /* IMPLEMENT: SHOW SEARCH WHEN SEARCH STATUS IS TRUE */}
                     {this.state.fighting ? <Fight onClose={this.toggleFight}
                                                  attackInfo={this.attackInfo}
                                                  userInfo = {this.props.userInfo}
                                                  socket={this.props.socket}
                                                  monster={this.state.monster}
                                                  getStatusRequest = {this.props.getStatusRequest}
                                                  userItemRequest = {this.props.userItemRequest}
                                                  userItems = {this.props.userItems}
                                                  /> : undefined }
                </ReactCSSTransitionGroup>

                <ReactCSSTransitionGroup transitionName="item-store" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                     { /* IMPLEMENT: SHOW SEARCH WHEN SEARCH STATUS IS TRUE */}
                     {this.state.openStore ? <Store onClose={this.toggleOpenStore}
                                                  userInfo = {this.props.userInfo}
                                                  userItemRequest = {this.props.userItemRequest}
                                                  getStatusRequest = {this.props.getStatusRequest}
                                                  userItems = {this.props.userItems}
                                                  storeKind = {this.storeKind}
                                                  /> : undefined }
                </ReactCSSTransitionGroup>

                <ReactCSSTransitionGroup transitionName="item-store" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                     { /* IMPLEMENT: SHOW SEARCH WHEN SEARCH STATUS IS TRUE */}
                     {this.state.openChangeJob ? <ChangeJob onClose={this.toggleOpenChangeJob}
                                                  userInfo = {this.props.userInfo}
                                                  getStatusRequest = {this.props.getStatusRequest}
                                                  /> : undefined }
                </ReactCSSTransitionGroup>

                <ReactCSSTransitionGroup transitionName="item-store" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                     { /* IMPLEMENT: SHOW SEARCH WHEN SEARCH STATUS IS TRUE */}
                     {this.state.OpenEnhancement ? <Enhancement onClose={this.toggleOpenEnhancement}
                                                  socket={this.props.socket}
                                                  userInfo = {this.props.userInfo}
                                                  /> : undefined }
                </ReactCSSTransitionGroup>



            </div>
        );
    }
}

export default Controller;
