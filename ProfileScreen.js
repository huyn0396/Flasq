import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, Button, Alert, Image, TouchableOpacity, Text } from 'react-native'; // Imported Text
import { supabase } from './supabaseClient';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import mime from 'react-native-mime-types';
import { UserContext } from './UserContext';

export default function ProfileScreen({ navigation }) {
  const { user, setProfilePicUrl } = useContext(UserContext);
  const [localProfilePicUrl, setLocalProfilePicUrl] = useState('');

  const Placeholder = (
    <View style={styles.profilePicPlaceholder}></View>
  );

  useEffect(() => {
    if (user && user.profilePicUrl) {
      setLocalProfilePicUrl(user.profilePicUrl);
      console.log("usercontext: ", user)
    }
  }, [user]);

  const onSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      navigation.replace('LoadScreen');
    }
  };

  const deleteAvatar = async (path) => {
    const { error } = await supabase.storage.from('avatars').remove([path]);
    if (error) {
      console.error('Error deleting avatar:', error);
    }
  };

  const onPickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access the camera roll is required!');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync();
    if (pickerResult.canceled) {
      return;
    }
    const user = await supabase.auth.getUser();
    if (user && pickerResult.assets && pickerResult.assets.length > 0) {
      const { uri } = pickerResult.assets[0];
      const extension = uri.split('.').pop();
      const fileType = mime.lookup(extension);
      const path = `${user.data.user.id}/avatar.${extension}`;
      await deleteAvatar(path);
      const blob = await (await fetch(uri)).blob();
      const base64 = await convertBlobToBase64(blob);
      const base64String = base64.split(',')[1];
      const arrayBuffer = decode(base64String);
      const { error } = await supabase
        .storage
        .from('avatars')
        .upload(path, arrayBuffer, { contentType: fileType });
      if (error) {
        // Handle the error case
      } else {
        //Alert.alert('Avatar uploaded successfully');
        getURL(path);
      }
    }
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  };

  const getURL = async (path) => {
    const { data: urlData, error: urlError } = await supabase
      .storage
      .from('avatars')
      .createSignedUrl(path, 18000);

    if (urlError) {
      return;
    }

    const user = await supabase.auth.getUser();

    if (user) {
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ profile_pic: urlData.signedUrl })
        .match({ id: user.data.user.id });

      if (updateError) {
        // Handle the error case
      } else {
        const updatedUrl = `${urlData.signedUrl}`;
        setLocalProfilePicUrl(updatedUrl);
        setProfilePicUrl(updatedUrl);
      }
    }
  };

  const goToSettings = async () => {
    navigation.navigate('Settings');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text> 
      <TouchableOpacity onPress={onPickImage}>
        {user && localProfilePicUrl ? (
          <Image
            key={user.profilePicUrl}
            source={{ uri: localProfilePicUrl, cache: "reload" }}
            style={styles.profilePic}
          />
        ) : (
          Placeholder
        )}
      </TouchableOpacity>

      <Text style={styles.name}>{user.firstName + " " + user.lastName}</Text>
      <Text style={styles.email}>{user.email}</Text>


      <View style={styles.buttonsContainer}>
      <TouchableOpacity style={styles.button}  onPress={goToSettings}>
        <Text style={styles.buttonText}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 10,
  },
  title: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 70,
  },
  name: {
    marginTop: 0,
    fontSize: 24,
    fontWeight: "semibold",
    marginBottom: 0,
  },
  email: {
    marginTop: 0,
    fontSize: 15,
    
    marginBottom: 30,
    color: 'grey'
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  profilePicPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  button: {
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    padding: 7,
    width: '45%',
    margin: 5  // add marginRight to the button
  },
  buttonText: {
    color: 'grey',
    marginLeft:20,
    marginRight:20,
    fontSize: 15,
    fontWeight: "thin",
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',  // change this to flex-start
    alignItems: 'center',
    width: '100%',
    
  },
});

