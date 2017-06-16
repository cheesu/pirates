import React from 'react';
import { CurrentUser } from 'Components';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
class Mapview extends React.Component {

  constructor(props, context) {
          super(props, context);
          this.state = {
              search: false,
              map: ['test'],
              socketCh:'0-0'
          };
          this.moveMapView = this.moveMapView.bind(this);
          this.socket = this.props.socket;
      }


    componentDidMount(){
      let moveMapView = this.moveMapView.bind(this);
      this.props.socket.on('viewMap', function(data){ //개인
      //  addChat(data);
      moveMapView(data);
      });

    }

    componentWillUnmount () {
    }

    moveMapView(data){
      this.setState({
          map: data
        });
    /*  this.setState({
        map: ['map']
      });
      this.setState({
        map: this.state.chat.concat(data)
      });*/
    }

    render(){
        return (
          <div id="mapViewContainer" className="map-view">
            {this.state.map.map(function(map,i){
                return <p className="map-view-p" key={i}>{map}</p>
            })}
            <div>☆: 나의위치, □:갈 수 있는길, ■:못감, ♨:상점 ,※:다음맵</div>
          </div>
        );
    }
}

export default Mapview;
