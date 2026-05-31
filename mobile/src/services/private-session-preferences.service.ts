import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEEP_CONNECTED_KEY = "iris.private_login.keep_connected";

async function canUseSecureStore(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function getPrivateKeepConnectedPreference(): Promise<boolean> {
  try {
    const secureStoreAvailable = await canUseSecureStore();
    const value = secureStoreAvailable
      ? await SecureStore.getItemAsync(KEEP_CONNECTED_KEY)
      : await AsyncStorage.getItem(KEEP_CONNECTED_KEY);

    return value === "true";
  } catch {
    return false;
  }
}

export async function setPrivateKeepConnectedPreference(
  enabled: boolean
): Promise<void> {
  const value = enabled ? "true" : "false";

  try {
    const secureStoreAvailable = await canUseSecureStore();

    if (secureStoreAvailable) {
      await SecureStore.setItemAsync(KEEP_CONNECTED_KEY, value);
      return;
    }

    await AsyncStorage.setItem(KEEP_CONNECTED_KEY, value);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    console.warn("[IRIS_KEEP_CONNECTED_WRITE_FAILED]", { message });
  }
}

export async function clearPrivateKeepConnectedPreference(): Promise<void> {
  try {
    const secureStoreAvailable = await canUseSecureStore();

    if (secureStoreAvailable) {
      await SecureStore.deleteItemAsync(KEEP_CONNECTED_KEY);
      return;
    }

    await AsyncStorage.removeItem(KEEP_CONNECTED_KEY);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    console.warn("[IRIS_KEEP_CONNECTED_CLEAR_FAILED]", { message });
  }
}
