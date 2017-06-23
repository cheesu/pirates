import React from 'react';
import { connect } from 'react-redux';
import AdSense from 'react-adsense';
import { Chat, Homeview , Controller, Mapview} from 'Components';
import { getStatusRequest  } from 'Actions/authentication';
import { userItemRequest  } from 'Actions/item';
import cookie from 'react-cookies'

import { browserHistory, Link, Redirect } from 'react-router';


class Home extends React.Component {

  constructor(props, context) {
          super(props, context);

          this.state = {
              useScroll:false,
              msg:"하얀 빛이 몸을 감쌉니다",
          };
      }

      componentWillUnmount(){

      }

      componentDidMount() {
        cookie.save("map", "0-0", { path: '/' });

        let count  = 0;
        console.log("인터벌 도는지 테스트 합니다");
    let inter =  setInterval(function(){
            console.log("인터벌 도는지 테스트 합니다123123");
            console.log(this.state.useScroll);

            if(count==1){
              this.setState({
                msg:"정신이 멍해지며 몸이 붕 뜨는 기분입니다."
              });
            }
            else if(count==2){
              this.setState({
                msg:"마치 빛으로된 터널을 통과하는 기분이 듭니다.."
              });
            }
            else if(count==5){
              this.setState({
                msg:"터널을 통과하자 아무것도 보이지 않습니다."
              });
            }
            else if(count==6){
              this.setState({
                msg:"주변이 서서히 밝아지며 풍경이 바뀌는 것을 느낍니다."
              });
            }




          if(count==7){
            console.log("인터벌 도는지 테스트 합니다 카운트5");
            this.setState({
              useScroll:true
            });
            clearInterval(inter);
          }
          count++;
        }.bind(this), 1000);



       }

    render() {
      const goScroll = ( <Redirect to="/game"/> );
        return (
            <div className="wrapper ad-container">
              { this.state.useScroll  ? goScroll : undefined }
              <p className="use-scroll-msg">이동중......</p>
                <p className="use-scroll-msg">{ this.state.msg}</p>
                <AdSense.Google client='ca-pub-9010179770404458'
                        slot='7691911320' />

            </div>
        );
    }
}



const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.authentication.status.isLoggedIn,
        status: state.authentication.status,
        items: state.item.items,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getStatusRequest: () => {
            return dispatch(getStatusRequest());
        },
        userItemRequest: () => {
            return dispatch(userItemRequest());
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
