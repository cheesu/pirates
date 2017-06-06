import React from 'react';
import { browserHistory, Link } from 'react-router';
import { connect } from 'react-redux';
import { getStatusRequest  } from 'Actions/authentication';
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
  }

    render() {

        const mapDataToLinks = (data) => {
            // IMPLEMENT: map data array to array of Link components
            // create Links to '/wall/:username'
        };

        return (
            <div className="right-menu-screen white-text">
                <div className="right">
                    <a className="waves-effect waves-light btn red lighten-1"
                        onClick={this.handleClose}>CLOSE</a>
                </div>
                <div className="container">
                    <br></br>
                    <br></br><br></br><br></br>
                    <div className="user-info">
                      <ul className="right-menu-results">
                          <li> ID: <span>{this.props.status.currentUser}</span></li>
                          <li> LV: <span>{this.props.status.lv}</span></li>
                          <li> JOB: <span>{this.props.status.job}</span></li>
                          <li> EXP: <span>{this.props.status.exp}</span></li>
                          <li>  </li>
                      </ul>
                    </div>

                    <ul className="right-menu-results">
                        <li> INVEN </li>
                        <li> STATUS </li>
                    </ul>

                    <div className="collection skill-set">
                      <a href="#!" className="collection-item"><span className="badge">10mp</span>스킬1</a>
                      <a href="#!" className="new collection-item"><span className="badge">20mp</span>스킬2</a>
                      <a href="#!" className="collection-item"><span className="badge">40mp</span>스킬4</a>
                      <a href="#!" className="collection-item"><span className="badge">14</span>스킬3</a>
                    </div>

                    <ul className="right-menu-skill">
                        { mapDataToLinks(this.props.usernames) }

                    </ul>

                </div>
            </div>
        );
    }
}


RightMenu.propTypes = {
    onClose: React.PropTypes.func,
    onRightMenu: React.PropTypes.func
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
        status: state.authentication.status
    };
};


const mapDispatchToProps = (dispatch) => {
    return {
        getStatusRequest: () => {
            return dispatch(getStatusRequest());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(RightMenu);
