import React from 'react';

export const UserContext = React.createContext({
    user: null,
    setUser: () => {},
    setProfilePicUrl: () => {},  // add this method
  });