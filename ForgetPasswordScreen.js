import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { supabase } from './supabaseClient';
import {
  Layout,
  Text,
  TextInput,
  Button,
  themeColor,
} from "react-native-rapi-ui";

export default function ForgetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleForgetPassword() {
    setLoading(true);
    const { data, error } = await supabase.auth.api.resetPasswordForEmail(email);

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email to reset your password!");
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <Layout>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: themeColor.white100,
            }}
          >
            <Image
              resizeMode="contain"
              style={{ height: 220, width: 220 }}
              source={require("./assets/forget.png")}
            />
          </View>
          <View
            style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: themeColor.white,
            }}
          >
            <Text
              fontWeight="bold"
              style={{ alignSelf: "center", padding: 30 }}
              size="h3"
            >
              Forget Password
            </Text>
            <Text>Email</Text>
            <TextInput
              containerStyle={{ marginTop: 15 }}
              placeholder="Enter your email"
              value={email}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={(text) => setEmail(text)}
            />
            <Button
              text={loading ? "Loading" : "Send email"}
              onPress={() => handleForgetPassword()}
              style={{ marginTop: 20 }}
              disabled={loading}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15,
                justifyContent: "center",
              }}
            >
              <Text size="md">Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
                <Text
                  size="md"
                  fontWeight="bold"
                  style={{ marginLeft: 5 }}
                >
                  Login here
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}
