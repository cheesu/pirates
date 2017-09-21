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
            buySlave:false,
            slaveInfo:null,
            buySlave2:false,
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


  buySocketItem(item){
    axios.post('/api/account/buySocketItem/', { name:item.id})
       .then((response) => {
         this.props.getStatusRequest();
         this.props.userItemRequest();
         alert(response.data.msg);
        //  Materialize.toast(eqItem+"을( 를) 구매 하였습니다.", 1000);
       }).catch((error) => {
           console.log(error);
       });
  }

  buyCheckSlave(item){
    var con_test = confirm("노예를 구입하시면 기존에 있던 노예는 풀려나 다시는 만날 수 없습니다. 그래도 구매 하시겠습니까?");
    if(con_test){
      this.setState({
          buySlave: true,
          slaveInfo: item,
      });
    }
  }

  buyCheckSlave2(){
    var con_test = confirm("후원금 입금이 확인후 보답품을 전달해 드립니다.");
    if(con_test){
      this.setState({
          buySlave2: true,
      });
    }

  }


  buySlaveExp(gold){
    axios.post('/api/account/buySlaveExp/', { gold:gold})
       .then((response) => {
         this.props.getStatusRequest();
         this.props.userItemRequest();
         alert(response.data.msg);
       }).catch((error) => {
           console.log(error);
       });
  }

  requestBuySlave(){
    let slaveName = $("#slaveName").val();
    let slaveId = this.state.slaveInfo.id;
    axios.post('/api/account/buySlave/', { name:slaveId, slaveName : slaveName})
       .then((response) => {
         this.props.getStatusRequest();
         this.props.userItemRequest();
         alert(response.data.msg);
       }).catch((error) => {
           console.log(error);
       });
  }

  requestBuySlave2(){
    let name = $("#userName").val();
    let bank = $("#bank").val();
    let itemSelect = $("#itemSelect").val();

  console.log(name+ bank +itemSelect);

    axios.post('/api/account/buySlave2/', { name:name, bank : bank, itemSelect:itemSelect })
       .then((response) => {
         alert(response.data.msg);
       }).catch((error) => {
           console.log(error);
       });
  }

  cancleSlave2(){
    this.setState({
        buySlave2: false,
    });
  }


cancleSlave(){
  this.setState({
      buySlave: false,
      slaveInfo: null,
  });
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
              name: this.state.buySlave,
              name: this.state.buySlave2,

          };
        let next = {
            user: nextProps.userInfo,
            store: nextProps.items,
            name: nextState.buySlave,
            name: nextState.buySlave2,
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
                else if(item.kind == "socket1"&&tabType==item.kind){
                  return (
                        <li key={i}>
                          <div className="collapsible-header"><span className="badge">   </span>{item.name}</div>
                          <div className="collapsible-body item-msg">
                            <p>가격</p>
                            <p><span>{item.mPrice[0].name} : {item.mPrice[0].count} </span></p>
                            <p><span>{item.mPrice[1].name} : {item.mPrice[1].count} </span></p>
                            <p><span>{item.mPrice[2].name} : {item.mPrice[2].count} </span></p>
                            <p><span>{item.mPrice[3].name} : {item.mPrice[3].count} </span></p>
                            <p><span>{item.mPrice[4].name} : {item.mPrice[4].count} </span></p>
                            <p><span>{item.mPrice[5].name} : {item.mPrice[5].count} </span></p>
                            <p><span>{item.mPrice[6].name} : {item.mPrice[6].count} </span></p>
                            <span>{item.msg}</span>
                            <p>
                                <a onClick={this.buySocketItem.bind(this,item,1)}  className="waves-effect waves-light btn">세공</a>
                            </p>
                          </div>
                        </li>
                      );

                    }
                    else if(item.kind == "socket2"&&tabType==item.kind){
                      return (
                            <li key={i}>
                              <div className="collapsible-header"><span className="badge">   </span>{item.name}</div>
                              <div className="collapsible-body item-msg">
                                <p>가격</p>
                                <p><span>{item.mPrice[0].name} : {item.mPrice[0].count} </span></p>
                                <p><span>{item.mPrice[1].name} : {item.mPrice[1].count} </span></p>
                                <p><span>{item.mPrice[2].name} : {item.mPrice[2].count} </span></p>
                                <p><span>{item.mPrice[3].name} : {item.mPrice[3].count} </span></p>
                                <p><span>{item.mPrice[4].name} : {item.mPrice[4].count} </span></p>
                                <p><span>{item.mPrice[5].name} : {item.mPrice[5].count} </span></p>
                                <p><span>{item.mPrice[6].name} : {item.mPrice[6].count} </span></p>
                                <span>{item.msg}</span>
                                <p>
                                    <a onClick={this.buySocketItem.bind(this,item,1)}  className="waves-effect waves-light btn">세공</a>
                                </p>
                              </div>
                            </li>
                          );

                        }

                    else if(item.kind == "slave"&&tabType==item.kind){
                      return (
                          <li key={i}>
                            <div className="collapsible-header"><span className="badge">   </span>{item.tribe}</div>
                            <div className="collapsible-body item-msg">
                              <p>종족 : {item.tribe} <span>가격 :{item.price} </span></p>
                              <span>{item.msg}</span>
                              <p>lv: {item.lv}</p>
                              <p>hp: {item.hp}</p>
                              <p>mp: {item.mp}</p>
                              <p>str: {item.str}</p>
                              <p>dex: {item.dex}</p>
                              <p>int: {item.int}</p>
                              <p>skill: {item.skill}</p>

                              <p> 레벨업 상승 능력치</p>
                              <p>str: {item.upStr}</p>
                              <p>dex: {item.upDex}</p>
                              <p>int: {item.upInt}</p>

                              <p>대화</p>
                              <span>
                                {item.chat}
                              </span>
                                <p>
                                  <a onClick={this.buyCheckSlave.bind(this,item)}  className="waves-effect waves-light btn">구매</a>
                                </p>
                            </div>
                          </li>
                          );
                      }


          });
      };

      const mapDataToUserItemLinks = (data) => {
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
          <span>해적들이나 민간인들이 거래를 하는 암시장이다.</span>
          <p>소지금 : <span></span>{this.props.userInfo.gold} Gold</p>
            <ul id="tabs-swipe-demo" className="tabs">
              <li className="tab col s3"><a className="active" href="#test-swipe-1">Weapon</a></li>
              <li className="tab col s3"><a href="#test-swipe-2">Armor</a></li>
              <li className="tab col s3"><a href="#test-swipe-3">Potion</a></li>
              <li className="tab col s3"><a href="#test-swipe-4">Scroll</a></li>
              <li className="tab col s3"><a href="#test-swipe-5">판매</a></li>
              <li className="tab col s3"><a href="#test-swipe-6">개발자 후원하기</a></li>
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
            <div id="test-swipe-6" className="col s12 tab-in-container">
              <ul className="collapsible item-list" data-collapsible="accordion">
                <li>
                  <div className="collapsible-header"><span className="badge"> 개발자에게 도움의 손길을... </span></div>
                  <div className="collapsible-body item-msg">
                    <p>개발자 후원하기에 참여 하시면</p>
                    <p>감사의 의미로 소정의 보답을 해 드립니다.</p>
                    <p>만원 : 보석종류별 10개 , 욕망의돌 10개, 달의눈물 5개, 천만골드 택1</p>
                    <p>3만원 : 보석종류별 40개, 욕망의돌 40개, 달의눈물 20개 , 4천만골드  택1</p>
                    <p></p>


                    <p>신한은행</p>
                    <p>110-474-178667 인치수</p>
                    <a onClick={this.buyCheckSlave2.bind(this)}  className="waves-effect waves-light btn">후원하기</a>
                  </div>
                </li>
              </ul>
            </div>
        </div>
      );

      const shipStore = (
        <div className="container item-container">
          <span>흐흐 자네 혹시 좋은 보석이나 희귀한 물건 가지고 있나? 내가 더 좋은걸 보여주도록 하지 이래뵈도 내가 이바닥에선 어마어마한 밀수꾼이라고.
            불법이긴 하지만 마력석세공 같은 것도 해주지. 아니면 혹시 노예를 찾고 있나? 힘좋고 쭉쭉빵빵한 노예들도 있지 흐흐흐...
          </span>
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
              <li className="tab col s3"><a href="#test-swipe-5">소켓석 lv.1</a></li>
              <li className="tab col s3"><a href="#test-swipe-6">소켓석 lv.2</a></li>
              <li className="tab col s3"><a href="#test-swipe-7">노예</a></li>
              <li className="tab col s3"><a href="#test-swipe-8">노예훈련</a></li>
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
            <div id="test-swipe-5" className="col s12 tab-in-container">
              <ul className="collapsible item-list" data-collapsible="accordion">
                { mapDataToLinksShip(this.props.items,"socket1") }
              </ul>
            </div>
            <div id="test-swipe-6" className="col s12 tab-in-container">
              <ul className="collapsible item-list" data-collapsible="accordion">
                { mapDataToLinksShip(this.props.items,"socket2") }
              </ul>
            </div>
            <div id="test-swipe-7" className="col s12 tab-in-container">
              <ul className="collapsible item-list" data-collapsible="accordion">
                { mapDataToLinksShip(this.props.items,"slave") }
              </ul>
            </div>
            <div id="test-swipe-8" className="col s12 tab-in-container">
              <ul className="collapsible item-list" data-collapsible="accordion">
                <li>
                  <div className="collapsible-header"><span className="badge">   </span>백만경험치 구매</div>
                  <div className="collapsible-body item-msg">
                    <p>노예 획득 경험치 : 1000000 <span>가격 :1000000 gold </span></p>
                      <p>
                        <a onClick={this.buySlaveExp.bind(this,1000000)}  className="waves-effect waves-light btn">구매</a>
                      </p>
                  </div>
                </li>
                <li>
                  <div className="collapsible-header"><span className="badge">   </span>천만 경험치 구매</div>
                  <div className="collapsible-body item-msg">
                    <p>노예 획득 경험치 : 10000000 <span>가격 :10000000 gold </span></p>
                      <p>
                        <a onClick={this.buySlaveExp.bind(this,10000000)}  className="waves-effect waves-light btn">구매</a>
                      </p>
                  </div>
                </li>
              </ul>
            </div>
        </div>
      );

        const createName = (
          <div className="row createName">
            <div className="col s12 m2">
              <div className="card blue-grey">
                <div className="card-content white-text">
                  <span className="card-title">노예 이름 부여</span>
                  <input id="slaveName" type="text"></input>
                </div>
                <div className="card-action">
                  <a onClick={this.requestBuySlave.bind(this)} >구매확정</a>
                  <a onClick={this.cancleSlave.bind(this)} >취소</a>
                </div>
              </div>
            </div>
          </div>
        );


        const createName2 = (
          <div className="row createName developerBank">
            <div className="col s12 m2">
              <div className="card blue-grey">
                <div className="card-content white-text">
                  <span className="card-title">후원자 이름</span>
                  <input id="userName" type="text" ></input>
                  <br></br>
                  <span className="card-title">후원자 은행</span>
                  <input id="bank" type="text"></input>
                  <br></br>
                  <select id="itemSelect">
                    <option value="보석10">종류별보석 10개</option>
                    <option value="보석40">종류별보석 40개</option>
                    <option value="욕돌10">욕망의돌 10개</option>
                    <option value="욕돌40">욕망의돌 40개</option>
                    <option value="달눈5">달의눈물 5개</option>
                    <option value="달눈20">달의눈물 20개</option>
                    <option value="천만골드">천만골드</option>
                    <option value="4천만골드">4천만골드</option>
                  </select>
                </div>
                <div className="card-action">
                  <a onClick={this.requestBuySlave2.bind(this)} >후원신청</a>
                  <a onClick={this.cancleSlave2.bind(this)} >취소</a>
                </div>
              </div>
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
                {this.state.buySlave ? createName : undefined }
                {this.state.buySlave2 ? createName2 : undefined }


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
