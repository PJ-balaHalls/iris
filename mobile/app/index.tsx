import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // O utilizador entra no app e é imediatamente redirecionado para as 3 portas do FLORA
  return <Redirect href="/(public)/entry" />;
}