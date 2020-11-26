import React, { Component } from 'react';
import { ToastAndroid } from 'react-native';
import { Scene, Router, Actions } from 'react-native-router-flux';
import LoginSc from './src/screen/LoginSc';
import MainSc from './src/screen/MainSc';
import AlertSc from './src/screen/AlertSc';
import AlertDetail from './src/screen/AlertDetail';
import FriendListSc from './src/screen/FriendListSc';
import FriendDetail from './src/screen/FriendDetail';

import MapListSc from './src/screen/MapListSc';
import MapDetail from './src/screen/MapDetail';
import AvatarListSc from './src/screen/AvatarListSc';
import FavoriteSc from './src/screen/FavoriteSc';
import BlockSc from './src/screen/BlockSc';
import BlockDetail from './src/screen/BlockDetail';

import MakeDetail from './src/screen/MakeDetail';

console.disableYellowBox = true;
export default  class App extends Component {
    
    constructor() {
        super();

        this.state = {
            exitApp: false
        }
    }

    backHandler(){
        if(Actions.currentScene == "loginSc" || Actions.currentScene == "mainSc")
        {
            if (this.state.exitApp == false) {
                ToastAndroid.show('한번 더 누르시면 종료됩니다.', ToastAndroid.SHORT);
                this.state.exitApp = true;
    
                setTimeout(() => {
                    this.state.exitApp = false;
                }, 3000);
                return true;
            } else {
                return false;
            }
        }
        else
        {
            Actions.pop();
            return true;
        }
    }

    render() {
        return <Router
            backAndroidHandler={this.backHandler.bind(this)}>
            <Scene key="root">
                <Scene key="loginSc" hideNavBar={true} component={LoginSc} />
                <Scene key="mainSc" type={"replace"} hideNavBar={true} component={MainSc} />
                <Scene key="alertSc" hideNavBar={true} component={AlertSc} />
                <Scene key="alertDetail" hideNavBar={true} component={AlertDetail} />
                <Scene key="friendListSc" hideNavBar={true} component={FriendListSc} />
                <Scene key="friendDetail" hideNavBar={true} component={FriendDetail} />
                <Scene key="mapListSc" hideNavBar={true} component={MapListSc} />
                <Scene key="avatarListSc" hideNavBar={true} component={AvatarListSc} />
                <Scene key="favoriteSc" hideNavBar={true} component={FavoriteSc} />
                <Scene key="blockSc" hideNavBar={true} component={BlockSc} />
                <Scene key="blockDetail" hideNavBar={true} component={BlockDetail} />
                <Scene key="MapDetail" hideNavBar={true} component={MapDetail} />
                <Scene key="makeDetail" hideNavBar={true} component={MakeDetail} />
            </Scene>
        </Router>
    }
}
