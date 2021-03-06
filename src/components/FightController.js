import React from 'react';
import axios from 'axios';
import {debounce} from 'throttle-debounce';
import { connect } from 'react-redux';
import { skillRequest  } from 'Actions/skill';
import cookie from 'react-cookies';
class FightController extends React.Component {
  constructor(props, context) {
          super(props, context);
          this.state = {
              msg: "",
              fighting:true
          };

          this.handleClose = this.handleClose.bind(this);
          this.handleCloseExit = this.handleCloseExit.bind(this);
          this.toggleFight = this.toggleFight.bind(this);
          this.useSkill = this.useSkill.bind(this);
          this.useItem = this.useItem.bind(this);
          this.handleKeyPress = this.handleKeyPress.bind(this);
          this.props.userItemRequest();
      }


      componentDidMount(){
        this.props.skillRequest(this.props.status);

          this.props.socket.emit('attack',this.props.attackInfo);
          let handleCloseExit = this.handleCloseExit.bind(this);
          let toggleFight = this.toggleFight.bind(this);
          this.props.socket.on(this.props.attackInfo.userName+"endFight", function(data){ //귓말
            toggleFight();
            //handleCloseExit();
            let closeMode =  cookie.load("closeMode");
            if(closeMode=="auto"){
              handleCloseExit();
            }
          });

          this.props.socket.on(this.props.attackInfo.userName+"[SkillEnd]", function(data){ //귓말
          $(".skill-btn").attr('class','waves-effect waves-light btn item-btn skill-btn');
        }.bind(this));

          this.props.socket.on(this.props.attackInfo.userName+"DEAD", function(data){ //귓말
          console.log("님 으앙쥬금");
          toggleFight();
          handleCloseExit();
          });

      }

      componentWillUnmount () {
        this.props.socket.off(this.props.attackInfo.userName+"endFight");
        this.props.socket.off(this.props.attackInfo.userName+"DEAD");

      }

      handleKeyPress(e) {
/*        console.log("testtesttest");
        let skillBtn = $(".skill-btn");
        console.log(skillBtn);
        console.log(e.charCode);

             if(e.charCode==113) {
                skillBtn[0].onClick;
             }
             else if(e.charCode==119){
               skillBtn[1].onClick;
             }
             else if(e.charCode==101){
               skillBtn[2].onClick;
             }
*/

         }

      handleClose() {
        this.props.getStatusRequest();
          this.props.socket.emit('run',this.props.attackInfo);
          this.props.onClose();
      }

      handleCloseExit() {
        this.props.getStatusRequest();
          this.props.onClose();
      }

      toggleFight(){
        this.setState({
          fighting:!this.state.fighting,
        });
      }

      useSkill(skill){

        if(!this.state.fighting){
          return false;
        }

        $(".skill-btn").attr('class','waves-effect waves-light btn item-btn skill-btn disabled');

        let skillObj = {};
        skillObj.skillname=skill;
        skillObj.username = this.props.attackInfo.userName;
        skillObj.ch = this.props.attackInfo.ch;
        skillObj.party = this.props.attackInfo.party;
        skillObj.partyMember = this.props.attackInfo.partyMember;
        skillObj.mapName = this.props.attackInfo.mapName;

        this.props.socket.emit('useSkill',skillObj);
      }

      useItem(itemId){
           axios.get('/api/account/fightUseItem/' + itemId)
              .then((response) => {
                let result = response.data.result;
                if(result){
                  let healInfo = {};
                  healInfo.heal =response.data.obj.heal;
                  healInfo.upData =response.data.obj.upData;
                  healInfo.ch = this.props.attackInfo.ch;
                  healInfo.username = this.props.attackInfo.userName;
                  healInfo.maxHP = this.props.status.max_hp;
                  healInfo.maxMP = this.props.status.max_mp;
                  this.props.socket.emit('useItem',healInfo);
                  this.props.getStatusRequest();
                }

              }).catch((error) => {
                  console.log(error);
              });
      }

    shouldComponentUpdate(nextProps, nextState) {
      let current = {
          fighting: this.state.fighting,
          itemCount: this.props.status.itemCount,
          skills: this.props.skills
          };
      let next = {
          fighting: nextState.fighting,
          itemCount: nextProps.status.itemCount,
          skills: nextProps.skills
          };
      let update = JSON.stringify(current) !== JSON.stringify(next);
      return update;
    }


    render(){
      const run = (
          <a onClick={this.handleClose}  className="waves-effect waves-light btn red ">Run</a>
      );

      const exit = (
          <a onClick={this.handleCloseExit}  className="waves-effect waves-light btn red ">Exit</a>
      );

      const mapDataToLinks = (data) => {
          return data.map((skill, i) => {
            if(skill.lv <= this.props.status.lv && skill.type != "passive" ){
              return (
                  <a key={i} className='waves-effect waves-light btn item-btn skill-btn' href="#!" onClick={this.useSkill.bind(this,skill.name)} data-name={skill.name} >{skill.name} - {skill.mp}mp</a>
               );
            }
          });
      };

      const itemMapDataToLinks = (data) => {
          return data.map((item, i) => {
              if((item.kind == "p"||item.kind == "rp") && this.props.status.itemCount[item.id] != 0 && this.props.status.itemCount[item.id]!=undefined){
                return (
                  <a key={i} className='waves-effect waves-light btn item-btn' href="#!" onClick={this.useItem.bind(this,item.id)} data-name={item.name} >{item.name}- {this.props.status.itemCount[item.id]}개</a>
                )
              }
          });
      };


        return (
          <div id="fightControllerContainer" className="fight-controller-container" onKeyPress={this.handleKeyPress}>
                <ul className="fight-btn-ul">
                { /*    <li><a onClick={this.viewLocalMap}  ><i className="medium  material-icons controller-btn map-location waves-effect waves-light">my_location</i></a></li> */}

                  <li className="fight-btn-li">
                       { itemMapDataToLinks(this.props.userItems.itemList) }
                  </li>

                    <li className="fight-btn-li">
                          { this.state.fighting  ? run : exit }
                          { mapDataToLinks(this.props.skills) }
                    </li>




                </ul>
            </div>
        );
    }
}


FightController.propTypes = {
    onClose: React.PropTypes.func
};

FightController.defaultProps = {
    onClose: () => {
        console.error('onClose not defined');
    }
};

const mapStateToProps = (state) => {
    return {
        skills: state.skill.skills,
    };
};


const mapDispatchToProps = (dispatch) => {
    return {
        skillRequest: (status) => {
            return dispatch(skillRequest(status));
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FightController);
