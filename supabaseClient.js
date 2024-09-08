import { createClient } from '@supabase/supabase-js';
import AsyncStorage from "@react-native-async-storage/async-storage";


const SUPABASE_URL = 'https://diicbjcvyojdlsmqtpsc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpaWNiamN2eW9qZGxzbXF0cHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM0MDkyNzEsImV4cCI6MTk5ODk4NTI3MX0.dKlckGdkyJ1jvSO3gxELu0CSbkuBPbj5eIPIhy69d50'; // Replace with your Supabase anon key

const options = {
    db: {
      schema: 'public',
    },
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    }
  }


const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);



export { supabase };