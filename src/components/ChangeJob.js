import React from 'react';
import axios from 'axios';
import { browserHistory, Link } from 'react-router';
import { connect } from 'react-redux';
import { getStatusRequest  } from 'Actions/authentication';
class ChangeJob extends React.Component {
    constructor(props) {
        super(props);

        let ma = false;
        let as = false;
        let sw = false;

        if(this.props.userInfo.job=="검사"){
          sw =  true;
        }
        if(this.props.userInfo.job=="마법사"){
          ma =  true;
        }
        if(this.props.userInfo.job=="암살자"){
          as =  true;
        }



        this.state = {
            keyword: '',
            ma:ma,
            as:as,
            sw:sw
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




    var con_test = confirm("전직 하시겠습니까?");
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

      const maList = (
              <li><a onClick={this.toggleOpenChangeJob}  className="waves-effect waves-light btn red controller-btn attack-btn">전직</a></li>
      );


        return (
          <div className="item-store-screen center-align">
              <div className="right">
                  <a className="waves-effect waves-light btn red lighten-1"
                      onClick={this.handleClose}>CLOSE</a>
              </div>
              <div className="container item-container">
                더 높은 경지를 향해
                전직을 위해선 레벨 40이상이 되어야 합니다.
                골드가 10만 골드 소모 됩니다.
                <p>소지금 : <span>{this.props.userInfo.gold}</span> Gold</p>
                  <ul className="collapsible item-list user-inven-ul" data-collapsible="accordion">
                    <li>
                      <div className="collapsible-header"><span className="badge">더 높은 경지를 향한다. </span></div>
                      <div className="collapsible-body item-msg">
                        <span>"더 높은 경지를 위해서는 그릇을 비워야 합니다."</span>
                        <p>기존의 스킬들은 사용 할 수가 없게 됩니다.</p>
                        <p><a onClick={this.requestChangeJob.bind(this,this.props.userInfo.job)}  className="waves-effect waves-light btn">전직한다</a></p>
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
