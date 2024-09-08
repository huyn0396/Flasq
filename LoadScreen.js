import React, { useEffect, useContext } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { supabase } from './supabaseClient';
import { UserContext } from './UserContext';

export default function LoadingScreen({ navigation }) {
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    async function checkSession() {
      const session = await supabase.auth.getSession();

      if (session && session.data && session.data.session && session.data.session.user) {
        console.log("SESSION: ", session.data.session);
        const { data: user, error } = await supabase
          .from('users')
          .select('profile_pic, first_name, last_name, email, saved')
          .eq('id', session.data.session.user.id)
          .single();

        console.log('user: ', user); // Log the user data

        if (error) {
          console.log('Error fetching user data:', error);
          return;
        }


        setUser({
          id: session.data.session.user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          profilePicUrl: user.profile_pic,
          savedBars: user.saved
        });
        navigation.replace('Main');
      } else {
        navigation.replace('Login');
      }
    }

    checkSession();
  }, []);


  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  }
});
