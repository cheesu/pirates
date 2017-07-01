import React from 'react';
import { connect } from 'react-redux';

import { browserHistory, Link, Redirect } from 'react-router';


class HomeText extends React.Component {

  constructor(props, context) {
          super(props, context);

          this.state = {
              useScroll:'',
          };
      }

      componentWillUnmount(){

      }

      componentDidMount() {


       }

    render() {

        return (
            <div className="wrapper ad-container home-text">
              <p>처음 접속하신분은 열쇠 아이콘을 터치 하세요</p>

              <p> ------------------------ </p>
              '하아... 여긴 어디지...'
              <br/><br/>
              '남대륙으로 가던중 해적놈들이 습격한것 까진 기억이 나는데....'
              <br/><br/>
              정신을 차리고 눈을 떠보니 항구처럼 보이는 곳

              <br/><br/>

              근방의 해변가 같아 보인다.

              <br/><br/>

              몸은 모두 젖어 있었고 가진건 약간의 골드뿐
              <br/><br/>
              빌어먹을 해적놈들....
              <br/><br/>
              분명히 검은수염인지 흰머리인지 하는 해적단이었다.
              <br/><br/>
              해적놈들 모조리 몰살시켜버리고 고향으로 돌아가겠어..
              <br/><br/>
              그리고 빌어먹을 교황청놈들도!


              <br/><br/><br/><br/>
              <p>---기본 매뉴얼---</p>
              <br/>
              <p> 방향키를 이용하여 움직일 수 있습니다. </p>
              <p> 상단의 네모박스는 지도 입니다. ★은 자신의 위치 입니다. </p>
              <p> 무기강화,전직,상점의 위치로 이동하면 어택버튼이 바뀝니다</p>
              <p> 해당 버튼을 터치하여 상점을 이용할 수 있습니다 </p>
              <p> ※이 그려진 위치로 가면 다음맵이나 이전 맵으로 이동 할 수 있습니다. </p>
              <p>휴식 버튼을 누르면 15초마다 체력과 마력이 회복 됩니다.</p>
              <br/>
              <p> 어택 버튼을 누르면 몬스터와 전투를 합니다. </p>
              <p> 레벨이 올라가면 새로운 기술이 생깁니다. </p>
              <p> 전투중 물약이나 스킬을 사용 할 수 있습니다.  </p>
              <br/>

              <p> 상단 게임화면 상단의 三 모양 버튼을 터치 하면 </p>
              <p> 자신의 캐릭터 정보를 볼 수 있습니다 </p>
              <p>캐릭터 정보창에서 INVEN 버튼을 터치 하여</p>
              <p>물약을 먹거나 아이템을 장착 할수 있습니다.</p>
              <br/>

              ------기본 명령어------
              <br/>
              /초대 상대아이디
              <br/>
               상대방과 파티를 할 수 있습니다.
               <br/><br/>
               /전체 할말
               <br/>
               월드 채팅을 할 수 있습니다.
               <br/><br/>
               /귓 상대아이디
               <br/>
               상대방에게 귓속말을 할 수 있습니다.
               <br/><br/>
               일반 채팅은 현재 같은 좌표의 있는 사람에게만 전달 됩니다.





            </div>
        );
    }
}


export default HomeText;
