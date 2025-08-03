import React, { createContext, useContext, useState } from "react";

// Başlangıç kullanıcı verisi (ileride Supabase'den gelecek)
const initialUserData = {
  name: "Kullanıcı Adı",
  level: 1,
  streak: 1,
  // İleride başka istatistikler de ekleyebilirsin
};

// Context oluştur
const UserDataContext = createContext();

// Provider bileşeni
export function UserDataProvider({ children }) {
  const [userData, setUserData] = useState(initialUserData);

  // Kullanıcı verisini güncellemek için fonksiyon
  const updateUserData = (newData) => {
    setUserData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <UserDataContext.Provider value={{ userData, updateUserData }}>
      {children}
    </UserDataContext.Provider>
  );
}

// Context'i kullanmak için özel hook
export function useUserData() {
  return useContext(UserDataContext);
}
