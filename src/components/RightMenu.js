import React from 'react';
import { browserHistory, Link } from 'react-router';
import { connect } from 'react-redux';
import { getStatusRequest  } from 'Actions/authentication';
import { skillRequest  } from 'Actions/skill';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import {UserItem } from 'Components';
class RightMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keyword: '',
            userItem:false,
            expPer:0,
            nextLVExp:0,
        };

        this.handleClose = this.handleClose.bind(this);
        this.handleRightMenu = this.handleRightMenu.bind(this);
        this.toggleUserItem = this.toggleUserItem.bind(this);
        this.onAllClose = this.onAllClose.bind(this);

        this.calcExp = this.calcExp.bind(this);

      var userName = this.props.status.currentUser;
    }

    onAllClose(){
      this.toggleUserItem();
      this.handleClose();
    }

    handleClose() {
        this.handleRightMenu('');
        this.props.onClose();
    }


    handleRightMenu(keyword) {
        // TO BE IMPLEMENTED
    }

    toggleUserItem(){
      this.setState({
          userItem: !this.state.userItem
      });
    }

  componentDidMount(){
      this.props.getStatusRequest();
      this.props.skillRequest(this.props.status);
      this.calcExp();
       $('.collapsible').collapsible();
  }

calcExp(){
  let currentLV = this.props.status.lv;
  let nextLV = this.props.status.lv+1;
  let addLV = Math.floor(currentLV/10);
  let addNextLV = Math.floor(nextLV/10);

  if(addLV==0){
    addLV = 1;
  }
  if(addNextLV==0){
    addNextLV = 1;
  }

  let currentLVExp = ((this.logB(currentLV, 20)*1000)*currentLV*currentLV/6)*addLV;
//  let nextLVExp = ((this.logB(nextLV, 20)*1000)*nextLV*nextLV/6)*addNextLV;
  let currentTotalExp = this.props.status.exp;
  //let upExp = nextLVExp - currentLVExp;
  //let nowExp = currentTotalExp - currentLVExp;
  //let expPercent = nowExp / upExp * 100;
currentLVExp = Math.floor(currentLVExp);
  //expPercent = expPercent.toFixed(2);
  this.setState({
      nextLVExp:currentLVExp
  });






}

logB(x, base) {
  return Math.log(x) / Math.log(base);
}

    render() {

      const mapDataToLinks = (data) => {
          return data.map((skill, i) => {
            if(skill.lv > this.props.status.lv){
              return (
                <li key={i}>
                  <div className="collapsible-header"><span className="badge red">[lv:{skill.lv} - 사용불가]</span>{skill.name} - {skill.mp}mp</div>
                  <div className="collapsible-body"><span>{skill.txt}</span></div>
                </li>
               );
            }
            else{
              return (
                    <li key={i}>
                      <div className="collapsible-header"><span className="badge">[lv:{skill.lv}]</span>{skill.name} - {skill.mp}mp</div>
                      <div className="collapsible-body"><span>{skill.txt}</span></div>
                    </li>
                  );
                }


          });
      };

        return (
            <div className="right-menu-screen white-text">
                <div className="right">
                    <a className="waves-effect waves-light btn red lighten-1"
                        onClick={this.handleClose}>CLOSE</a>
                </div>
                <div className="container">
                    <br></br>
                    <br></br><br></br>
                    <div className="user-info">
                      <ul className="right-menu-results">
                          <li> ID: <span>{this.props.status.currentUser}</span></li>
                          <li> LV: <span>{this.props.status.lv}</span></li>
                          <li> HP: <span>{this.props.status.hp} / {this.props.status.max_hp}</span></li>
                          <li> MP: <span>{this.props.status.mp} / {this.props.status.max_mp}</span></li>
                          <li> JOB: <span>{this.props.status.job} {this.props.status.job2} </span>

                          </li>
                          <li className="stat-li"> STR: <span>{this.props.status.str}</span></li>
                          <li className="stat-li"> DEX: <span>{this.props.status.dex}</span></li>
                          <li className="stat-li"> INT: <span>{this.props.status.int}</span></li>
                          <li> EXP: <span>{this.props.status.exp}</span></li>
                          <li> NEXT EXP: <span>{this.state.nextLVExp}</span></li>
                          <li>  </li>
                      </ul>
                    </div>

                    <ul className="right-menu-results">
                        <li><a onClick={this.toggleUserItem}  className="waves-effect waves-light btn inven-btn">INVEN</a></li>
                    </ul>

                    <ul className="collapsible skill-set" data-collapsible="accordion">
                      { mapDataToLinks(this.props.skills) }
                    </ul>

                </div>

                <ReactCSSTransitionGroup transitionName="user-item" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                     { /* IMPLEMENT: SHOW SEARCH WHEN SEARCH STATUS IS TRUE */}
                     {this.state.userItem ? <UserItem onClose={this.toggleUserItem}
                                                      onAllClose={this.onAllClose}
                                                      userInfo = {this.props.status}
                                                  /> : undefined }
                </ReactCSSTransitionGroup>
            </div>
        );
    }
}


RightMenu.propTypes = {
    onClose: React.PropTypes.func,
    onRightMenu: React.PropTypes.func,
    onSearch: React.PropTypes.func,
};

RightMenu.defaultProps = {
    onClose: () => {
        console.error('onClose not defined');
    },
    onRightMenu: () => {
        console.error('onRightMenu not defined');
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

export default connect(mapStateToProps, mapDispatchToProps)(RightMenu);
