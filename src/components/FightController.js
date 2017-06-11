import React from 'react';
import axios from 'axios';

class FightController extends React.Component {
  constructor(props, context) {
          super(props, context);


          this.state = {
              msg: "",
              map:[],
              monster:null,
              next:false,
              prev:false,
              fighting:false,
          };

          this.handleClose = this.handleClose.bind(this);
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

      }

      handleClose() {
          console.log(this.props.attackInfo);
          this.props.socket.emit('run',this.props.attackInfo);
          this.props.onClose();

      }





    render(){


        return (
          <div className="fight-controller-container">
                <ul className="fight-btn-ul">
                { /*    <li><a onClick={this.viewLocalMap}  ><i className="medium  material-icons controller-btn map-location waves-effect waves-light">my_location</i></a></li> */}
                    <li className="fight-btn-li"><a onClick={this.handleClose}  className="waves-effect waves-light btn red ">Run</a></li>


                    <li className="fight-btn-li">
                      <a className='dropdown-button btn' href='#' data-activates='dropdown1'>Use Skill</a>
                       <ul id='dropdown1' className='dropdown-content'>
                         <li><a href="#!">one</a></li>
                         <li><a href="#!">two</a></li>
                         <li className="divider"></li>
                         <li><a href="#!">three</a></li>
                       </ul>
                    </li>
                    <li className="fight-btn-li"><a  className="waves-effect waves-light btn red ">Use Item</a></li>

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
