import React from 'react';
import { CurrentUser } from 'Components';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
class HPview extends React.Component {

  constructor(props, context) {
          super(props, context);
          this.state = {
              userHP:0,
              targetHP:0,
              socketCh:'0-0'
          };
          this.viewUserHP = this.viewUserHP.bind(this);
          this.socket = this.props.socket;


      }


    componentDidMount(){


      let viewUserHP = this.viewUserHP.bind(this);
      this.socket.on('userHP', function(data){ //개인
      //  addChat(data);
      viewUserHP(data);
      });

      this.socket.on('targetHP', function(data){ //개인
      //  addChat(data);
      viewUserHP(data);
      });

    }

    componentWillUnmount () {
      this.socket.off('targetHP');
    }

    viewUserHP(data){
      this.setState({
          userHP: data
        });
    }

    render(){
        return (
          <div id="mapViewContainer" className="HP-view">
            <div>
              <span>{this.props.attackInfo.userName} :</span><span>■■■■■■■■■■■■■■■■■■■■</span>
            </div>
            <div>
              <span>{this.props.attackInfo.target} :</span><span>■■■■■■■■■■■■■■■■■■■■</span>
            </div>
            <div>test</div>
          </div>
        );
    }
}

export default HPview;
