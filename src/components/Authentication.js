import React from 'react';
import { Link } from 'react-router-dom'
class Authentication extends React.Component {

  constructor(props) {
          super(props);
          this.state = {
              username: "",
              password: "",
              job:""
          };
          this.handleChange = this.handleChange.bind(this);
          this.handleLogin = this.handleLogin.bind(this);
          this.handleRegister = this.handleRegister.bind(this);
          this.handleKeyPress = this.handleKeyPress.bind(this);
      }

  handleKeyPress(e) {
         if(e.charCode==13) {
             if(this.props.mode) {
                 this.handleLogin();
             } else {
                 this.handleRegister();
             }
         }
     }

  handleChange(e) {
      let nextState = {};
      nextState[e.target.name] = e.target.value;
      this.setState(nextState);
  }

  handleRegister() {
         let id = this.state.username;
         let pw = this.state.password;
         let job = this.state.job;

         this.props.onRegister(id, pw, job).then(
             (result) => {
                 if(!result) {
                     this.setState({
                         username: '',
                         password: ''
                     });
                 }
             }
         );
     }

  handleLogin() {
        let id = this.state.username;
        let pw = this.state.password;

        this.props.onLogin(id, pw).then(
            (success) => {
                if(!success) {
                    this.setState({
                        password: ''
                    });
                }
            }
        );
    }

// 직업 설정
  setGender(event) {
      console.log(event.target.value);
      this.state.job = event.target.value;
    }

    render() {
      const inputBoxes = (
            <div>
                <div className="input-field col s12 username">
                    <label>Username</label>
                    <input
                    name="username"
                    type="text"
                    className="validate"
                    onChange={this.handleChange}
                    value={this.state.username}/>
                </div>
                <div className="input-field col s12">
                    <label>Password</label>
                    <input
                    name="password"
                    type="password"
                    className="validate"
                    onChange={this.handleChange}
                    value={this.state.password}
                    onKeyPress={this.handleKeyPress}/>
                </div>
            </div>
        );

        const loginView = (
            <div>
                <div className="card-content">
                    <div className="row">
                        {inputBoxes}
                        <a className="waves-effect waves-light btn"
                            onClick={this.handleLogin}>SUBMIT</a>
                    </div>
                </div>


                <div className="footer">
                    <div className="card-content">
                        <div className="right" >
                        New Here? <Link to="/register">Create an account 이곳을 눌러 계정을 생성 하세요</Link>
                        </div>
                    </div>
                </div>

            </div>
        );

        const registerView = (
            <div className="card-content">
                <div className="row">
                    {inputBoxes}
                    <div onChange={this.setGender.bind(this)}>
                         <input name="group1" type="radio" id="test1" value="검사"/>
                         <label htmlFor="test1">검사</label>
                         <input name="group1" type="radio" id="test2" value="마법사"/>
                         <label htmlFor="test2">마법사</label>
                         <input  name="group1" type="radio" id="test3" value="암살자"/>
                         <label htmlFor="test3">암살자</label>
                     </div>
                     <a className="waves-effect waves-light btn"
                         onClick={this.handleRegister}>CREATE</a>
                </div>
            </div>
        );

      return (
          <div className="container auth">
              <Link className="logo" to="/">PIRATES</Link>
              <div className="card">
                  <div className="header blue white-text center">
                      <div className="card-content">{this.props.mode ? "LOGIN" : "REGISTER"}</div>
                  </div>
                  {this.props.mode ? loginView : registerView }
              </div>
          </div>
      );
    }
}

Authentication.propTypes = {
    mode: React.PropTypes.bool,
    onLogin: React.PropTypes.func,
    onRegister: React.PropTypes.func
};

Authentication.defaultProps = {
    mode: true,
    onLogin: (id, pw) => { console.error("login function not defined"); },
    onRegister: (id, pw) => { console.error("register function not defined"); }
};

export default Authentication;
