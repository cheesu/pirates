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

          this.state = {
              userHPbar:userHPGauge,
              userHP:currentHP+" / "+maxHP,
              targetHPbar:"■■■■■■■■■■■■■■■■■■■■",
              targetHP:"max/max",
              socketCh:'0-0',
              containerClass:"HP-view",
          };
          this.viewTargetHP = this.viewTargetHP.bind(this);
          this.viewUserHP = this.viewUserHP.bind(this);
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
        });

        setTimeout( function(){
            if(this.state.containerClass=="HP-view hp-vibration"){
              console.log(this.state.containerClass);
              this.setState({
                  containerClass:"HP-view",
                });
            }
          }.bind(this), 500);
    }
  }



    render(){
        return (
          <div id="mapViewContainer" className={this.state.containerClass}>
            <div>
              <span>{this.props.attackInfo.userName} :</span><span className="hp-bar">{this.state.userHPbar}</span><span>  {this.state.userHP}</span>
            </div>
            <div>
              <span>{this.props.attackInfo.target} :</span><span className="hp-bar">{this.state.targetHPbar}</span><span>  {this.state.targetHP}</span>
            </div>
            <div>test</div>
          </div>
        );
    }
}

export default HPview;
