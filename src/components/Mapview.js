import React from 'react';
import { CurrentUser } from 'Components';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import cookie from 'react-cookies'
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
      data = null;
    }

    render(){

        return (
          <div id="mapViewContainer" className="map-view">
            {this.state.map.map(function(map,i){
              let mode =   cookie.load("mode");

              if(mode=="comp"){
                return <p className="map-view-p" key={i}>{map}</p>
              }
              else{
                return <p className="map-view-p chrome" key={i}>{map}</p>
              }


            })}
            <div>☆: 나의위치, □:갈 수 있는길, ■:못감, ♨:상점 ,※:다음맵</div>
          </div>
        );
    }
}

export default Mapview;
