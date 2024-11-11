import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView, SafeAreaView,Modal, ImageBackground,Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Avatar } from 'react-native-elements';  // need to install this library
import { supabase } from './supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { UserContext } from './UserContext';




const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');


function DisplayBarScreen({ route }) {
  const { user } = useContext(UserContext);
  //console.log('route THANGS: ', route)
  const bar = route.params;
  const [showHours, setShowHours] = useState(false);
  const [reviews, setReviews] = useState([]);


  const toggleShowHours = () => {
    setShowHours(!showHours);
  };

  const isOpen = (hours) => {

    if (!hours || hours.length === 0) {
      console.warn('Open or close hours are not defined');
      return false;
    }
    if (!hours || hours.length === 0) {
      console.warn('Open or close hours are not defined');
      return false;
    }

    const current = new Date();
    const day = current.getDay();
    const currentTime = current.getHours() * 100 + current.getMinutes();

    for (let i = 0; i < hours[0].length; i++) {
      let openDay = parseInt(hours[0][i].open.day);
      let closeDay = parseInt(hours[0][i].close.day);

      let openTime = parseInt(hours[0][i].open.time);
      let closeTime = parseInt(hours[0][i].close.time);

      if (closeDay < openDay || (closeDay === openDay && closeTime < openTime)) {
        closeDay += 7;
      }

      if (day < openDay || day > closeDay) continue;
      if (day === openDay && currentTime < openTime) continue;
      if (day === closeDay && currentTime >= closeTime) continue;

      return true;
    }

    return false;
  };

  const [openStatus, setOpenStatus] = useState(isOpen(bar.hours));

  const formatHours = (time) => {
    const hour = parseInt(time.slice(0, 2));
    const minute = parseInt(time.slice(2));
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const formattedMinute = minute < 10 ? `0${minute}` : minute;

    return `${formattedHour}:${formattedMinute} ${period}`;
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const interval = setInterval(() => {
      setOpenStatus(isOpen(bar.hours));
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const checkBarInSaved = async () => {

  }

  const fetchReviews = async () => {
    
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select("*")
      .eq('place_id', bar.id);

    if (error) {
      console.error('Error fetching reviews:', error);
    }



    setReviews(reviews || []);  // Here's where you should update `reviews`
  };



  useEffect(() => {
    fetchReviews();
    const userData =  getUserData();

    


  }, []);


  return (
    <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
    <View style={styles.container}>
      {/* <Image style={styles.image} source={{ uri: bar.primary_photo_reference }} /> */}
      <View style={{ flex:1 , justifyContent: 'center', alignItems: 'center' }}>
      <ImageBackground 
        style={styles.image}
        source={{ uri: bar.primary_photo_reference }}
      >
          <View style={styles.buttonsContainer}>
          <LikeButton barId={bar.id} />
          <ShareButton />

          </View>
      </ImageBackground>
      </View>

      <View style={styles.textContainer}>
        <View style={styles.titleRatingContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{bar.name}</Text>
          </View>

          
          <View style={styles.ratingContainer}>
            <Text>
              <Icon name="star" size={15} color="#f1c40f" />
            </Text>
            <Text style={styles.rating}>{bar.rating}</Text>
          </View>
        </View>
        <Text style={styles.address}>{bar.address}</Text>


        <TouchableOpacity onPress={toggleShowHours}>
          <View style={styles.openStatusContainer}>
            <Text style={[styles.openStatus, { color: openStatus ? 'green' : 'orange' }]}>
              {openStatus ? 'Open now' : 'Closed'}
            </Text>
            <Icon name="angle-down" size={20} color="#000" />
          </View>
        </TouchableOpacity>
        
        {showHours && bar.hours[0] && (
          <View style={styles.hoursContainer}>
            {bar.hours[0].map((hour, index) => (
              <View key={index} style={styles.hoursRow}>
                <Text style={styles.dayText}>{daysOfWeek[hour.open.day]}</Text>
                <Text style={styles.timeText}>
                  {formatHours(hour.open.time)} - {formatHours(hour.close.time)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{...styles.photosContainer}}>
          <Text style={styles.photosTitle}>Photos</Text>
          <ScrollView horizontal>
            {bar.all_photos.slice(1).map((photo, index) => (
              <Image key={index} style={styles.photoItem} source={{ uri: photo }} />
              ))}
          </ScrollView>
        </View>

        <View style={styles.reviewsContainer}>
  <Text style={styles.reviewsTitle}>Reviews & Ratings</Text>
  {reviews.map((review, index) => (
    <View key={index} style={styles.reviewItem}>
      <Avatar
        rounded
        title={review.reviewer_name.charAt(0).toUpperCase()}
        containerStyle={{ backgroundColor: 'gray' }}
      />
      <View style={styles.reviewDetails}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.reviewerName}>{review.reviewer_name}</Text>
          <View style={styles.reviewRatingContainer}>
            <Text>
              <Icon name="star" size={15} color="#f1c40f" />
            </Text>
            <Text style={styles.reviewRating}>{review.review}</Text>
          </View>
        </View>
        <Text style={styles.reviewDescription} numberOfLines={1} ellipsizeMode='tail'>{review.description}</Text>
      </View>
    </View>
  ))}
</View>




      </View>
    </View>
    </ScrollView>

  );
}

const LikeButton = ({ barId }) => {
  const [liked, setLiked] = useState(false);

  const toggleSaveBar = async () => {
    if (liked) {
      await unSave(barId);
    } else {
      await save(barId);
    }
    setLiked((prevLiked) => !prevLiked);
  };

  useEffect(() => {
    // Initial check to set the liked state based on the saved barId


    const checkSavedBar = async () => {
      const userData = await getUserData();
      if (userData && userData.userData.saved.includes(barId)) {
        setLiked(true);
        console.log(liked)
      }

      
    };

    checkSavedBar();
  }, [barId]);

  return (
    <Pressable onPress={toggleSaveBar} style={styles.saveIcon}>
      <View 
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: 50,
          padding: 5,
          elevation: 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons
          name={liked ? "heart" : "heart-outline"}
          size={32}
          color={liked ? "red" : "black"}
        />
      </View>
    </Pressable>
  );
};

const ShareButton = () => {
  const handleShare = () => {
    // Run your function when the Share button is pressed
    console.log("Share button pressed!");
  };

  return (
    <Pressable onPress={handleShare} style={styles.saveIcon}>
      <View 
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)", // Change the alpha value here
          borderRadius: 50,
          padding: 5,
          elevation: 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons
          name="share-outline"
          size={32}
          color="black"
        />
      </View>
    </Pressable>
  );
};


const save = async (barId) => {
  if (!barId) {
    console.error('No barId provided');
    return;
  }
  const userData = await getUserData();
  
  if (!userData) {
    return;
  }

  const { user, userData: { saved } } = userData;
    
  // Check if barId is already in the saved array
  if (saved && saved.includes(barId)) {
    console.log('Bar already saved.');
    return;
  }
    
  // If not, add the barId to the saved array
  const updatedSaved = saved ? [...saved, barId] : [barId];
  
  // Update the user's saved data in the database
  let { error: updateError } = await supabase
    .from('users')
    .update({ saved: updatedSaved })
    .eq('id', user.id);
  
  if (updateError) {
    console.error('Error updating saved bars:', updateError);
    return;
  }
  
  console.log('Bar saved successfully.');
}

const unSave = async (barId) => {
  if (!barId) {
    console.error('No barId provided');
    return;
  }
  const userData = await getUserData();
  
  if (!userData) {
    return;
  }
  
  const { user, userData: { saved } } = userData;
  
  // Check if barId is in the saved array
  if (saved && saved.includes(barId)) {
    // If it is, remove the barId from the saved array
    const updatedSaved = saved.filter(savedBarId => savedBarId !== barId);
  
    // Update the user's saved data in the database
    let { error: updateError } = await supabase
      .from('users')
      .update({ saved: updatedSaved })
      .eq('id', user.id);
  
    if (updateError) {
      console.error('Error updating saved bars:', updateError);
      return;
    }
    
    console.log('Bar removed successfully.');
  } else {
    console.log('Bar not found in saved list.');
  }
}

const getUserData = async () => {
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data) {
    console.error('Error getting user:', error);
    return null;
  }
  
  const user = data.user;
    
  // Fetch the user's data
  let { data: userData, error: userError } = await supabase
    .from('users')
    .select('saved')
    .eq('id', user.id)
    .single();
  
  if (userError) {
    console.error('Error fetching user data:', userError);
    return null;
  }
  return { user, userData };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    paddingLeft: 5,
    paddingRight: 5,
    //flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    
  },

  saveIcon: {
    
  },

  image: {
    flex: 1,
     width: 330, // Adjust this to add white space around the image
     height: deviceHeight * 0.3,
    justifyContent: 'flex-start', 
    alignItems: 'flex-end',     // marginBottom: 20,
    marginTop: -10,
    marginBottom:10,
    paddingLeft: 5,
    paddingRight: 5,
  },
  textContainer: {
    paddingLeft: 10,
    paddingRight: 10,
    width: '90%',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  titleRatingContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    width: '80%',
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '17%',
    height: 22,
    padding: 3,
    borderWidth: 0,
    borderRadius: 10,
    borderColor: '#000',
    backgroundColor: '#F2E6FF',
  },
  star: {
    color: 'lightyellow',
  },
  rating: {
    marginLeft: 5,
    fontSize: 12,
    color: '#000',
  },
  address: {
    fontSize: 15,
    color: 'gray',
    marginBottom: 5,
  },
  openStatus: {
    fontSize: 15,
    marginRight: 10,
  },
  openStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  hoursContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 10,
  },
  hoursRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  dayText: {
    width: 100,
    fontWeight: 'bold',
    marginRight: 10,
  },
  timeText: {
  },
  photosContainer: {
    height: deviceHeight *.25,
    marginTop: 20,
    //backgroundColor: 'red'
    
  },
  photosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    
  },
  photoItem: {
    width: 250,
    height: deviceHeight * .2,
    marginRight: 10,
    borderRadius: 10,
    
  },
  reviewsContainer: {
    marginTop: 20,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewItem: {
    width: deviceWidth *.85,
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  reviewDetails: {
    flex: 1,
    marginLeft: 10,
  },
  reviewerName: {
    fontWeight: 'semibold',
    fontSize: 16,
  },
  reviewDescription: {
    fontSize: 14,
    color: 'gray',
  },
  reviewRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '17%',
    height: 22,
    padding: 3,
    borderWidth: 0,
    borderRadius: 10,
    borderColor: '#000',
    backgroundColor: '#F2E6FF',
  },
  reviewRating: {
    marginLeft: 5,
    fontSize: 12,
    color: '#000',
  },

  button: {
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    padding: 7,
    width: '10%',
    height:'95%',
    margin: 5,  // add marginRight to the button
    borderRadius: 30,

  },
  buttonText: {
    color: 'grey',

    fontSize: 15,
    fontWeight: "10",
    textAlign: 'center',
  },
  buttonsContainer: {
    marginTop:10,
    //backgroundColor:'red',
    flexDirection: 'row',
    justifyContent: 'space-evenly',  // change this to flex-start
    width: '30%',
    
    
  },
});


export default DisplayBarScreen;