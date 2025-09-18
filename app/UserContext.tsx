import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "./services/firebaseConfig";
import { User } from "firebase/auth";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    // Load user from AsyncStorage on app start
    const loadUser = async () => {
      const savedUser = await AsyncStorage.getItem("userData");
      if (savedUser) setUserState(JSON.parse(savedUser));
    };
    loadUser();
  }, []);

  const setUser = async (user: User | null) => {
    setUserState(user);
    if (user) {
      await AsyncStorage.setItem("userData", JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem("userData");
    }
  };

  const logout = async () => {
    try {
      console.log("Logging out...");
      await auth.signOut(); // ✅ Firebase logout
      await AsyncStorage.removeItem("userData"); // ✅ Clear persisted user
      setUserState(null); // ✅ Reset context
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
