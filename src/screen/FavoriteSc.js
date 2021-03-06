import React, { Component } from "react";
// common component
import {
    Button,
    Text,
    Picker,
} from "native-base";
import {
    Image,
    FlatList,
    TouchableOpacity,
    ScrollView,
    View,
    TextInput,
    Dimensions,
    Alert,
	RefreshControl,
    ToastAndroid,
    ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/Entypo";
import { Actions } from 'react-native-router-flux';
import Carousel from 'react-native-snap-carousel';
import Modal from 'react-native-modal';
import {VRChatAPIGet, VRChatImage, VRChatAPIPostBody, VRChatAPIDelete} from '../utils/ApiUtils';
import styles from '../css/css';
import {NetmarbleB, NetmarbleL,NetmarbleM} from '../utils/CssUtils';
import {translate} from '../translate/TranslateUtils';
import AsyncStorage from "@react-native-community/async-storage";

export default class FavoriteSc extends Component {
    constructor(props) {
        super(props);

        this.state = {
            refreshing: false,
            refreshButton: false,
            refreshTime: false,
            modalVisible: false,
            modalLoding: true,
			search: "",
			avatarOffset: 10,
            isAvatarSearch: false,
            isWorldSearch: false,
            option: "avatar",
            getAvatars: [],
            getAvatarFilter: [],
            getWorlds: [],
            getWorldsFilter: [],
            getWorldsChooseId: null,
            getWorldsGroup: [],
            selectedGroupKey: null,
            listIndex: 0,
            fake_image: "none",
            high_image: "none",
        };
    }

    UNSAFE_componentWillMount() {
        Promise.all([this.getAvatar(),this.getWorld()])
        .then(() => {
            this.setState({
                modalLoding: false
            });
        });
        AsyncStorage.getItem("user_high_image",(err,value)=>{
            this.setState({
                high_image: value
            });
        });
        AsyncStorage.getItem("user_fake_image",(err,value)=>{
            this.setState({
                fake_image: value
            });
        });
    }

    componentWillUnmount() {
    }

    componentDidMount() {
    }

    async getAvatar(){
        let data = [];
        let offset = 0;

		let fetc = await fetch(`https://api.vrchat.cloud/api/1/avatars/favorites?sort=_updated_at&order=descending`, VRChatAPIGet)
		.then(response => response.json());
		
		for(let i=0;i<fetc.length;i++)
        {
            fetc[i].isFavorite = true;
        }
        
        // 즐겨찾기검사
        for(let i=0;i<4;i++){
            await fetch(`https://api.vrchat.cloud/api/1/favorites?type=avatar&n=100&offset=${offset}`, VRChatAPIGet)
            .then(res => res.json())
            .then(json => {
                data = data.concat(json);

                offset+=100;
            });
        }

        for(let i=0;i<fetc.length;i++)
        {
            fetc[i].isFavorite = true;
        }

        for(let i=0;i<fetc.length;i++)
        {
            fetc[i].favoriteId = null;

            for(let j=0;j<data.length;j++)
            {
                if(fetc[i].id == data[j].favoriteId)
                {
                    fetc[i].favoriteId = data[j].favoriteId;
                }
            }
        }
        this.setState({
			getAvatars:fetc,
			modalVisible: false
        });

        return new Promise((resolve, reject) =>
        resolve(fetc));
	}

    async getWorld() {
        let data = [];
        let offset = 0;
        
        await fetch("https://api.vrchat.cloud/api/1/favorite/groups?type=world", VRChatAPIGet)
        .then(res => res.json())
        .then(json => {
            this.setState({
                getWorldsGroup: json,
                selectedGroupKey: json[0].name,
            });
            this.state.getWorldsGroup[0].selected = true;
        });

        // 즐겨찾기검사
        for(let i=0;i<4;i++){
            await fetch(`https://api.vrchat.cloud/api/1/favorites?type=world&n=100&offset=${offset}`, VRChatAPIGet)
            .then(res => res.json())
            .then(json => {
                data = data.concat(json);

                offset+=100;
            });
        }

        let fetc = await fetch(`https://api.vrchat.cloud/api/1/worlds/favorites`, VRChatAPIGet)
        .then((response) => response.json());
        
        for(let i=0;i<fetc.length;i++)
        {
            fetc[i].isFavorite = true;
        }

        for(let i=0;i<fetc.length;i++)
        {
            fetc[i].group = null;
            fetc[i].favoriteId = null;

            for(let j=0;j<data.length;j++)
            {
                if(fetc[i].id == data[j].favoriteId)
                {
                    fetc[i].favoriteId = data[j].favoriteId;
                    fetc[i].group = data[j].tags[0];
                }
            }
        }

        this.setState({
			getWorlds:fetc,
			modalVisible: false
        });

        return new Promise((resolve, reject) =>
        resolve(fetc));
    }

    async favoriteAvatar(favoriteId, avatarId, isFavorite) {
		if(isFavorite == false)
        {
            await fetch(`https://api.vrchat.cloud/api/1/favorites`, VRChatAPIPostBody({
                "type":"avatar",
                "tags":["avatars1"],
                "favoriteId":avatarId
            }))
            .then((response) => response.json())
            .then((json) => {
                if(!json.error)
                {
                    for(let i=0;i<this.state.getAvatars.length;i++)
                    {
                        if(this.state.getAvatars[i].id == avatarId)
                        {
                            this.state.getAvatars[i].isFavorite = true;
                            this.state.getAvatars[i].favoriteId = json.id;
                        }
                    }

                    ToastAndroid.show(translate('msg_add_success'), ToastAndroid.SHORT);
				}
                else
                {
                    ToastAndroid.show(translate('msg_error'), ToastAndroid.SHORT);
                }
            });
        }
        else if(isFavorite == true)
        {
            await fetch(`https://api.vrchat.cloud/api/1/favorites/${favoriteId}`, VRChatAPIDelete)
            .then((response) => response.json())
            .then((json) => {
                if(!json.error)
                {
                    for(let i=0;i<this.state.getAvatars.length;i++)
                    {
                        if(this.state.getAvatars[i].id == avatarId)
                        {
                            this.state.getAvatars[i].isFavorite = false;
                            this.state.getAvatars[i].favoriteId = null;
                        }
                    }

                    ToastAndroid.show(translate('msg_delete_success'), ToastAndroid.SHORT);
                }
                else
                {
                    ToastAndroid.show(translate('msg_error'), ToastAndroid.SHORT);
                }
            });
        }

        this.setState({
            getAvatars: this.state.getAvatars
        });
	}

    async favoriteWorld(number, favoriteId, worldId, isFavorite) {
        let groupName = null;
        
        await fetch(`https://api.vrchat.cloud/api/1/favorite/groups?type=world`, VRChatAPIGet)
        .then(res => res.json())
        .then(json => {
            groupName = json[number];
            if(groupName == null)
            {
                groupName = "worlds"+(number+1);
            }
            else
            {
                groupName = json[number].name;
            }
        });

        if(isFavorite == false)
        {
            fetch(`https://api.vrchat.cloud/api/1/favorites`, VRChatAPIPostBody({
                "type":"world",
                "tags":[groupName],
                "favoriteId":worldId
            }))
            .then((response) => response.json())
            .then((json) => {
                if(!json.error)
                {
                    for(let i=0;i<this.state.getWorlds.length;i++)
                    {
                        if(this.state.getWorlds[i].id == worldId)
                        {
                            this.state.getWorlds[i].isFavorite = true;
                            this.state.getWorlds[i].favoriteId = json.id;
                            this.state.getWorlds[i].group = groupName;
                        }
                    }

                    ToastAndroid.show(translate('msg_add_success'), ToastAndroid.SHORT);
                }
                else
                {
                    ToastAndroid.show(translate('msg_error'), ToastAndroid.SHORT);
                }
                
                this.setState({
                    modalVisible: false
                });
            });
        }
        else if(isFavorite == true)
        {
            await fetch(`https://api.vrchat.cloud/api/1/favorites/${favoriteId}`, VRChatAPIDelete)
            .then((response) => response.json())
            .then((json) => {
                if(!json.error)
                {
                    for(let i=0;i<this.state.getWorlds.length;i++)
                    {
                        if(this.state.getWorlds[i].id == worldId)
                        {
                            this.state.getWorlds[i].isFavorite = false;
                            this.state.getWorlds[i].favoriteId = null;
                        }
                    }

                    ToastAndroid.show(translate('msg_delete_success'), ToastAndroid.SHORT);
                }
                else
                {
                    ToastAndroid.show(translate('msg_error'), ToastAndroid.SHORT);
                }
            });
        }

        this.setState({
            getWorlds: this.state.getWorlds,
        });
    }

    flistAvatar() {
        if(this.state.getAvatars.length < 1)
        {
            return <View style={{paddingTop:"50%",paddingBottom:"2%",alignItems:"center"}}>
                <View>
                    <NetmarbleL>{translate('msg_avatar_list_not_found')}</NetmarbleL>
                </View>
            </View>
        }
        if(this.state.isAvatarSearch == false)
		{
			return <FlatList
				style={styles.avatarListCon}
				data={this.state.getAvatars}
				extraData={this.state}
				renderItem={({item}) =>
                    <TouchableOpacity
                        onPress={() => {
                            if(Actions.currentScene == "favoriteSc" && item.authorId != this.props.userId)
                            {
                                Actions.userDetail({userId:item.authorId, isFriend:false})
                            }
                        }}
                        style={styles.avatarList}>
                        <View style={styles.avatarListView}>
                            {
                                item.isFavorite == true ?
                                <TouchableOpacity
                                style={styles.avatarIcon}
                                onPress={this.favoriteAvatar.bind(this, item.favoriteId, item.id, item.isFavorite)}>
                                    <Image
                                    source={require('../css/imgs/favorite_star.png')}
                                    style={{width:30,height:30}}/>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity
                                style={styles.avatarIcon}
                                onPress={this.favoriteAvatar.bind(this, item.favoriteId, item.id, item.isFavorite)}>
                                    <Image
                                    source={require('../css/imgs/unfavorite_star.png')}
                                    style={{width:30,height:30}}/>
                                </TouchableOpacity>
                            }
                            <View>
                                <Image
                                style={{width: 100, height: 100, borderRadius:10}}
                                source={
                                    this.state.high_image == "check"
                                    ?
                                    VRChatImage(item.imageUrl)
                                    :
                                    this.state.fake_image == "check"
                                    ?
                                    require("../css/imgs/data_safe.png")
                                    :
                                    VRChatImage(item.thumbnailImageUrl)
                                }/>
                            </View>
                            <View style={{width:"60%",marginLeft:"3%",flexDirection:"row"}}>
                                <NetmarbleL style={{lineHeight:30}}>
                                    {item.name}{"\n"}
                                    <NetmarbleB>
                                    {item.authorName}{"\n"}
                                    </NetmarbleB>
                                    {item.updated_at.substring(0,10)}
                                </NetmarbleL>
                            </View>
                        </View>
                    </TouchableOpacity>}
			/>
		}
		else if(this.state.isAvatarSearch == true)
		{
			return <FlatList
				style={styles.list}
				data={this.state.getAvatarFilter}
				extraData={this.state}
				renderItem={({item}) =>
                    <TouchableOpacity
                        onPress={() => {
                            if(Actions.currentScene == "favoriteSc" && item.authorId != this.props.userId)
                            {
                                Actions.userDetail({userId:item.authorId, isFriend:false})
                            }
                        }}
                        style={styles.avatarList}>
                        <View style={styles.avatarListView}>
                            <View>
                                <Image
                                style={{width: 100, height: 100, borderRadius:10}}
                                source={
                                    this.state.high_image == "check"
                                    ?
                                    VRChatImage(item.imageUrl)
                                    :
                                    this.state.fake_image == "check"
                                    ?
                                    require("../css/imgs/data_safe.png")
                                    :
                                    VRChatImage(item.thumbnailImageUrl)
                                }/>
                            </View>
                            <View style={{width:"100%",marginLeft:"3%",flexDirection:"row"}}>
                                <NetmarbleL style={{lineHeight:30}}>
                                    {item.name}{"\n"}
                                    {item.authorName}{"\n"}
                                    {item.updated_at.substring(0,10)}
                                </NetmarbleL>
                                <View style={{position:"absolute",top:"-10%",left:"60%"}}>
                                    {
                                    item.isFavorite == true ?
                                    <Icon 
                                    style={{zIndex:2}}
                                    onPress={this.favoriteAvatar.bind(this, item.favoriteId, item.id, item.isFavorite)}
                                    name="star" size={30} style={{color:"#FFBB00",marginBottom:5}}/>
                                    :
                                    <Icon 
                                    style={{zIndex:2}}
                                    onPress={this.favoriteAvatar.bind(this, item.favoriteId, item.id, item.isFavorite)}
                                    name="star-outlined" size={30} style={{color:"#FFBB00",marginBottom:5}}/>
                                    }
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>}
			/>
		}
    }

    flistWorld() {
        if(this.state.getWorlds.length < 1)
        {
            return <View style={{paddingTop:"50%",paddingBottom:"2%",alignItems:"center"}}>
                <View>
                    <NetmarbleL>{translate('msg_world_list_not_found')}</NetmarbleL>
                </View>
            </View>
        }
        if(this.state.isWorldSearch == false)
        {
            return <View style={{marginTop:"10%",alignItems:"center",height:"100%"}}>
                <Carousel
                    layout={'default'}
                    ref={(c) => { this._carousel = c; }}
                    extraData={this.state}
                    enableMomentum={"fast"}
                    data={this.state.getWorlds.filter((v) => v.group == this.state.selectedGroupKey)}
                    sliderWidth={parseInt(Dimensions.get('window').width / 100 * 100)}
                    itemWidth={parseInt(Dimensions.get('window').width / 100 * 80)}
                    renderItem={({item}) => 
                        item.group == this.state.selectedGroupKey &&
                        <TouchableOpacity
                            style={styles.worldInfo}
                            onPress={() => {
                                if(Actions.currentScene == "favoriteSc" && item.authorId != this.props.userId)
                                {
                                    Actions.userDetail({userId:item.authorId, isFriend:false})
                                }
                            }}>
                            <View>
                                <View style={{flexDirection:"row",justifyContent:"center"}}>
                                    <View>
                                        {
                                            item.isFavorite == true ?
                                            <TouchableOpacity
                                            style={styles.worldIcon}
                                            onPress={this.favoriteWorld.bind(this, 0, item.favoriteId, item.id, item.isFavorite)}>
                                                <Image
                                                source={require('../css/imgs/favorite_star.png')}
                                                style={{width:30,height:30}}/>
                                            </TouchableOpacity>
                                            :
                                            <TouchableOpacity
                                            style={styles.worldIcon}
                                            onPress={() => this.setState({modalVisible:true, getWorldsChooseId:item.id})}>
                                                <Image
                                                source={require('../css/imgs/unfavorite_star.png')}
                                                style={{width:30,height:30}}/>
                                            </TouchableOpacity>
                                        }
                                        <NetmarbleM style={{textAlign:"center"}}>{item.name}</NetmarbleM>
                                        <View>
                                            <Image
                                            style={{
                                                width: parseInt(Dimensions.get('window').width / 100 * 72), 
                                                height: parseInt(Dimensions.get('window').width / 100 * 50),
                                                borderRadius:5,
                                                marginTop:"5%",
                                                marginBottom:"5%"
                                            }}
                                            source={
                                                this.state.high_image == "check"
                                                ?
                                                VRChatImage(item.imageUrl)
                                                :
                                                this.state.fake_image == "check"
                                                ?
                                                require("../css/imgs/data_safe.png")
                                                :
                                                VRChatImage(item.thumbnailImageUrl)
                                            }/>
                                        </View>
                                    </View>
                                </View>
                                <View>
                                    <NetmarbleL style={{lineHeight:30}}>
                                        {translate('creator')} : {item.authorName}{"\n"}
                                        {translate('all')} : {item.occupants}{translate('people_count')}{"\n"}
                                        {translate('update_date')} : {item.updated_at.substring(0, 10)}{"\n"}
                                    </NetmarbleL>
                                </View>
                            </View>
                        </TouchableOpacity>}
                />
            </View>
        }
        else if(this.state.isWorldSearch == true)
        {
            return <View style={{width:"94%", marginLeft:"3%", height:"100%",paddingTop:"15%"}}>
                <Carousel
                    layout={'default'}
                    ref={(c) => { this._carousel = c; }} 
                    extraData={this.state}
                    data={this.state.getWorldsFilter}
                    sliderWidth={parseInt(Dimensions.get('window').width / 100 * 94)}
                    itemWidth={parseInt(Dimensions.get('window').width / 100 * 70)}
                    renderItem={({item}) => 
                        <TouchableOpacity
                            onPress={() => {
                                if(Actions.currentScene == "favoriteSc" && item.authorId != this.props.userId)
                                {
                                    Actions.userDetail({userId:item.authorId, isFriend:false})
                                }
                            }}>
                            <View style={{borderWidth:1,padding:"5%"}}>
                                <View style={{alignItems:"flex-end"}}>
                                    {
                                        item.isFavorite == true ?
                                        <TouchableOpacity
                                        onPress={this.favoriteWorld.bind(this, 0, item.favoriteId, item.id, item.isFavorite)}>
                                            <Image
                                            source={require('../css/imgs/favorite_star.png')}
                                            style={{width:30,height:30}}/>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity
                                        onPress={() => this.setState({modalVisible:true, getWorldsChooseId:item.id})}>
                                            <Image
                                            source={require('../css/imgs/unfavorite_star.png')}
                                            style={{width:30,height:30}}/>
                                        </TouchableOpacity>
                                    }
                                </View>
                                <View style={{flexDirection:"row"}}>
                                    <View>
                                        <Image
                                            style={{
                                                width: parseInt(Dimensions.get('window').width / 100 * 62), 
                                                height: parseInt(Dimensions.get('window').width / 100 * 40),
                                                borderRadius:5
                                            }}
                                            source={
                                                this.state.high_image == "check"
                                                ?
                                                VRChatImage(item.imageUrl)
                                                :
                                                this.state.fake_image == "check"
                                                ?
                                                require("../css/imgs/data_safe.png")
                                                :
                                                VRChatImage(item.thumbnailImageUrl)
                                            }
                                        />
                                    </View>
                                </View>   
                                <NetmarbleL style={{lineHeight:30}}>
                                    {translate('creator')} : {item.authorName}{"\n"}
                                    {translate('all')} : {item.occupants}{translate('people_count')}{"\n"}
                                    {translate('update_date')} : {item.updated_at.substring(0, 10)}{"\n"}
                                </NetmarbleL>
                            </View>
                        </TouchableOpacity>}
                />
            </View>
        }
    }

    worldGroup = () => 
    <View style={{alignItems:"center"}}>
        <ScrollView
            horizontal
            style={{
                width:"94%",
                minHeight:50,
                maxHeight:50,
                flexDirection:"row",
                borderColor:"#5a82dc",
                borderTopWidth:1,
                borderBottomWidth:1
            }}>
            {this.state.getWorldsGroup.map((item) => 
                <NetmarbleL 
                onPress={() => this.changeTab(item.id, item.name)}
                style={item.selected == true ? styles.mapSelectTag : styles.mapTag}>{item.displayName}</NetmarbleL>
            )}
        </ScrollView>
    </View>

    changeTab(id, key) {
        let fetc = this.state.getWorldsGroup;

        for(let i=0;i<fetc.length;i++)
        {
            fetc[i].selected = false;
        }

        this.setState({
            getWorldsGroup: fetc
        });

        fetc.filter((v) => v.id.indexOf(id) !== -1)[0].selected = true;
        
        this._carousel.snapToItem(0,true,true);
        
        this.setState({
            getWorldsGroup: fetc,
            selectedGroupKey: key,
            listIndex: 0
        });
    }

    filter = value => {
        this.setState({
            option: value
        })
    }

    search = () => {
        let serachCheck;

        if(this.state.search == null || this.state.search == "")
        {
            Alert.alert(
                translate('error'),
                translate('msg_search_key_not_found'),
                [{text: translate('ok')}]
            );
        }
        else
        {
            
            if(this.state.getAvatars != null && this.state.option == "avatar")
            {
                serachCheck = this.state.getAvatars.filter((v) => v.name.indexOf(this.state.search) !== -1)
            }
            if(this.state.getWorlds != null && this.state.option == "world")
            {
                serachCheck = this.state.getWorlds.filter((v) => v.name.indexOf(this.state.search) !== -1)
            }

            if(serachCheck.length == 0)
            {
                Alert.alert(
                    translate('error'),
                    translate('msg_no_search_results'),
                    [{text: translate('ok')}]
                );
            }
            else
            {
                if(this.state.getAvatars != null && this.state.option == "avatar")
                {
                    this.setState({
                        getAvatarFilter: serachCheck,
                        isAvatarSearch: true
                    });

                    this.flistAvatar();
                }
                if(this.state.getWorlds != null && this.state.option == "world")
                {
                    this.setState({
                        getWorldsFilter: serachCheck,
                        isWorldSearch: true,
                    });

                    this.flistWorld();
                }
            }
        }
    }

    reset(){
        if(this.state.refreshTime == false)
        {
            this.state.refreshTime = true;
            this.state.modalLoding = true;

            setTimeout(() => {
                this.state.refreshTime = false;
            }, 5000);

            Promise.all([this.getAvatar(),this.getWorld()])
            .then(() => {
                this.setState({
                    modalLoding : false
                });
            });

            this.setState({
                refreshing:false,
                isAvatarSearch:false,
                isWorldSearch:false,
                search:null
            });
        }
        else
        {
            ToastAndroid.show(translate('msg_refresh_time'), ToastAndroid.SHORT);
        }
    }

    resetButton() {
        if(this.state.refreshTime == false)
        {
            this.state.refreshTime = true;
            this.state.modalLoding = true;
            this.state.refreshButton = true;

            setTimeout(() => {
                this.state.refreshTime = false;
            }, 5000);

            Promise.all([this.getAvatar(),this.getWorld()])
            .then(() => {
                setTimeout(() => {
                    this.setState({
                        refreshButton : false
                    });
                }, 1000);
                this.setState({
                    modalLoding : false
                });
            });

            this.setState({
                refreshing:false,
                isAvatarSearch:false,
                isWorldSearch:false,
                search:null
            });
        }
        else
        {
            ToastAndroid.show(translate('msg_refresh_time'), ToastAndroid.SHORT);
        }
    }

    render() {
        return (
            <View style={{flex:1}}>
                <View style={styles.logo}>
                    <Icon
					onPress={()=>Actions.pop()}
					name="chevron-left" size={25} style={{color:"white"}}/>
                    <NetmarbleM style={{color:"white"}}>{translate('favorite_manage')}</NetmarbleM>
                    {this.state.refreshButton == false ?
                    <Icon
                    onPress={this.resetButton.bind(this)}
                    name="cycle" size={20} style={{color:"white"}}
                    />
                    :
                    <ActivityIndicator size={20} color="white"/>
                    }
                </View>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            onRefresh={this.reset.bind(this)}
                            refreshing={this.state.refreshing}
                        />
                    }
                >
                    <View style={{flexDirection:"row",justifyContent:"space-between",marginLeft:"5%",marginRight:"5%"}}>
						<View style={{borderBottomWidth:1,width:"100%",flexDirection:"row",justifyContent:"space-between",marginTop:"5%"}}>
							<TextInput 
								value={this.state.search}
								onChangeText={(text) => this.setState({search:text})}
								onSubmitEditing={this.search}
								placeholder={translate('search')}
								style={{width:"80%",height:50,fontFamily:"NetmarbleL"}}/>
							<Icon 
								onPress={this.search}
								name="magnifying-glass" size={25} style={{marginTop:15,color:"#3a4a6d"}}/>
						</View>
					</View>
                    <View style={{alignItems:"flex-end",marginRight:"5%"}}>
                        <View style={styles.selectView}>
                            <Picker 
                                selectedValue = {this.state.option}
                                onValueChange= {this.filter}
                            >
                                <Picker.Item label = {translate('avatar')} value = "avatar" />
                                <Picker.Item label = {translate('world')} value = "world" />
                            </Picker>
                        </View>
                    </View>
                    { this.state.option == "world" && this.state.isWorldSearch == false && this.worldGroup()}
                    { this.state.option == "avatar" ? this.flistAvatar() : this.flistWorld() }
                </ScrollView>
                {this.state.getWorlds != null ?
                    <Modal
                    animationType="slide"
                    style={styles.modal}
                    isVisible={this.state.modalVisible}
                    onBackButtonPress={()=>this.setState({modalVisible:false})}
                    onBackdropPress={()=>this.setState({modalVisible:false})}>
                        {this.state.modalVisible == true ?
                        <View style={{backgroundColor:"#fff",borderRadius:10}}>
                            <Button style={styles.groupButton} onPress={this.favoriteWorld.bind(this, 0, null, this.state.getWorldsChooseId, false)} ><NetmarbleL style={{color:"#000"}}>{translate('group1')}</NetmarbleL></Button>
                            <Button style={styles.groupButton} onPress={this.favoriteWorld.bind(this, 1, null, this.state.getWorldsChooseId, false)} ><NetmarbleL style={{color:"#000"}}>{translate('group2')}</NetmarbleL></Button>
                            <Button style={styles.groupButton} onPress={this.favoriteWorld.bind(this, 2, null, this.state.getWorldsChooseId, false)} ><NetmarbleL style={{color:"#000"}}>{translate('group3')}</NetmarbleL></Button>
                            <Button style={styles.groupButton} onPress={this.favoriteWorld.bind(this, 3, null, this.state.getWorldsChooseId, false)} ><NetmarbleL style={{color:"#000"}}>{translate('group4')}</NetmarbleL></Button>
                            <View style={{alignItems:"center"}}>
                                <Button 
                                onPress={()=>this.setState({modalVisible:false})}
                                style={[styles.requestButton,{width:"20%",height:40,margin:10,justifyContent:"center"}]}>
                                    <NetmarbleL>{translate('cancel')}</NetmarbleL>
                                </Button>
                            </View>
                        </View>
                        :
                        null}
                    </Modal>
                    : null
                }
                <Modal
                isVisible={this.state.modalLoding}>
                    <ActivityIndicator size={100}/>
                </Modal>
            </View>
        );
    }
}