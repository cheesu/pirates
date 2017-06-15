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
            if(item.kind == "p"){
              return (
                <li key={i}>
                  <div className="collapsible-header"><span className="badge">{item.type}</span>{item.name}</div>
                  <div className="collapsible-body item-msg"><span>{item.msg}</span></div>
                </li>
               );
            }
            else if(item.kind == "w"){
              return (
                    <li key={i}>
                      <div className="collapsible-header"><span className="badge">{this.props.mountItem.w.id == item.id ? "장착" : "미장착"} </span>{item.name}[{item.job}]</div>
                      <div className="collapsible-body item-msg">
                        <p>등급 : {item.type}</p>
                        <span>{item.msg}</span>
                        <p><a onClick={this.userEqMount.bind(this,item.id)}  className="waves-effect waves-light btn">장착</a></p>
                      </div>
                    </li>
                  );
            }
            else if(item.kind == "d"){
              return (
                    <li key={i}>
                      <div className="collapsible-header"><span className="badge">  {this.props.mountItem.d.id == item.id ? "장착" : "미장착"} </span>{item.name}[{item.job}]</div>
                      <div className="collapsible-body item-msg">
                        <p>등급 : {item.type}</p>
                        <span>{item.msg}</span>
                        <p><a onClick={this.userEqMount.bind(this,item.id)}  className="waves-effect waves-light btn">장착</a></p>
                      </div>
                    </li>
                  );

                }



          });
      };

        return (
            <div className="user-item-screen white-text center-align">
                <div className="right">
                    <a className="waves-effect waves-light btn red lighten-1"
                        onClick={this.handleClose}>CLOSE</a>
                </div>
                <div className="container item-container">
                  <p>소지금 : <span>{this.props.items.gold}</span> Gold</p>
                    <ul className="collapsible item-list" data-collapsible="accordion">
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
