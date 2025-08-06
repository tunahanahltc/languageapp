import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Background from '../components/shared/Background';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const { themeColors } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      await login(email, password);
      // Başarılı giriş sonrası ana ekrana yönlendir
    } catch (error) {
      Alert.alert('Giriş Hatası', error.message || 'Giriş yapılırken bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <Background colors={themeColors}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.header}>
              <Icon name="graduation-cap" size={80} color={themeColors.text} />
              <Text style={[styles.title, { color: themeColors.text }]}>
                Kelime Öğrenme
              </Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                Hesabınıza giriş yapın
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Icon name="envelope" size={20} color={themeColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { 
                    color: themeColors.text,
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.inputBackground
                  }]}
                  placeholder="E-posta adresiniz"
                  placeholderTextColor={themeColors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color={themeColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { 
                    color: themeColors.text,
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.inputBackground
                  }]}
                  placeholder="Şifreniz"
                  placeholderTextColor={themeColors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon 
                    name={showPassword ? "eye-slash" : "eye"} 
                    size={20} 
                    color={themeColors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: themeColors.primary }]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => Alert.alert('Bilgi', 'Şifre sıfırlama özelliği yakında eklenecek.')}
              >
                <Text style={[styles.forgotPasswordText, { color: themeColors.primary }]}>
                  Şifremi unuttum
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
                Hesabınız yok mu?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.registerLink, { color: themeColors.primary }]}>
                  Kayıt olun
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Background>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 50,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    zIndex: 1,
  },
  loginButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
  registerLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
