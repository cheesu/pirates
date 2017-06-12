import React from 'react';
import axios from 'axios';

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
      }


      componentDidMount(){

        $('.dropdown-button').dropdown({
             inDuration: 300,
             outDuration: 225,
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



    render(){
      const run = (
          <li className="fight-btn-li"><a onClick={this.handleClose}  className="waves-effect waves-light btn red ">Run</a></li>
      );

      const exit = (
          <li className="fight-btn-li"><a onClick={this.handleCloseExit}  className="waves-effect waves-light btn red ">Exit</a></li>
      );

        return (
          <div className="fight-controller-container">
                <ul className="fight-btn-ul">
                { /*    <li><a onClick={this.viewLocalMap}  ><i className="medium  material-icons controller-btn map-location waves-effect waves-light">my_location</i></a></li> */}

                    { this.state.fighting  ? run : exit }

                    <li className="fight-btn-li">
                      <a className='dropdown-button btn' href='#' data-activates='dropdown1'>Use Skill</a>
                       <ul id='dropdown1' className='dropdown-content'>
                         <li><a href="#!">미구현</a></li>
                         <li><a href="#!">미구현</a></li>
                         <li className="divider"></li>
                         <li><a href="#!">미구현</a></li>
                       </ul>
                    </li>

                    <li className="fight-btn-li">
                      <a className='dropdown-button btn' href='#' data-activates='dropdown2'>Use Item</a>
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

export default FightController;
