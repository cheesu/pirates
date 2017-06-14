import React from 'react';
import { browserHistory, Link } from 'react-router';
import { connect } from 'react-redux';
import { getStatusRequest  } from 'Actions/authentication';
import { skillRequest  } from 'Actions/skill';
class RightMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keyword: ''
        };

        this.handleClose = this.handleClose.bind(this);
        this.handleRightMenu = this.handleRightMenu.bind(this);
      var userName = this.props.status.currentUser;
    }

    handleClose() {
        this.handleRightMenu('');
        this.props.onClose();
    }


    handleRightMenu(keyword) {
        // TO BE IMPLEMENTED
    }

  componentDidMount(){
      this.props.getStatusRequest();
      this.props.skillRequest(this.props.status);
       $('.collapsible').collapsible();
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
                          <li> JOB: <span>{this.props.status.job}</span></li>
                          <li className="stat-li"> STR: <span>{this.props.status.str}</span></li>
                          <li className="stat-li"> DEX: <span>{this.props.status.dex}</span></li>
                          <li className="stat-li"> INT: <span>{this.props.status.int}</span></li>


                          <li> EXP: <span>{this.props.status.exp}</span></li>
                          <li>  </li>
                      </ul>
                    </div>

                    <ul className="right-menu-results">
                        <li> INVEN </li>
                        <li> STATUS </li>
                    </ul>

                    <ul className="collapsible skill-set" data-collapsible="accordion">
                      { mapDataToLinks(this.props.skills) }
                    </ul>

                </div>
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
