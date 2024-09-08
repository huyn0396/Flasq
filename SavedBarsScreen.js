import React, { useContext, useState, useEffect } from 'react';
import { ScrollView, View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { UserContext } from './UserContext';
import { supabase } from './supabaseClient';

function SavedBarsScreen({ navigation }) {
  const { user } = useContext(UserContext);
  const [savedBars, setSavedBars] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      console.log(user.id);
      getUserData(user.id)
        .then(userData => {
          console.log(userData.saved);
          if (userData && userData.saved && userData.saved.length > 0) {
            // Fetch each saved bar details
            Promise.all(userData.saved.map(barId => getBarData(barId)))
              .then(bars => {
                console.log(bars); // Log the fetched bars
                setSavedBars(bars);
              })
              .catch(error => {
                console.error(error);
                setSavedBars([]); // Ensure savedBars is an empty array on error
              });
          } else {
            setSavedBars([]); // Set to empty array if no saved bars
          }
        })
        .catch(error => {
          console.error(error);
          setSavedBars([]); // Ensure savedBars is an empty array on error
        });
    }, [user.id])
  );
  

  return (
<ScrollView style={styles.container}>
  <View style={{ paddingBottom: 50 }}>
    {savedBars.length > 0 ? (
      savedBars.map((bar, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.barContainer}
          onPress={() => navigation.navigate('DisplayBarScreen', bar)}
        >
          <Image
            style={styles.barImage}
            source={{ uri: bar.primary_photo_reference }}
          />
          <View style={styles.overlay}>
            <Text style={styles.barName} numberOfLines={1} ellipsizeMode='tail'>{bar.name}</Text>
          </View>
        </TouchableOpacity>
      ))
    ) : (
      null // Or simply null if you don't want to show anything
    )}
  </View>
</ScrollView>

  );
}

const getUserData = async (userId) => {
  const { data: userData, error } = await supabase
    .from('users')
    .select('saved')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }

  return userData;
}

const getBarData = async (barId) => {
  const { data: barData, error } = await supabase
    .from('bars')
    .select('*')
    .eq('id', barId)
    .single();

  if (error) {
    console.error('Error fetching bar data:', error);
    throw error;
  }


  return barData;
}


const styles = StyleSheet.create({
  container: {
    paddingTop:20,
    paddingBottom:100,
    flex: 1,
    backgroundColor: '#fff',
  },
  barContainer: {
    height: 100,
    width: '90%',
    backgroundColor: 'white',
    margin: 10,
    alignSelf: 'center',
    elevation: 5,
    borderRadius: 10,
    overflow: 'hidden',

        shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  barImage: {
    width: '100%',
    height: '100%',
    
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 10,
    
  },
  barName: {
    paddingLeft:10,
    color: 'white',
    fontSize: 18,
    fontWeight:'500'
  },
});

export default SavedBarsScreen;
