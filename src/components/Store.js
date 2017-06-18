import React from 'react';
import axios from 'axios';
import { browserHistory, Link } from 'react-router';
import { connect } from 'react-redux';
import { getStoreItemRequest  } from 'Actions/item';
import { getStatusRequest  } from 'Actions/authentication';
class Store extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keyword: '',
            userItem:false,
        };

        this.handleClose = this.handleClose.bind(this);
        this.countItem = this.countItem.bind(this);

          this.props.getStoreItemRequest();

    }

    handleClose() {
        this.props.onClose();
    }


  componentDidMount(){
       $('.collapsible').collapsible();
       $('ul.tabs').tabs();

  }

  buyItem(item){
    if(item.price> this.props.userInfo.gold){
      alert("소지금이 부족해 구매 할 수 없습니다.");
      return false;
    }

    var con_test = confirm(item.name+"을(를) 구매 하시겠습니까?");
    if(con_test){
      axios.get('/api/account/buyItem/' + item.id)
         .then((response) => {
           this.props.getStatusRequest();
           alert(response.data.msg);
          //  Materialize.toast(eqItem+"을(를) 구매 하였습니다.", 1000);
         }).catch((error) => {
             console.log(error);
         });
    }
  }

  countItem(item){
    let havItem = this.props.userInfo.itemCount
    let itemCount = 0;
    try {
       itemCount = havItem[item.id];
    } catch (e) {
      itemCount = 0;
    } finally {

    }

    return itemCount;
  }

    render() {
      const mapDataToLinks = (data,tabType) => {
        if(data==undefined){
          return (<li>
            <div className="collapsible-header"><span className="badge">none</span>loading...</div>
            <div className="collapsible-body item-msg">
            <span>재시도</span>

            </div>
          </li>);
        }
          return data.map((item, i) => {
            var count = this.countItem(item);
            if(item.kind == "p"&&tabType==item.kind){
              return (
                <li key={i}>
                  <div className="collapsible-header"><span className="badge">보유개수 {count}</span>{item.name}</div>
                  <div className="collapsible-body item-msg">
                    <p>등급 : {item.type} <span>가격 :{item.price} </span></p>
                    <span>{item.msg}</span>
                    <p><a onClick={this.buyItem.bind(this,item)}  className="waves-effect waves-light btn">구매</a></p>
                  </div>
                </li>
               );
            }
            else if(item.kind == "w"&&tabType==item.kind&&this.props.userInfo.job==item.job){
              return (
                    <li key={i}>
                      <div className="collapsible-header"><span className="badge"> 보유개수 {count} </span>{item.name}[{item.job}]</div>
                      <div className="collapsible-body item-msg">
                        <p>등급 : {item.type} <span>가격 :{item.price} </span></p>
                        <p>데미지 : {item.min} ~ {item.max}+{item.min}</p>
                        <span>{item.msg}</span>
                        <p><a onClick={this.buyItem.bind(this,item)}  className="waves-effect waves-light btn">구매</a></p>
                      </div>
                    </li>
                  );
            }
            else if(item.kind == "d"&&tabType==item.kind&&this.props.userInfo.job==item.job){
              return (
                    <li key={i}>
                      <div className="collapsible-header"><span className="badge">  보유개수 {count} </span>{item.name}[{item.job}]</div>
                      <div className="collapsible-body item-msg">
                        <p>등급 : {item.type} <span>가격 :{item.price} </span></p>
                        <p>방어력 : {item.min} ~ {item.max}+{item.min}</p>
                        <span>{item.msg}</span>
                        <p><a onClick={this.buyItem.bind(this,item)}  className="waves-effect waves-light btn">구매</a></p>
                      </div>
                    </li>
                  );

                }



          });
      };

        return (
            <div className="item-store-screen center-align">
                <div className="right">
                    <a className="waves-effect waves-light btn red lighten-1"
                        onClick={this.handleClose}>CLOSE</a>
                </div>

                <div className="container item-container">
                  <span>밀수꾼들이 거래를 하는 암시장이다. 가끔씩 흔히 볼 수 없는 물품들도 들어 온다고 한다.</span>
                  <p>소지금 : <span></span>{this.props.userInfo.gold} Gold</p>
                    <ul id="tabs-swipe-demo" className="tabs">
                      <li className="tab col s3"><a className="active" href="#test-swipe-1">Weapon</a></li>
                      <li className="tab col s3"><a href="#test-swipe-2">Armor</a></li>
                      <li className="tab col s3"><a href="#test-swipe-3">Potion</a></li>
                    </ul>
                    <div id="test-swipe-1" className="col s12 tab-in-container">
                      <ul className="collapsible item-list" data-collapsible="accordion">
                        { mapDataToLinks(this.props.items,"w") }
                      </ul>
                    </div>
                    <div id="test-swipe-2" className="col s12 tab-in-container">
                      <ul className="collapsible item-list" data-collapsible="accordion">
                        { mapDataToLinks(this.props.items,"d") }
                      </ul>
                    </div>
                    <div id="test-swipe-3" className="col s12 tab-in-container">
                      <ul className="collapsible item-list" data-collapsible="accordion">
                        { mapDataToLinks(this.props.items,"p") }
                      </ul>
                    </div>



                </div>
            </div>
        );
    }
}


Store.propTypes = {
    onClose: React.PropTypes.func
};

Store.defaultProps = {
    onClose: () => {
        console.error('onClose not defined');
    },
};

const mapStateToProps = (state) => {
    return {
        items: state.item.storeItems,
    };
};


const mapDispatchToProps = (dispatch) => {
    return {
        getStoreItemRequest: () => {
            return dispatch(getStoreItemRequest());
        },
        getStatusRequest: () => {
            return dispatch(getStatusRequest());
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Store);
