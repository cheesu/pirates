import React from 'react';
import axios from 'axios';
import {debounce} from 'throttle-debounce';
import { connect } from 'react-redux';
import { getStatusRequest  } from 'Actions/authentication';
import { skillRequest  } from 'Actions/skill';
class FightController extends React.Component {
  constructor(props, context) {
          super(props, context);
          this.state = {
              msg: "",
              fighting:true,
          };

          this.handleClose = this.handleClose.bind(this);
          this.handleCloseExit = this.handleCloseExit.bind(this);
          this.toggleFight = this.toggleFight.bind(this);
          this.useSkill = this.useSkill.bind(this);
      }


      componentDidMount(){
        this.props.getStatusRequest();
        this.props.skillRequest(this.props.status);
        $('.dropdown-button').dropdown({
              inDuration: 10,
             outDuration: 10,
             constrainWidth: false, // Does not change width of dropdown to that of the activator
             hover: true, // Activate on hover
             gutter: 0, // Spacing from edge
             belowOrigin: false, // Displays dropdown below the button
             alignment: 'left', // Displays dropdown with edge aligned to the left of button
             stopPropagation: false // Stops event propagation
           });


          this.props.socket.emit('attack',this.props.attackInfo);

          let toggleFight = this.toggleFight.bind(this);
          this.props.socket.on(this.props.attackInfo.userName+"endFight", function(data){ //귓말
          console.log("전투 끝");
          toggleFight();
          });

          this.props.socket.on(this.props.attackInfo.userName+"DEAD", function(data){ //귓말
          console.log("님 으앙쥬금");
          toggleFight();
          });

      }

      componentWillUnmount () {
        this.props.socket.off(this.props.attackInfo.userName+"endFight");
        this.props.socket.off(this.props.attackInfo.userName+"DEAD");

      }

      handleClose() {
          this.props.socket.emit('run',this.props.attackInfo);
          this.props.onClose();
      }

      handleCloseExit() {
          this.props.onClose();
      }

      toggleFight(){
        console.log("체인지 텍스트");
        this.setState({
          fighting:!this.state.fighting,
        });
      }

      useSkill(skill){

        let skillObj = {};
        skillObj.skillname=skill;
        skillObj.username = this.props.attackInfo.userName;
        skillObj.ch = this.props.attackInfo.ch;
        this.props.socket.emit('useSkill',skillObj);
      }


    render(){
      const run = (
          <li className="fight-btn-li"><a onClick={this.handleClose}  className="waves-effect waves-light btn red ">Run</a></li>
      );

      const exit = (
          <li className="fight-btn-li"><a onClick={this.handleCloseExit}  className="waves-effect waves-light btn red ">Exit</a></li>
      );

      const mapDataToLinks = (data) => {
          return data.map((skill, i) => {
            if(skill.lv > this.props.status.lv){
              return (
                  <li key={i} className="disabled"><a href="#!" className="disabled" >{skill.name} - {skill.mp}mp</a></li>
               );
            }
            else{
              return (
                  <li key={i}  ><a href="#!" onClick={this.useSkill.bind(this,skill.name)} data-name={skill.name} >{skill.name} - {skill.mp}mp</a></li>
               );
              }
          });
      };

        return (
          <div className="fight-controller-container">
                <ul className="fight-btn-ul">
                { /*    <li><a onClick={this.viewLocalMap}  ><i className="medium  material-icons controller-btn map-location waves-effect waves-light">my_location</i></a></li> */}

                    { this.state.fighting  ? run : exit }

                    <li className="fight-btn-li">
                      <a id="skillDrop" className='dropdown-button btn' href='#!' data-activates='dropdown1' >Use Skill</a>
                       <ul id='dropdown1' className='dropdown-content'>
                          { mapDataToLinks(this.props.skills) }
                       </ul>
                    </li>

                    <li className="fight-btn-li">
                      <a id="itemDrop" ref="itemDrop" className='dropdown-button btn' href='#!' data-activates='dropdown2' >Use Item</a>
                       <ul id='dropdown2' className='dropdown-content'>
                         <li><a href="#!">미구현</a></li>
                         <li><a href="#!">미구현</a></li>
                         <li className="divider"></li>
                         <li><a href="#!">미구현</a></li>
                       </ul>
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
      status: state.authentication.status,
        skills: state.skill.skills,
    };
};


const mapDispatchToProps = (dispatch) => {
    return {
      getStatusRequest: () => {
          return dispatch(getStatusRequest());
      },
        skillRequest: (userInfo) => {
            return dispatch(skillRequest(userInfo));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FightController);
