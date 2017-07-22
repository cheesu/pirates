import React from 'react';
import axios from 'axios';
import { browserHistory, Link } from 'react-router';
import { connect } from 'react-redux';
import { getStatusRequest  } from 'Actions/authentication';
class Enhancement extends React.Component {
    constructor(props) {
        super(props);




        this.state = {
            keyword: '',
        };

        this.handleClose = this.handleClose.bind(this);
      //    this.props.getEnhancementItemRequest();

    }

    handleClose() {
        this.props.onClose();
    }


  componentDidMount(){
       $('.collapsible').collapsible();
       $('ul.tabs').tabs();

  }

  requestChangeOption(userInfo, grade){
    if(this.props.userInfo.mount.w.type != 'private'){
      alert("개인전용 무기를 착용한 상태에서만 옵션을 부여 할 수 있습니다. 개인무기는 레벨 15를 달성후 운영자에게 요청하시면 얻을 수 있습니다.");
      return false;
    }


    let price = 20000;

    if(grade==5){
      price = 120000;
    }

    if(this.props.userInfo.gold < price){
      alert("소지금이 부족합니다. 옵션부여에 "+price+"골드가 소모됩니다.");
      return false;
    }

    if (userInfo.item.indexOf('ow2') == -1 || userInfo.itemCount.ow2 == undefined || userInfo.itemCount.ow2 < grade) {
      alert("[욕망의 돌]이 없습니다. 무기 강화를 위해 [욕망의 돌]이  필요 합니다.");
      return false;
    }


    var con_test = confirm("욕망의돌 "+grade+"개와 "+price+"골드를 사용해 "+ this.props.userInfo.mount.w.name+"에 옵션을 부여 하시겠습니까?");
    if(con_test){
      axios.get('/api/account/changeOption/'+ grade)
         .then((response) => {

           let job2 = userInfo.job2;
           if(userInfo.job2==undefined){
             job2 = "일반 여행자 ";
           }

            if(!response.data.result){
              alert(response.data.msg);
              this.props.socket.emit('Gchat', "[강화] "+job2 +response.data.msg);
            }
            else{
              alert(response.data.msg);
              alert("무기를 다시 장착하셔야 강화 효과가 적용 됩니다.");
              this.props.socket.emit('Gchat', "[강화] "+job2 +response.data.msg);
            }

          //  Materialize.toast(eqItem+"을(를) 구매 하였습니다.", 1000);

          this.props.getStatusRequest();
         }).catch((error) => {
             console.log(error);
         });
    }
  }


  requestEnhancement(userInfo){

    if(this.props.userInfo.mount.w.type != 'private'){
      alert("개인전용 무기를 착용한 상태에서만 강화 할 수 있습니다. 개인무기는 레벨 15를 달성후 운영자에게 요청하시면 얻을 수 있습니다.");
      return false;
    }

    if(this.props.userInfo.gold < 20000){
      alert("소지금이 부족합니다. 강화엔 2만골드가 소모됩니다.");
      return false;
    }

    if (userInfo.item.indexOf('ow1') == -1 || userInfo.itemCount.ow1 == undefined || userInfo.itemCount.ow1 < 1) {
      alert("[달의눈물]이 없습니다. 무기 강화를 위해 [달의눈물]이 필요 합니다.");
      return false;
    }


    var con_test = confirm("달의눈물 1개와 2만골드를 사용해 "+ this.props.userInfo.mount.w.name+"을(를) 강화 하시겠습니까?");
    if(con_test){
      axios.get('/api/account/enhancement/')
         .then((response) => {

           let job2 = userInfo.job2;
           if(userInfo.job2==undefined){
             job2 = "일반 여행자 ";
           }


            if(!response.data.result){
              alert(response.data.msg);
              this.props.socket.emit('Gchat', "[강화] "+job2 +response.data.msg);
            }
            else{
              alert(response.data.msg);
              alert("무기를 다시 장착하셔야 강화 효과가 적용 됩니다.");
              this.props.socket.emit('Gchat', "[강화] "+job2 +response.data.msg);
            }

          //  Materialize.toast(eqItem+"을(를) 구매 하였습니다.", 1000);

          this.props.getStatusRequest();
         }).catch((error) => {
             console.log(error);
         });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
          let current = {
              user: this.props.userInfo,
              Enhancement: this.props.items,

          };
        let next = {
            user: nextProps.userInfo,
            Enhancement: nextProps.items,
        };
        let update = JSON.stringify(current) !== JSON.stringify(next);
          return update;
      }

    render() {

      const maList = (
              <li><a onClick={this.toggleOpenEnhancement}  className="waves-effect waves-light btn red controller-btn attack-btn">전직</a></li>
      );


        return (
          <div className="item-store-screen center-align">
              <div className="right">
                  <a className="waves-effect waves-light btn red lighten-1"
                      onClick={this.handleClose}>CLOSE</a>
              </div>
              <div className="container item-container">
                <p>무기 강화는 개인전용 무기만 가능 합니다.</p>
                <p>소지금 : <span>{this.props.userInfo.gold}</span> Gold</p>
                  <ul className="collapsible item-list user-inven-ul" data-collapsible="accordion">
                    <li>
                      <div className="collapsible-header"><span className="badge">달의눈물 1개 소모</span>무기를 강화 한다</div>
                      <div className="collapsible-body item-msg">
                        <span>"명필은 붓을 가리지 않지만 좋은 붓을 쓰면 더 좋은 글이 나온다"</span>
                        <p>달의 눈물 1개가 소모됩니다.</p>
                        <p>2만골드가 소비됩니다.</p>
                        <p><a onClick={this.requestEnhancement.bind(this,this.props.userInfo)}  className="waves-effect waves-light btn">무기강화</a></p>
                      </div>
                    </li>

                    <li>
                      <div className="collapsible-header"><span className="badge">욕망의돌1개 소모</span>무기에 옵션을 부여 한다.</div>
                      <div className="collapsible-body item-msg">
                        <span>"무기에 특수옵션이 랜덤하게 부여 됩니다."</span>
                        <p>특수옵션은 1가지만 적용 됩니다.</p>
                        <p>욕망의돌 1개가 소모됩니다.</p>
                        <p>2만골드가 소비됩니다.</p>
                        <p><a onClick={this.requestChangeOption.bind(this,this.props.userInfo, 1)}  className="waves-effect waves-light btn">옵션부여</a></p>
                      </div>
                    </li>

                    <li>
                      <div className="collapsible-header"><span className="badge">욕망의돌5개 소모</span>무기에 고급 옵션을 부여 한다.</div>
                      <div className="collapsible-body item-msg">
                        <span>"무기에 특수옵션이 랜덤하게 부여 됩니다."</span>
                        <p>특수옵션은 1가지만 적용 됩니다.</p>
                        <p>욕망의돌 5개가 소모됩니다.</p>
                        <p>12만골드가 소비됩니다.</p>
                        <p><a onClick={this.requestChangeOption.bind(this,this.props.userInfo,5)}  className="waves-effect waves-light btn">옵션부여</a></p>
                      </div>
                    </li>


                  </ul>

              </div>
          </div>
        );
    }
}


Enhancement.propTypes = {
    onClose: React.PropTypes.func
};

Enhancement.defaultProps = {
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

export default connect( mapStateToProps, mapDispatchToProps)(Enhancement);
