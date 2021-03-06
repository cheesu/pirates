import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Header } from 'Components';
import { getStatusRequest, logoutRequest  } from 'Actions/authentication';
import { searchRequest} from 'Actions/search';
import { connect } from 'react-redux';
import * as firebase from "firebase";
class App extends React.Component {
  constructor(props) {
      super(props);
      this.handleLogout = this.handleLogout.bind(this);
      this.handleSearch = this.handleSearch.bind(this);
  }

  componentDidMount() {
  //  this.props.history.push('/home');
       // get cookie by name
       function getCookie(name) {
           var value = "; " + document.cookie;
           var parts = value.split("; " + name + "=");
           if (parts.length == 2) return parts.pop().split(";").shift();
       }

       // get loginData from cookie
       let loginData = getCookie('key');
       // if loginData is undefined, do nothing
       if(typeof loginData === "undefined") return;

       // decode base64 & parse json
      // loginData = JSON.parse(atob(loginData));
      loginData = JSON.parse(decodeURIComponent(atob(loginData)));
       // if not logged in, do nothing
    /*   if(!loginData.isLoggedIn){
         console.log("뀨? 로그인 펄스");

         return;
       }
*/
       // page refreshed & has a session in cookie,
       // check whether this cookie is valid or not
       this.props.getStatusRequest().then(
           () => {
               // if session is not valid
               if(!this.props.status.valid) {

                   // logout the session
                   loginData = {
                       isLoggedIn: false,
                       username: ''
                   };

                   //document.cookie='key=' + btoa(JSON.stringify(loginData));
                    //document.cookie = 'key=' + btoa(JSON.stringify(unescape(encodeURIComponent(loginData))));
                    document.cookie = 'key=' + btoa((encodeURIComponent(JSON.stringify(loginData))));
                   // and notify
                   let $toastContent = $('<span style="color: #FFB4BA">Your session is expired, please log in again</span>');
                   Materialize.toast($toastContent, 4000);
                    this.props.history.push('/home');
               }
               else{

               }


           }
       );
   }

   handleSearch(keyword) {
       this.props.searchRequest(keyword);
   }

   handleLogout() {
           this.props.logoutRequest().then(
               () => {
                   Materialize.toast('Good Bye!', 2000);

                   // EMPTIES THE SESSION
                   let loginData = {
                       isLoggedIn: false,
                       username: ''
                   };

                   document.cookie = 'key=' + btoa(JSON.stringify(loginData));
               }
           );
       }

    render(){
      /* Check whether current route is login or register using regex */
        let re = /(login|register)/;
        let isAuth = re.test(this.props.location.pathname);
        return (
            <div>
              {isAuth ? undefined : <Header isLoggedIn={this.props.status.isLoggedIn}
                                              onLogout={this.handleLogout}
                                              onSearch={this.handleSearch}
                                              usernames={this.props.searchResults}
                                              status={this.props.status}
                                              getStatusRequest={this.props.getStatusRequest}/>
                                            }


            </div>
        );
    }
}



const mapStateToProps = (state) => {
    return {
        status: state.authentication.status,
        searchResults: state.search.usernames
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        getStatusRequest: () => {
            return dispatch(getStatusRequest());
        },
        logoutRequest: () => {
            return dispatch(logoutRequest());
        },
        searchRequest: (keyword) => {
            return dispatch(searchRequest(keyword));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
