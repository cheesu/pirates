import React from 'react';
import { browserHistory, Link } from 'react-router';
import { HPview, Fightview, FightController} from 'Components';


class Fight extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            userList: [],
        };
        console.log("생성");
        this.handleClose = this.handleClose.bind(this);
        this.socket = this.props.socket;
        this.props.attackInfo;
    }

    componentWillUnmount () {

    }



    componentDidMount(){
      console.log("파이트 화면 뷰");
    }

    handleClose() {
        this.props.onClose();
    }





    render() {

      const fightComp = (
            <div className="fight-comp-wrapper">
              <HPview
                socket={this.socket}
                attackInfo = {this.props.attackInfo}
                userInfo = {this.props.userInfo}
                monster = {this.props.monster}
                />

              <Fightview
                socket={this.socket}
                attackInfo = {this.props.attackInfo}
                />
              <FightController
                socket={this.socket}
                attackInfo = {this.props.attackInfo}
                userInfo = {this.props.userInfo}
                onClose = {this.props.onClose}
                />
            </div>
      );

        return (
            <div className="fight-container-screen">
              {fightComp}
            </div>
        );
    }
}

Fight.propTypes = {
    onClose: React.PropTypes.func
};

Fight.defaultProps = {
    onClose: () => {
        console.error('onClose not defined');
    }
};

export default Fight;
