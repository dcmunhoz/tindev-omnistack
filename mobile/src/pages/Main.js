import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-community/async-storage';
import { SafeAreaView, Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import api from '../services/api'

import Logo from '../assets/logo.png'
import dislike from '../assets/dislike.png'
import like from '../assets/like.png'
import iam from '../assets/itsamatch.png'
import { RangeObservable } from 'rxjs/observable/RangeObservable';

export default function  Main({navigation}) {
    const idUser = navigation.getParam('user');
    const [users, setUsers] = useState([]);
    const [matchDev, setMatchDev] = useState(null);

    useEffect(() => {
        async function loadUsers() {

            const response = await api.get('/devs', {
                headers: { user: idUser }
            });

            console.log(idUser);

            setUsers(response.data);
        };   


        loadUsers();
    }, [idUser]);

    useEffect(() => {

        const socket = io('http://localhost:3333', {
            query: {user: idUser}
        });

        socket.on('match', dev => {
            setMatchDev(dev);
        }); 
    
        // Minha versão para enviar o ID do usuário
        // socket.emit("user_connected", {
        //     userId: match.params.id
        // });

    }, [idUser]);

    async function handleLike(){
        const [ user, ...rest ] = users;

        await api.post(`/devs/${user._id}/likes`, null, {
            headers: {
                user: idUser
            }
        });

        setUsers(rest);

    }

    async function handleDislike(){
        const [ user, ...rest ] = users;

        await api.post(`/devs/${user._id}/dislikes`, null, {
            headers: {
                user: idUser
            }
        });

        setUsers(rest);

    }

    async function handleLogout(){

        await AsyncStorage.clear();

        navigation.navigate('Login');

    }

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={handleLogout}>
                <Image style={styles.logo} source={Logo}/>
            </TouchableOpacity>
            <View style={styles.cardsContainer}> 
                { users.length > 0 ? (

                    users.map((user, index) => (
                        <View key={user._id} style={[styles.cards, {zIndex: users.length - index}]}>
                            <Image style={styles.avatar} source={{uri: user.avatar}} />
                            <View style={styles.footer}>
                                <Text style={styles.name}> {user.name} </Text>
                                <Text style={styles.bio} numberOfLines={3}> {user.bio} </Text>
                            </View>
                        </View>
                    ))

                ) : <Text style={styles.empty}>Acabou =[</Text>}            


            </View>

            { users.length > 0 && (

                <View style={styles.buttonsContainer}> 
                <TouchableOpacity style={styles.button} onPress={handleDislike}>
                    <Image source={dislike} /> 
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleLike}>
                    <Image source={like} /> 
                </TouchableOpacity>
                </View>

            )}

            { matchDev && (
                <View style={styles.matchContainer}>
                    <Image style={styles.iam} source={iam} />
                    <Image style={styles.matchAvatar} source={{uri: matchDev.avatar}} />

                    <Text style={styles.matchName} >{matchDev.name}</Text>
                    <Text style={styles.matchBio} > {matchDev.bio}</Text>

                    <TouchableOpacity onPress={ () => setMatchDev(null) }>
                        <Text style={styles.closeMatch}>FECHAR</Text>
                    </TouchableOpacity>
                </View>
            ) }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    logo: {
        marginTop: 100
    },

    empty: {
        alignSelf: 'center',
        color: '#999',
        fontSize: 24,
        fontWeight: 'bold'
    },

    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    cardsContainer:{
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'center',
        maxHeight: 500

    },

    cards: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        margin: 30,
        overflow: 'hidden',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },

    avatar:{
        flex:1,
        height:300

    },

    footer:{
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingVertical: 15

    },

    name: {

        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'

    },

    bio: {

        fontSize: 14,
        color: '#999',
        marginTop: 5,
        lineHeight: 18

    },

    buttonsContainer: {
        flexDirection: 'row',
        marginBottom: 30
    },

    button: {
        width: 50,
        height: 50,
        borderRadius: 50,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: {
            width: 0,
            height: 2
        }
    },
    
    matchContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    matchAvatar: {
        width:160,
        height:160,
        borderRadius: 80,
        borderWidth: 5,
        borderColor: '#FFF',
        marginVertical: 30
    },

    matchName:{

        fontSize: 26,
        fontWeight: 'bold',
        color: "#FFF"

    },

    matchBio:{
        marginTop:10,
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 24,
        textAlign: 'center',
        paddingHorizontal: 30
    },

    iam:{
        height: 60,
        width: 248
    },

    closeMatch: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)', 
        textAlign: 'center',
        marginTop: 30       
    }

});