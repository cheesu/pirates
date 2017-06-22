import React from 'react';
import axios from 'axios';
import { browserHistory, Link } from 'react-router';
import { connect } from 'react-redux';
import { getStatusRequest  } from 'Actions/authentication';
class ChangeJob extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keyword: ''
        };

        this.handleClose = this.handleClose.bind(this);
      //    this.props.getChangeJobItemRequest();

    }

    handleClose() {
        this.props.onClose();
    }


  componentDidMount(){
       $('.collapsible').collapsible();
       $('ul.tabs').tabs();

  }


  requestChangeJob(jobName){
    if(this.props.userInfo.gold < 100000){
      alert("돈이 없으면 직업도 바꾸지 못합니다.");
      return false;
    }

    var con_test = confirm(jobName+"(으)로 전직 하시겠습니까?");
    if(con_test){
      axios.get('/api/account/changeJob/' + jobName)
         .then((response) => {
            console.log(response.data);
           this.props.getStatusRequest();

           alert(response.data.msg);
          //  Materialize.toast(eqItem+"을(를) 구매 하였습니다.", 1000);
         }).catch((error) => {
             console.log(error);
         });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
          let current = {
              user: this.props.userInfo,
              ChangeJob: this.props.items,

          };
        let next = {
            user: nextProps.userInfo,
            ChangeJob: nextProps.items,
        };
        let update = JSON.stringify(current) !== JSON.stringify(next);
          return update;
      }

    render() {




        return (
          <div className="item-store-screen center-align">
              <div className="right">
                  <a className="waves-effect waves-light btn red lighten-1"
                      onClick={this.handleClose}>CLOSE</a>
              </div>
              <div className="container item-container">
                직업엔 귀천이 없다.
                전직을 위해선 레벨 40이상이 되어야 합니다.
                골드가 10만 골드 소모 됩니다.
                <p>소지금 : <span>{this.props.userInfo.gold}</span> Gold</p>
                  <ul className="collapsible item-list user-inven-ul" data-collapsible="accordion">

                    <li>
                      <div className="collapsible-header"><span className="badge">투사 </span></div>
                      <div className="collapsible-body item-msg">
                        <span>"신체능력의 극한을 수련하는자. 방어적인 타입"</span>
                        <p><a onClick={this.requestChangeJob.bind(this,"투사")}  className="waves-effect waves-light btn">전직한다</a></p>
                      </div>
                    </li>

                    <li>
                      <div className="collapsible-header"><span className="badge">검객 </span></div>
                      <div className="collapsible-body item-msg">
                        <span>"검한자루 만으로 검의 극의를 걷는자. 공격적인 타입"</span>
                        <p><a onClick={this.requestChangeJob.bind(this,"검객")}  className="waves-effect waves-light btn">전직한다</a></p>
                      </div>
                    </li>

                    <li>
                      <div className="collapsible-header"><span className="badge">닌자 </span></div>
                      <div className="collapsible-body item-msg">
                        <span>"그의 모습을 본 사람은 없다.  회피 특화"</span>
                        <p><a onClick={this.requestChangeJob.bind(this,"닌자")}  className="waves-effect waves-light btn">전직한다</a></p>
                      </div>
                    </li>

                    <li>
                      <div className="collapsible-header"><span className="badge">어쌔신 </span></div>
                      <div className="collapsible-body item-msg">
                        <span>"의뢰받은 사람중 살아있는자는 없다.  공격 특화"</span>
                        <p><a onClick={this.requestChangeJob.bind(this,"어쌔신")}  className="waves-effect waves-light btn">전직한다</a></p>
                      </div>
                    </li>

                    <li>
                      <div className="collapsible-header"><span className="badge">현자 </span></div>
                      <div className="collapsible-body item-msg">
                        <span>"끝없이 세계의 비밀을 탐구하는 현자  공격적인 타입"</span>
                        <p><a onClick={this.requestChangeJob.bind(this,"현자")}  className="waves-effect waves-light btn">전직한다</a></p>
                      </div>
                    </li>

                    <li>
                      <div className="collapsible-header"><span className="badge">성자 </span></div>
                      <div className="collapsible-body item-msg">
                        <span>"깨달음을 얻은자  방어적인 타입"</span>
                        <p><a onClick={this.requestChangeJob.bind(this,"성자")}  className="waves-effect waves-light btn">전직한다</a></p>
                      </div>
                    </li>

                  </ul>

              </div>
          </div>
        );
    }
}


ChangeJob.propTypes = {
    onClose: React.PropTypes.func
};

ChangeJob.defaultProps = {
    onClose: () => {
        console.error('onClose not defined');
    },
};

const mapStateToProps = (state) => {
    return {
        items: state.item.storeItems,
        userItems: state.item.items,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getStatusRequest: () => {
            return dispatch(getStatusRequest());
        },
    };
};

export default connect( mapStateToProps, mapDispatchToProps)(ChangeJob);
