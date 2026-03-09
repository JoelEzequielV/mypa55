import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

export const saveUsers = async (users:any) => {

  await SecureStoragePlugin.set({
    key: "users",
    value: JSON.stringify(users)
  });

};

export const getUsers = async () => {

  const result = await SecureStoragePlugin.get({
    key: "users"
  });

  return JSON.parse(result.value);

};