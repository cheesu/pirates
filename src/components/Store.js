import React from 'react';
import axios from 'axios';
import { browserHistory, Link } from 'react-router';
import { connect } from 'react-redux';
import { getStoreItemRequest  } from 'Actions/item';
import { getStatusRequest  } from 'Actions/authentication';
import { userItemRequest  } from 'Actions/item';
class Store extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keyword: '',
            userItem:false,
        };

        this.handleClose = this.handleClose.bind(this);
        this.countItem = this.countItem.bind(this);
        //  this.props.userItemRequest();
          this.props.getStoreItemRequest();

    }

    handleClose() {
        this.props.onClose();
    }


  componentDidMount(){
       $('.collapsible').collapsible();
       $('ul.tabs').tabs();

  }

  buyItem(item, count){

    let selePer = 1;
    if(count>50){
      selePer = 0.9;
    }

    if((item.price*count*selePer)> this.props.userInfo.gold){
      alert("소지금이 부족해 구매 할 수 없습니다.");
      return false;
    }

    var con_test = confirm(item.name+"을(를) "+count+"개 구매 하시겠습니까?");
    if(con_test){
      axios.post('/api/account/buyItem/', { name:item.id, count:count })
         .then((response) => {
           this.props.getStatusRequest();
           this.props.userItemRequest();
           alert(response.data.msg);
          //  Materialize.toast(eqItem+"을(를) 구매 하였습니다.", 1000);
         }).catch((error) => {
             console.log(error);
         });
    }
  }

  buyJItem(item, count){

    var con_test = confirm(item.name+"을(를) "+count+"개 구매 하시겠습니까?");
    if(con_test){
      axios.post('/api/account/buyJItem/', { name:item.id, count:count })
         .then((response) => {
           this.props.getStatusRequest();
           this.props.userItemRequest();
           alert(response.data.msg);
          //  Materialize.toast(eqItem+"을(를) 구매 하였습니다.", 1000);
         }).catch((error) => {
             console.log(error);
         });
    }
  }

  sellItem(item){
    var con_test = confirm(item.name+"을(를) 판매 하시겠습니까?");
    if(con_test){
      axios.get('/api/account/sellItem/' + item.id)
         .then((response) => {
           this.props.getStatusRequest();
           this.props.userItemRequest();
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
  shouldComponentUpdate(nextProps, nextState) {
          let current = {
              user: this.props.userInfo,
              store: this.props.items,

          };
        let next = {
            user: nextProps.userInfo,
            store: nextProps.items,
        };
        let update = JSON.stringify(current) !== JSON.stringify(next);
          return update;
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
                    <p>
                        <a onClick={this.buyItem.bind(this,item,1)}  className="waves-effect waves-light btn">구매</a>
                        <a onClick={this.buyItem.bind(this,item,10)}  className="waves-effect waves-light btn">10개구매</a>
                        <a onClick={this.buyItem.bind(this,item,50)}  className="waves-effect waves-light btn">50개구매 [10% 할인 {item.price*50*0.9}골드]</a>

                    </p>
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
                        <p><a onClick={this.buyItem.bind(this,item,1)}  className="waves-effect waves-light btn">구매</a></p>
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
                        <p><a onClick={this.buyItem.bind(this,item,1)}  className="waves-effect waves-light btn">구매</a></p>
                      </div>
                    </li>
                  );

                }

                else if(item.kind == "s"&&tabType==item.kind){
                  return (
                        <li key={i}>
                          <div className="collapsible-header"><span className="badge">  보유개수 {count} </span>{item.name}</div>
                          <div className="collapsible-body item-msg">
                            <p>등급 : {item.type} <span>가격 :{item.price} </span></p>
                            <span>{item.msg}</span>
                            <p><a onClick={this.buyItem.bind(this,item,1)}  className="waves-effect waves-light btn">구매</a></p>
                            <p><a onClick={this.buyItem.bind(this,item,10)}  className="waves-effect waves-light btn">10장 구매</a></p>
                          </div>
                        </li>
                      );

                    }
          });
      };


      // 밀수꾼 아이템
      const mapDataToLinksShip = (data,tabType) => {
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
            if(item.kind == "elixir"&&tabType==item.kind){
              return (
                <li key={i}>
                  <div className="collapsible-header"><span className="badge">보유개수 {count}</span>{item.name}</div>
                  <div className="collapsible-body item-msg">
                    <p><span>에메랄드:{item.jPrice.j1} </span></p>
                    <p><span>루비:{item.jPrice.j2} </span></p>
                    <p><span>사파이어:{item.jPrice.j3} </span></p>
                    <p><span>루벨라이트:{item.jPrice.j4} </span></p>


                    <span>{item.msg}</span>
                    <p>
                        <a onClick={this.buyJItem.bind(this,item,1)}  className="waves-effect waves-light btn">구매</a>
                    </p>
                  </div>
                </li>
               );
            }
            else if(item.kind == "ring"&&tabType==item.kind){
              return (
                    <li key={i}>
                      <div className="collapsible-header"><span className="badge"> 보유개수 {count} </span>{item.name}[{item.job}]</div>
                      <div className="collapsible-body item-msg">
                        <p><span>에메랄드:{item.jPrice.j1} </span></p>
                        <p><span>루비:{item.jPrice.j2} </span></p>
                        <p><span>사파이어:{item.jPrice.j3} </span></p>
                        <p><span>루벨라이트:{item.jPrice.j4} </span></p>
                        <span>{item.msg}</span>
                        <p><a onClick={this.buyJItem.bind(this,item,1)}  className="waves-effect waves-light btn">구매</a></p>
                      </div>
                    </li>
                  );
            }
            else if(item.kind == "necklace"&&tabType==item.kind){
              return (
                    <li key={i}>
                      <div className="collapsible-header"><span className="badge">  보유개수 {count} </span>{item.name}[{item.job}]</div>
                      <div className="collapsible-body item-msg">
                        <p><span>에메랄드:{item.jPrice.j1} </span></p>
                        <p><span>루비:{item.jPrice.j2} </span></p>
                        <p><span>사파이어:{item.jPrice.j3} </span></p>
                        <p><span>루벨라이트:{item.jPrice.j4} </span></p>
                        <span>{item.msg}</span>
                        <p><a onClick={this.buyJItem.bind(this,item,1)}  className="waves-effect waves-light btn">구매</a></p>
                      </div>
                    </li>
                  );

                }

                else if(item.kind == "rp"&&tabType==item.kind){
                  return (
                        <li key={i}>
                          <div className="collapsible-header"><span className="badge">  보유개수 {count} </span>{item.name}</div>
                          <div className="collapsible-body item-msg">
                            <p>등급 : {item.type} <span>가격 :{item.price} </span></p>
                            <span>{item.msg}</span>
                            <p>
                                <a onClick={this.buyItem.bind(this,item,1)}  className="waves-effect waves-light btn">구매</a>
                                <a onClick={this.buyItem.bind(this,item,10)}  className="waves-effect waves-light btn">10개구매</a>
                                <a onClick={this.buyItem.bind(this,item,50)}  className="waves-effect waves-light btn">50개구매 [10% 할인 {item.price*50*0.9}골드]</a>
                            </p>
                          </div>
                        </li>
                      );

                    }



          });
      };

      const mapDataToUserItemLinks = (data) => {
        console.log(data);
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
            if(count!=0){
              return (
                <li key={i}>
                  <div className="collapsible-header"><span className="badge">보유개수 {count}</span>{item.name}</div>
                  <div className="collapsible-body item-msg">
                    <p>등급 : {item.type} <span>가격 :{Math.round(item.price/2)} </span></p>
                    <span>{item.msg}</span>
                    <p><a onClick={this.sellItem.bind(this,item)}  className="waves-effect waves-light btn">판매</a></p>
                  </div>
                </li>
               );
            }

          });
      };



      const normalStore = (
        <div className="container item-container">
          <span>해적들이나 민간인들이 거래를 하는 암시장이다. 가끔씩 흔히 볼 수 없는 물품들도 들어 온다고 한다.</span>
          <p>소지금 : <span></span>{this.props.userInfo.gold} Gold</p>
            <ul id="tabs-swipe-demo" className="tabs">
              <li className="tab col s3"><a className="active" href="#test-swipe-1">Weapon</a></li>
              <li className="tab col s3"><a href="#test-swipe-2">Armor</a></li>
              <li className="tab col s3"><a href="#test-swipe-3">Potion</a></li>
              <li className="tab col s3"><a href="#test-swipe-4">Scroll</a></li>
              <li className="tab col s3"><a href="#test-swipe-5">판매</a></li>
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
            <div id="test-swipe-4" className="col s12 tab-in-container">
              <ul className="collapsible item-list" data-collapsible="accordion">
                { mapDataToLinks(this.props.items,"s") }
              </ul>
            </div>
            <div id="test-swipe-5" className="col s12 tab-in-container">
              <ul className="collapsible item-list" data-collapsible="accordion">
                { mapDataToUserItemLinks(this.props.userItems.itemList) }
              </ul>
            </div>
        </div>
      );

      const shipStore = (
        <div className="container item-container">
          <span>흐흐 자네 혹시 좋은 보석 가지고 있나? 내가 더 좋은걸 보여주도록 하지 이래뵈도 내가 이바닥에선 어마어마한 밀수꾼이라고 .</span>
          <p>소지금 : <span></span>{this.props.userInfo.gold} Gold</p>
          <p>보석 : <span>에메랄드</span>{this.props.userInfo.itemCount.j1} 개
          <span>루비</span>{this.props.userInfo.itemCount.j2} 개
          <span>사파이어</span>{this.props.userInfo.itemCount.j3} 개
          <span>루벨라이트</span>{this.props.userInfo.itemCount.j4} 개</p>

            <ul id="tabs-swipe-demo" className="tabs">
              <li className="tab col s3"><a className="active" href="#test-swipe-1">엘릭서</a></li>
              <li className="tab col s3"><a href="#test-swipe-2">반지</a></li>
              <li className="tab col s3"><a href="#test-swipe-3">목걸이</a></li>
              <li className="tab col s3"><a href="#test-swipe-4">고급포션</a></li>
            </ul>
            <div id="test-swipe-1" className="col s12 tab-in-container">
              <ul className="collapsible item-list" data-collapsible="accordion">
                { mapDataToLinksShip(this.props.items,"elixir") }
              </ul>
            </div>
            <div id="test-swipe-2" className="col s12 tab-in-container">
              <ul className="collapsible item-list" data-collapsible="accordion">
                { mapDataToLinksShip(this.props.items,"ring") }
              </ul>
            </div>
            <div id="test-swipe-3" className="col s12 tab-in-container">
              <ul className="collapsible item-list" data-collapsible="accordion">
                { mapDataToLinksShip(this.props.items,"necklace") }
              </ul>
            </div>
            <div id="test-swipe-4" className="col s12 tab-in-container">
              <ul className="collapsible item-list" data-collapsible="accordion">
                { mapDataToLinksShip(this.props.items,"rp") }
              </ul>
            </div>
        </div>
      );



        return (
            <div className="item-store-screen center-align">
                <div className="right">
                    <a className="waves-effect waves-light btn red lighten-1"
                        onClick={this.handleClose}>CLOSE</a>
                </div>

                {this.props.storeKind=='ship' ? shipStore : normalStore }


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
        items: state.item.storeItems
    };
};


const mapDispatchToProps = (dispatch) => {
    return {
        getStoreItemRequest: () => {
            return dispatch(getStoreItemRequest());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Store);
