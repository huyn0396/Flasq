import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { supabase } from './supabaseClient';

const SettingsScreen = () => {
  const [isNotificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isRecommendationsEnabled, setRecommendationsEnabled] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const user = supabase.auth.getUser();
      

      if (user) {
        const { data, error } = await supabase
          .from('notification_setting')
          .select('phone_notify, recs')
          .eq('user_id', user.data.user.id)
          .single();

        if (error) {
          console.error('Error fetching settings:', error);
        } else {
          setNotificationsEnabled(data?.phone_notify || false);
          setRecommendationsEnabled(data?.recs || false);
        }
      }
    };

    fetchSettings();
  }, []);

  const updateSetting = async (settingName, value) => {

    const user = await supabase.auth.getUser();

    console.log(user.data.user.id)

    if (user) {
      console.log(`Updating setting ${settingName} to ${value} for user ${user.data.user.id}`);
      const updates = {};
      updates[settingName] = value;

      const { error } = await supabase
        .from('notification_setting')
        .update(updates)
        .eq('user_id', user.data.user.id);

      if (error) {
        console.error('Error updating settings:', error);
      }
    }
  };

  const toggleNotifications = () => {
    const newValue = !isNotificationsEnabled;
    setNotificationsEnabled(newValue);
    updateSetting('phone_notify', newValue);
  };

  const toggleRecommendations = () => {
    const newValue = !isRecommendationsEnabled;
    setRecommendationsEnabled(newValue);
    updateSetting('recs', newValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Phone Notifications</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isNotificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleNotifications}
          value={isNotificationsEnabled}
        />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Recommendations</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isRecommendationsEnabled ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleRecommendations}
          value={isRecommendationsEnabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    marginBottom: 10
  },
  settingText: {
    fontSize: 16
  }
});

export default SettingsScreen;
