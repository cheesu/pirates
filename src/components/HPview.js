import React from 'react';
import { CurrentUser } from 'Components';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
class HPview extends React.Component {

  constructor(props, context) {
          super(props, context);

          let currentHP = Number(this.props.attackInfo.userHP);
          let maxHP = Number(this.props.attackInfo.userMaxHP);
          let hpPer =  (currentHP / maxHP) * 100;
          let userHPGauge = "";
          for(let count = 0; count<20; count++){
            if(hpPer>count*5){
              userHPGauge = userHPGauge+"■";
            }
            else{
              userHPGauge = userHPGauge+"□";
            }
          }

          // 몬스터 체력바
          let targetHPbar= "";
          let targetCurrentHP = Number(this.props.monster.hp);
          let targetMaxHP = Number(this.props.monster.maxHP);
          let targetHpPer =  (targetCurrentHP / targetMaxHP) * 100;
          for(let count = 0; count<20; count++){
            if(targetHpPer>count*5){
              targetHPbar = targetHPbar+"■";
            }
            else{
              targetHPbar = targetHPbar+"□";
            }
          }

          //유저 MP바

          let userMPbar= "";
          let userCurrentMP = this.props.userInfo.mp;
          let userMaxMP = this.props.userInfo.max_mp;
          let userMpPer =  (userCurrentMP / userMaxMP) * 100;
          for(let count = 0; count<20; count++){
            if(userMpPer>count*5){
              userMPbar = userMPbar+"■";
            }
            else{
              userMPbar = userMPbar+"□";
            }
          }




          this.state = {
              userHPbar:userHPGauge,
              userHP:currentHP+" / "+maxHP,
              userMPbar:userMPbar,
              userMP:userCurrentMP+"/"+userMaxMP,
              targetHPbar:targetHPbar,
              targetHP:targetCurrentHP +"/"+targetMaxHP,
              socketCh:'0-0',
              containerClass:"HP-view",
              criticalClass:"cri-no"
          };
          this.viewTargetHP = this.viewTargetHP.bind(this);
          this.viewUserHP = this.viewUserHP.bind(this);
          this.viewUserMP= this.viewUserMP.bind(this);
          this.socket = this.props.socket;
          this.vibrationComp = this.vibrationComp.bind(this);

      }


    componentDidMount(){

      /*  this.setState({
            userHP: userHPGauge
          });*/


      let viewTargetHP = this.viewTargetHP.bind(this);
      let viewUserHP = this.viewUserHP.bind(this);

      this.socket.on(this.props.attackInfo.userName+'userHP', function(data){ //몬스터 체력
      viewUserHP(data);
      });
      this.socket.on(this.props.attackInfo.userName+'userMP', function(data){ //몬스터 체력
      this.viewUserMP(data);
      }.bind(this));
      this.socket.on(this.props.attackInfo.ch+'monsterHP', function(data){ //몬스터 체력
      console.log(data);
      viewTargetHP(data);
      });
      this.socket.on(this.props.attackInfo.userName+'[Cri]', function(data){ //몬스터 체력
      console.log("크리티컬!!!");
      this.vibrationComp();
    }.bind(this));

    }

    componentWillUnmount () {
      this.socket.off(this.props.attackInfo.userName+'[Cri]');
      this.socket.off(this.props.attackInfo.userName+'userHP');
      this.socket.off(this.props.attackInfo.userName+'userMP');
      this.socket.off(this.props.attackInfo.ch+'monsterHP');
    }

  viewUserHP(data){
      let userHPArr = data.split("-");
      let userHP= "";
      let currentHP = Number(userHPArr[0]);
      let maxHP = Number(userHPArr[1]);

      let hpPer =  (currentHP / maxHP) * 100;
      for(let count = 0; count<20; count++){
        if(hpPer>count*5){
          userHP = userHP+"■";
        }
        else{
          userHP = userHP+"□";
        }

      }

      this.setState({
          userHPbar: userHP,
          userHP:currentHP+" / "+maxHP,
        });
    }

    viewUserMP(data){
        let userMPArr = data.split("-");
        let userMP= "";
        let currentMP = Number(userMPArr[0]);
        let maxMP = Number(userMPArr[1]);

        let mpPer =  (currentMP / maxMP) * 100;
        for(let count = 0; count<20; count++){
          if(mpPer>count*5){
            userMP = userMP+"■";
          }
          else{
            userMP = userMP+"□";
          }

        }

        this.setState({
            userMPbar: userMP,
            userMP:currentMP+" / "+maxMP,
          });
      }

viewTargetHP(data){
      let targetHPArr = data.split("-");

      let targetHP= "";
      let currentHP = Number(targetHPArr[0]);
      let maxHP = Number(targetHPArr[1]);

      let hpPer =  (currentHP / maxHP) * 100;
      for(let count = 0; count<20; count++){
        if(hpPer>count*5){
          targetHP = targetHP+"■";
        }
        else{
          targetHP = targetHP+"□";
        }

      }
      this.setState({
          targetHPbar: targetHP,
          targetHP:currentHP+" / "+maxHP,
        });
    }

  vibrationComp(){
    if(this.state.containerClass=="HP-view"){
      console.log(this.state.containerClass);
      this.setState({
          containerClass:"HP-view hp-vibration",
          criticalClass:"cri-yes"
        });

        setTimeout( function(){
            if(this.state.containerClass=="HP-view hp-vibration"){
              this.setState({
                  containerClass:"HP-view",
                  criticalClass:"cri-no"
                });
            }
          }.bind(this), 500);
    }
  }



    render(){

        return (
          <div id="mapViewContainer" className={this.state.containerClass}>
            <div>
              <span>{this.props.attackInfo.userName} HP:</span><span className="hp-bar">{this.state.userHPbar}</span><span>  {this.state.userHP}</span>
            </div>
            <div>
              <span>{this.props.attackInfo.userName} MP:</span><span className="hp-bar">{this.state.userMPbar}</span><span>  {this.state.userMP}</span>
            </div>
            <div>
              <span>{this.props.attackInfo.target} HP:</span><span className="hp-bar">{this.state.targetHPbar}</span><span>  {this.state.targetHP}</span>
            </div>
            <div className={this.state.criticalClass}><span className="cri-span"></span> Critical!!!</div>
          </div>
        );
    }
}

export default HPview;
