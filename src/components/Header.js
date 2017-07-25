import React from 'react';
import { Link } from 'react-router-dom'
import { Search, RightMenu } from 'Components';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

class Header extends React.Component {

  constructor(props) {
      super(props);
      /* IMPLEMENT: CREATE A SEARCH STATUS */
      this.state = {
          search: false,
          rightMenu:false
      };
      this.toggleSearch = this.toggleSearch.bind(this);
      this.toggleRightMenu = this.toggleRightMenu.bind(this);
  }

  toggleSearch(){
      console.log("토글 서치");
      this.setState({
          search: !this.state.search
      });
        $("#contrillerContainer").focus();
  }

  toggleRightMenu(){
      console.log("토글 RightMenu");
      this.setState({
          rightMenu: !this.state.rightMenu
      });
        $("#contrillerContainer").focus();
  }

    render() {
      const loginButton = (
                  <li>
                      <Link to="/login">
                          <i className="material-icons">vpn_key</i>
                      </Link>
                  </li>
              );

              const logoutButton = (
                    <li>
                        <Link onClick={this.props.onLogout} to="/main">
                            <i className="material-icons">lock_open</i>
                      </Link>
                    </li>
                );

              const rightMenu = (<li><a onClick={this.toggleRightMenu}><i className="material-icons">menu</i></a></li>);

        return (
            <div>
              <nav>
                 <div className="nav-wrapper blue darken-1">
                     <Link to="/game" className="brand-logo center">The Pirates</Link>

                     <ul>
                         <li><a onClick={this.toggleSearch}><i className="material-icons">search</i></a></li>
                     </ul>

                     <div className="right">
                         <ul>
                            { this.props.isLoggedIn ? logoutButton : loginButton }
                            { this.props.isLoggedIn ? rightMenu : null }

                            <li>
                                <Link to="/game">
                                    <i className="material-icons">input</i>
                                </Link>
                            </li>

                         </ul>
                     </div>
                 </div>
             </nav>
             <ReactCSSTransitionGroup transitionName="search" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                  { /* IMPLEMENT: SHOW SEARCH WHEN SEARCH STATUS IS TRUE */}
                  {this.state.search ? <Search onClose={this.toggleSearch}
                                               onSearch={this.props.onSearch}
                                               usernames={this.props.usernames}
                                               /> : undefined }
             </ReactCSSTransitionGroup>
             <ReactCSSTransitionGroup transitionName="right-menu" transitionEnterTimeout={300} transitionLeaveTimeout={300}>
                  { /* IMPLEMENT: SHOW SEARCH WHEN SEARCH STATUS IS TRUE */}
                  {this.state.rightMenu ? <RightMenu onClose={this.toggleRightMenu}
                                                    status={this.props.status}
                                                    getStatusRequest={this.props.getStatusRequest}
                                               /> : undefined }
             </ReactCSSTransitionGroup>
           </div>
        );
    }
}


Header.propTypes = {
    isLoggedIn: React.PropTypes.bool,
    onLogout: React.PropTypes.func,
    usernames:React.PropTypes.array
};



Header.defaultProps = {
    isLoggedIn: false,
    onLogout: () => { console.error("logout function not defined");},
    usernames:[]
};


export default Header;
