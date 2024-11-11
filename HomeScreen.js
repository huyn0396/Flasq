import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, ScrollView, TouchableOpacity, StyleSheet, Text, Image, Dimensions } from 'react-native';
import { SearchBar, Icon } from 'react-native-elements';
import * as Location from 'expo-location';
import 'react-native-url-polyfill/auto';
import { supabase } from './supabaseClient';
import { useIsFocused } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';



const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');
const categoryImageSize = deviceWidth * 0.3; // 20% of the device width
const trendingImageSize = deviceWidth * 0.7;  // 70% of device width


function HomeScreen({navigation}) {
  //const navigation = useNavigation();

  const [initialBars, setInitialBars] = useState([]);
  const [bars, setBars] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [trendingBars, setTrendingBars] = useState([]);
  const searchInputRef = useRef(null);
  const isFocused = useIsFocused();
  const [categories, setCategories] = useState(["Beer", "Wine", "Spirits", "Music", "Dance"]);
  const navigateToBarScreen = (bar) => {
    if(!bar){console.log("no bar"); return;}
    navigation.navigate('BarDetails',bar);
  };


  useEffect(() => {
    fetchBars();
    fetchUserLocation();
    fetchTrendingBars();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
        // This function is called whenever the screen comes into focus
        setShowDropdown(false);

    }, [])
  );

  useEffect(() => {
    if (!isFocused) {
      resetSearch();
      setShowDropdown(false);
    }
  }, [isFocused]);
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', e => {
      // Prevent the default action if you don't want the navigation to proceed
      //e.preventDefault();
      // Logic for tab press here, for example:
      setShowDropdown(false);
      resetSearch();

    });
  
    return unsubscribe;
  }, [navigation]);
  

  const fetchBars = async () => {
    const { data, error } = await supabase.from('bars').select('*');
    if (error) {
      console.error(error);
    } else {
      setBars(data);
      setInitialBars(data);
    }
  };

  const fetchTrendingBars = async () => {
    const { data, error } = await supabase
      .from('bars')
      .select('*')
      .order('user_ratings_total', { ascending: false })
      .limit(10);
    if (error) {
      console.error(error);
    } else {
      setTrendingBars(data);
    }
  };

  const fetchUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // ...
  };

  const resetSearch = () => {
    if (search.length > 0) {
      setSearch('');
      setBars(initialBars);
    }
  };

  const handleIconPress = () => {
    if (showDropdown) {
      resetSearch();
      searchInputRef.current.blur();
      setShowDropdown(false);
    } else {
      searchInputRef.current.focus();
    }
  };

  const searchFilterFunction = (text) => {
    setSearch(text);
    if (text === '') {
      setBars(initialBars);
    } else {
      const newData = initialBars.filter((item) => {
        const itemData = item.name.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.includes(textData);
      });
      setBars(newData);
    }
    setShowDropdown(true);
  };

  const CustomListItem = ({ bar, isTrending }) => {
    let distance = null;
    if (location) {
      distance = calculateDistance(
        location.latitude,
        location.longitude,
        bar.latitude,
        bar.longitude
      );
    }

    return (
      <TouchableOpacity onPress={() => navigateToBarScreen(bar)} key={bar.id} style={isTrending ? styles.trendingListItemContainer : styles.listItemContainer}>
      <Image source={{ uri: bar.primary_photo_reference }} style={styles.barImage} />
      <View style={{ flex: 1, padding: 5 }}>
      <Text style={styles.barTitle} numberOfLines={1} ellipsizeMode='tail'>{bar.name}</Text>

      <Text style={styles.barSubtitle} numberOfLines={1} ellipsizeMode='tail'>{bar.address}</Text>

      </View>
    </TouchableOpacity>
      );
    };

    const CategoryItem = ({ category }) => {
        const getImageSource = (category) => {
          switch (category) {
            case 'Beer':
              return require('./beer-image.jpg'); // Replace with the path to the beer image
            case 'Wine':
              return require('./wine-image.jpg'); // Replace with the path to the wine image
            case 'Spirits':
              return require('./spirits-image.jpg'); // Replace with the path to the spirits image
            case 'Music':
              return require('./music-image.jpg'); // Replace with the path to the music image
            case 'Dance':
              return require('./dance-image.jpg'); // Replace with the path to the dance image
            default:
              return require('./default-image.jpg'); // Replace with a default image source
          }
        };
      
        return (
            <TouchableOpacity style={styles.categoryItemContainer}>
              <Image source={getImageSource(category)} style={styles.categoryImage} resizeMode="cover" />
              <View style={styles.categoryOverlay} />
              <View style={styles.categoryTextContainer}>
                <Text style={styles.categoryTitle}>{category}</Text>
              </View>
            </TouchableOpacity>
          );
        };

        return (
          <SafeAreaView style={{ flex: 1 }}>
            <SearchBar
            round
            searchIcon={
              showDropdown ? (
                <Icon
                  name="arrow-back"
                  type="material"
                  onPress={handleIconPress}
                />
              ) : (
                { size: 24 }
              )
            }
            clearIcon={
              search.length > 0
                ? { type: 'material', name: 'close', onPress: resetSearch }
                : null
            }
            onChangeText={(text) => searchFilterFunction(text)}
            onClear={() => resetSearch()}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search for bars..."
            value={search}
            containerStyle={styles.searchBarContainer}
            inputContainerStyle={styles.searchBarInputContainer}
            ref={searchInputRef}
          />
          <View style={styles.container}>
        
              </View>
      
              {showDropdown ? (
              <ScrollView style={styles.dropdownContainer}>
                  {bars.map((bar) => (
                    <CustomListItem bar={bar} key={bar.id} />
                  ))}
              </ScrollView>
              ) : (
              <ScrollView style={styles.contentContainer}>
      
                  <Text style={styles.heading}>Trending</Text>
                  <ScrollView horizontal={true} style={styles.trendingContainer}>
                    {trendingBars.map((bar) => (
                      <CustomListItem bar={bar} key={bar.id} isTrending={true} />
                    ))}
                  </ScrollView>
      
                  <Text style={styles.heading}>Category</Text>
                  <ScrollView horizontal={true} style={styles.categoryContainer}>
                    {categories.map(category => <CategoryItem key={category} category={category} />)}
                  </ScrollView>
      
                  <Text style={styles.heading}>Happy Hour Near You</Text>
                  <ScrollView horizontal={true} style={styles.happyHourContainer}>
                    {trendingBars.map((bar) => (
                      <CustomListItem bar={bar} key={bar.id} isTrending={true} />
                    ))}
                  </ScrollView>
              </ScrollView>
              )}
      
          </SafeAreaView>
        );
      }
      

const styles = StyleSheet.create({
  container: {
    flex: 0,
    
  },
  contentContainer: {
    paddingBottom: 50, // Add padding to the bottom
  },
  searchBarContainer: {
    zIndex:10,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    elevation: 0,
    paddingLeft:20,
    paddingRight:20,
    paddingTop:20,
  },
  searchBarInputContainer: {
    zIndex:4,
    backgroundColor: '#ffffff',
    borderRadius: 50,
  },
  dropdownContainer: {
    zIndex: 1,

    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  listItemContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginBottom: 20,
    marginHorizontal: 40,
    marginTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  barImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  barTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
  barSubtitle: {
    fontSize: 14,
    paddingLeft: 10,
    paddingTop: 0,
    color: 'grey',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'semibold',
    paddingTop:10,
    paddingBottom: 10,
    paddingLeft:20,
    color: 'grey',
    backgroundColor:'transparent',
  },
  trendingContainer: {
    zIndex: 1,
    
  },
  trendingListItemContainer: {
    flex: 1,  // add this
   
    width: trendingImageSize,
    height: trendingImageSize *.8, // You can also use trendingImageSize here if you want to keep it square
    backgroundColor: '#fff',
    borderRadius: 10,
    marginLeft:20,
    marginBottom:10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryContainer: {
    zIndex: 1,
    //marginBottom: -60
  },
  categoryItemContainer: {
    marginLeft:20,
    marginBottom:10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: categoryImageSize,
    height: categoryImageSize,
  },
  categoryImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  categoryTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  categoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 10,
  },

  happyHourContainer: {
    zIndex: 1,
    marginBottom: 50,
  },
});

export default HomeScreen;
