import React from 'react';
import axios from 'axios';
import {Redirect } from 'react-router';

import { connect } from 'react-redux';
import { userItemRequest  } from 'Actions/item';
class UserItem extends React.Component {


    constructor(props, context) {
        super(props, context);
        this.state = {
            keyword: '',
            userItem:false,
            useScroll:false,
        };
        this.handleClose = this.handleClose.bind(this);
        this.handleAllClose = this.handleAllClose.bind(this);
        this.useItem = this.useItem.bind(this);
        this.countItem = this.countItem.bind(this);
        this.props.userItemRequest();
    }

    handleClose() {
        this.props.onClose();
    }

    handleAllClose(){
      this.props.onAllClose();
    }

  componentDidMount(){
       $('.collapsible').collapsible();
  }

  userEqMount(itemId){
       axios.get('/api/account/mountItem/' + itemId)
          .then((response) => {
            this.props.getStatusRequest();

            console.log(response.data);

            if(response.data.result){
              let eqItem = response.data.item.name;
              let itemMsg = "";
              if(response.data.item.option != undefined){
                itemMsg = response.data.item.option.msg;
              }
               Materialize.toast(eqItem+"을(를) 장착 하였습니다." +itemMsg, 1000);
            }else{
              Materialize.toast(response.data.msg, 1000);
            }



          }).catch((error) => {
              console.log(error);
          });
  }

  useItem(itemId){
       axios.get('/api/account/useItem/' + itemId)
          .then((response) => {
            console.log(response);
            this.props.getStatusRequest();
            let msg = response.data.msg;
             Materialize.toast(msg, 1000);
          }).catch((error) => {
              console.log(error);
          });
  }
  useScroll(itemId){
       axios.get('/api/account/useScroll/' + itemId)
          .then((response) => {
            console.log(response);
            this.props.getStatusRequest();
            let msg = response.data.msg;
             Materialize.toast(msg, 1000);
             this.handleAllClose();
             this.setState({
               useScroll:true
             });
          }).catch((error) => {
              console.log(error);
          });
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

      const goScroll = ( <Redirect to="/Teleport"/> );

      const mapDataToLinks = (data) => {
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
            if((item.kind == "p"||item.kind == "rp")&&count!=0){
              return (
                <li key={i}>
                  <div className="collapsible-header"><span className="badge">보유개수 {count}</span>{item.name}</div>
                  <div className="collapsible-body item-msg">
                    <p>등급 : {item.type}</p>
                    <p>회복력 : {item.min} ~ {item.max}</p>
                    <span>{item.msg}</span>
                    <p><a onClick={this.useItem.bind(this,item.id)}  className="waves-effect waves-light btn">사용</a></p>
                  </div>
                </li>
               );
            }
            else if(item.kind == "elixir"&&count!=0){
              return (
                <li key={i}>
                  <div className="collapsible-header"><span className="badge">보유개수 {count}</span>{item.name}</div>
                  <div className="collapsible-body item-msg">
                    <span>{item.msg}</span>
                    <p><a onClick={this.useItem.bind(this,item.id)}  className="waves-effect waves-light btn">사용</a></p>
                  </div>
                </li>
               );
            }
            else if(item.kind == "w"&&count!=0){
              let optionName = "없음";
              if(item.option != undefined){
                optionName = item.option.optionName;
              }

              let socket1 = "없음";
              let socket1Msg = "미확장";
              if(item.socket1!=undefined){
                socket1Msg = "미장착";
                if(item.socket1.name != undefined){
                  socket1 = item.socket1.name;
                  socket1Msg = item.socket1.msg;
                }
              }

              let socket2 = "없음";
              let socket2Msg = "미확장";
              if(item.socket2!=undefined){
                socket2Msg = "미장착";
                if(item.socket2.name != undefined){
                  socket2 = item.socket2.name;
                  socket2Msg = item.socket2.msg;
                }
              }

              let socket3 = "없음";
              let socket3Msg = "미확장";
              if(item.socket3!=undefined){
                socket3Msg = "미장착";
                if(item.socket3.name != undefined){
                  socket3 = item.socket3.name;
                  socket3Msg = item.socket3.msg;
                }
              }


              return (
                    <li key={i}>
                      <div className="collapsible-header"><span className="badge">{this.props.userInfo.mount.w.id == item.id ? "장착" : "미장착"} </span>{item.name}[{item.job}]</div>
                      <div className="collapsible-body item-msg">
                        <p>등급 : {item.type}</p>
                        <p>데미지 : {item.min} ~ {item.max}+{item.min}</p>
                        <span>{item.msg}</span>
                        <p>특수능력 : <span className="item-option-name"> {optionName} </span></p>
                        <p> 소켓1[{socket1}] : <span className="item-option-name"> {socket1Msg} </span></p>
                        <p> 소켓2[{socket2}] : <span className="item-option-name"> {socket2Msg} </span></p>
                        <p> 소켓3[{socket3}] : <span className="item-option-name"> {socket3Msg} </span></p>
                        <p><a onClick={this.userEqMount.bind(this,item.id)}  className="waves-effect waves-light btn">장착</a></p>
                      </div>
                    </li>
                  );
            }
            else if(item.kind == "d"&&count!=0){
              return (
                    <li key={i}>
                      <div className="collapsible-header"><span className="badge">  {this.props.userInfo.mount.d.id == item.id ? "장착" : "미장착"} </span>{item.name}[{item.job}]</div>
                      <div className="collapsible-body item-msg">
                        <p>등급 : {item.type}</p>
                        <p>방어력 : {item.min} ~ {item.max}+{item.min}</p>
                        <span>{item.msg}</span>
                        <p><a onClick={this.userEqMount.bind(this,item.id)}  className="waves-effect waves-light btn">장착</a></p>
                      </div>
                    </li>
                  );

            }
            else if(item.kind == "ring"&&count!=0){
              return (
                    <li key={i}>
                      <div className="collapsible-header"><span className="badge">  {this.props.userInfo.mount.r.id == item.id ? "장착" : "미장착"} </span>{item.name}[{item.job}]</div>
                      <div className="collapsible-body item-msg">
                        <span>{item.msg}</span>
                        <p><a onClick={this.userEqMount.bind(this,item.id)}  className="waves-effect waves-light btn">장착</a></p>
                      </div>
                    </li>
                  );

            }
            else if(item.kind == "necklace"&&count!=0){
              return (
                    <li key={i}>
                      <div className="collapsible-header"><span className="badge">  {this.props.userInfo.mount.n.id == item.id ? "장착" : "미장착"} </span>{item.name}[{item.job}]</div>
                      <div className="collapsible-body item-msg">
                        <span>{item.msg}</span>
                        <p><a onClick={this.userEqMount.bind(this,item.id)}  className="waves-effect waves-light btn">장착</a></p>
                      </div>
                    </li>
                  );

            }
            else if(item.kind == "s"&&count!=0){
              return (
                    <li key={i}>
                      <div className="collapsible-header"><span className="badge">보유개수 {count}</span>{item.name}</div>
                      <div className="collapsible-body item-msg">
                        <p>등급 : {item.type}</p>
                        <span>{item.msg}</span>
                        <p><a onClick={this.useScroll.bind(this,item.id)}  className="waves-effect waves-light btn">사용</a></p>
                      </div>
                    </li>
                  );

            }
            else if((item.kind == "o" ||item.kind == "j")  &&count!=0){
              return (
                    <li key={i}>
                      <div className="collapsible-header"><span className="badge">보유개수 {count}</span>{item.name}</div>
                      <div className="collapsible-body item-msg">
                        <p>등급 : {item.type}</p>
                        <span>{item.msg}</span>
                        <p><a   className="waves-effect waves-light btn">사용불가</a></p>
                      </div>
                    </li>
                  );

            }
            else if((item.kind == "m")  &&count!=0){
              return (
                    <li key={i}>
                      <div className="collapsible-header"><span className="badge">보유개수 {count}</span>{item.name}</div>
                      <div className="collapsible-body item-msg">
                        <p>등급 : {item.type}</p>
                        <span>{item.msg}</span>
                        <p><a   className="waves-effect waves-light btn">사용불가</a></p>
                      </div>
                    </li>
                  );

                }





          });
      };

        return (
            <div className="user-item-screen center-align">
                <div className="right">
                    <a className="waves-effect waves-light btn red lighten-1"
                        onClick={this.handleClose}>CLOSE</a>
                </div>
                <div className="container item-container">
                  <p>소지금 : <span>{this.props.items.gold}</span> Gold</p>
                    <ul className="collapsible item-list user-inven-ul" data-collapsible="accordion">
                      { mapDataToLinks(this.props.items.itemList) }
                    </ul>
                </div>
                { this.state.useScroll  ? goScroll : undefined }

            </div>
        );
    }
}



UserItem.propTypes = {
    onClose: React.PropTypes.func
};

UserItem.defaultProps = {
    onClose: () => {
        console.error('onClose not defined');
    },
};

const mapStateToProps = (state) => {
    return {
        items: state.item.items,
    };
};


const mapDispatchToProps = (dispatch) => {
    return {
        userItemRequest: () => {
            return dispatch(userItemRequest());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserItem);
