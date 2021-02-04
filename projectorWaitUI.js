
import React from 'react';
import { StyleSheet, Text, View, Form, Button, TextInput, ScrollView, TouchableOpacity, Image} from 'react-native';


var copy1 = "\nThis is the help section for the Bidding Screen.\n\nThis screen is has three sections:  The current item, the current bid, and your bidding controls\n"
var copy2 = "- The Current Item shows you what you’re bidding on.  It will update as the item up for auction changes. \n\n- The Current Bid reflects the highest bid submitted so far.  It will update as the auction takes place. \n\n- The Bidding Controls give you 4 buttons.  The first three allow you to enter bids at different intervals.  These will update as the auction progresses and the current bid raises.  The fourth button is for you to enter any amount you’d like.\n"


const ProjectorWaitUI = props => {

    return (
        <View style={styles.container}>

                <Text style={styles.itemTitle}>Welcome to the live Auction Screen {'\n\n'}</Text>
                {props.children}
                <Text style={styles.itemTitle}>Please wait for the next auction to begin {'\n\n'} Once the Auctions begin, please do not close this window</Text>


        </View>
       
     
    );
};

export default ProjectorWaitUI

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        position: 'absolute', 
        padding: 30, 
        left: '5%', 
        top: '5%', 
        zIndex:2, 
        backgroundColor: "#eeeeee",
        width: '93%',
        height: '85%',
        shadowOffset: {
            height: 3
        },
        shadowOpacity: 0.38,
        shadowRadius: 8,

    },




    itemTitle: {fontSize: 35, fontWeight: "bold", textAlign: 'center'},
    itemDescription: {fontSize: 20, color: '#676c75', textAlign: 'left', marginTop: 8},
    bidPrice: {fontSize: 45, fontWeight: "bold", textAlign: 'center'},
    bidTags: {fontSize: 20, color: '#7c838f', textAlign: 'center'},

    buttons: { height: 50, backgroundColor: '#377be6', borderRadius:10 , padding: 10, marginTop: 10, width: '90%', alignSelf: 'center'},
    buttonsText: { color: '#fff', fontSize: 25, textAlign: "center", fontWeight: 'bold' },
    buttonTags: {fontSize: 15, color: '#7c838f', textAlign: 'center', marginTop: 5},
    buttonView: { marginBottom: 5},
  

  });
  



