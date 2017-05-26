import React from 'react';
import { browserHistory, Link } from 'react-router';

class Search extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userList: [],
        };

        this.addUserDataList = this.addUserDataList.bind(this);

        this.handleClose = this.handleClose.bind(this);

        // LISTEN ESC KEY, CLOSE IF PRESSED
        const listenEscKey = (evt) => {
            evt = evt || window.event;
            if (evt.keyCode == 27) {
                this.handleClose();
            }
        };

        document.onkeydown = listenEscKey;



    }


    componentDidMount(){
      io().emit('callUserList', '');
      let addUserData = this.addUserDataList.bind(this);
      io().on('callUserList', function(data){ //응답
        console.log("유저목록 출력");
        console.log(eval(data));
        addUserData(eval(data));
      });
    }

    handleClose() {
        this.props.onClose();
    }

    addUserDataList(data){
      this.setState({
        userList: this.state.userList.concat(data)
      })
    }


    render() {



        const mapDataToLinks = (data) => {
            return this.state.userList.map((userData, i) => {
                return (
                    <p className="bla-bla-class" key={i}>{userData.userID}</p>
                 );
            });
        };

        return (
            <div className="search-screen white-text">
                <div className="right">
                    <a className="waves-effect waves-light btn red lighten-1"
                        onClick={this.handleClose}>CLOSE</a>
                </div>
                <div className="container">
                    <ul className="search-results">
                      <li>현재 접속자</li>
                      { mapDataToLinks(this.props.usernames) }
                    </ul>

                </div>
            </div>
        );
    }
}

Search.propTypes = {
    onClose: React.PropTypes.func,
    usernames: React.PropTypes.array
};

Search.defaultProps = {
    onClose: () => {
        console.error('onClose not defined');
    },
    usernames: []
};

export default Search;
