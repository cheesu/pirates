import React from 'react';
import axios from 'axios';
import { browserHistory, Link } from 'react-router';
import { connect } from 'react-redux';
import { userItemRequest  } from 'Actions/item';
import { getStatusRequest  } from 'Actions/authentication';
class UserItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: '',
            userItem:false,
        };
        this.handleClose = this.handleClose.bind(this);
        this.useItem = this.useItem.bind(this);
        this.countItem = this.countItem.bind(this);
          this.props.userItemRequest();
    }

    handleClose() {
        this.props.onClose();
    }


  componentDidMount(){
       $('.collapsible').collapsible();
  }

  userEqMount(itemId){
       axios.get('/api/account/mountItem/' + itemId)
          .then((response) => {
            this.props.getStatusRequest();
            let eqItem = response.data[0].name;
             Materialize.toast(eqItem+"을(를) 장착 하였습니다.", 1000);
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
            if(item.kind == "p"&&count!=0){
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
            else if(item.kind == "w"&&count!=0){
              return (
                    <li key={i}>
                      <div className="collapsible-header"><span className="badge">{this.props.userInfo.mount.w.id == item.id ? "장착" : "미장착"} </span>{item.name}[{item.job}]</div>
                      <div className="collapsible-body item-msg">
                        <p>등급 : {item.type}</p>
                        <p>데미지 : {item.min} ~ {item.max}+{item.min}</p>
                        <span>{item.msg}</span>
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
        },
        getStatusRequest: () => {
            return dispatch(getStatusRequest());
        },
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserItem);
