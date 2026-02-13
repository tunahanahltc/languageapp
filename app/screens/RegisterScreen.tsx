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
import { getThemeColorProperties } from '../constants/themes';
import Background from '../components/shared/Background';
import Icon from 'react-native-vector-icons/FontAwesome';
import { RegisterScreenNavigationProp } from '../types';

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const { register, loading } = useAuth();
  const { themeColors, currentTheme } = useTheme();
  const colorProps = getThemeColorProperties(currentTheme);

  const updateFormData = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (): Promise<void> => {
    // Form validasyonu
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    try {
      const userData = {
        username: formData.username || formData.email.split('@')[0],
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      };

      await register(formData.email, formData.password, userData);
      Alert.alert('Başarılı', 'Hesabınız başarıyla oluşturuldu!');
      // Başarılı kayıt sonrası ana ekrana yönlendir
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error.message || 'Kayıt olurken bir hata oluştu.');
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
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-left" size={24} color={colorProps.text} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: colorProps.text }]}>
                Hesap Oluştur
              </Text>
              <Text style={[styles.subtitle, { color: colorProps.textSecondary }]}>
                Yeni hesabınızı oluşturun
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Icon name="envelope" size={20} color={colorProps.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { 
                    color: colorProps.text,
                    borderColor: colorProps.border,
                    backgroundColor: colorProps.inputBackground
                  }]}
                  placeholder="E-posta adresiniz *"
                  placeholderTextColor={colorProps.textSecondary}
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="user" size={20} color={colorProps.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { 
                    color: colorProps.text,
                    borderColor: colorProps.border,
                    backgroundColor: colorProps.inputBackground
                  }]}
                  placeholder="Kullanıcı adı"
                  placeholderTextColor={colorProps.textSecondary}
                  value={formData.username}
                  onChangeText={(value) => updateFormData('username', value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Icon name="user" size={20} color={colorProps.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { 
                      color: colorProps.text,
                      borderColor: colorProps.border,
                      backgroundColor: colorProps.inputBackground
                    }]}
                    placeholder="Ad"
                    placeholderTextColor={colorProps.textSecondary}
                    value={formData.firstName}
                    onChangeText={(value) => updateFormData('firstName', value)}
                    autoCapitalize="words"
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Icon name="user" size={20} color={colorProps.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { 
                      color: colorProps.text,
                      borderColor: colorProps.border,
                      backgroundColor: colorProps.inputBackground
                    }]}
                    placeholder="Soyad"
                    placeholderTextColor={colorProps.textSecondary}
                    value={formData.lastName}
                    onChangeText={(value) => updateFormData('lastName', value)}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Icon name="phone" size={20} color={colorProps.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { 
                    color: colorProps.text,
                    borderColor: colorProps.border,
                    backgroundColor: colorProps.inputBackground
                  }]}
                  placeholder="Telefon numarası"
                  placeholderTextColor={colorProps.textSecondary}
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color={colorProps.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { 
                    color: colorProps.text,
                    borderColor: colorProps.border,
                    backgroundColor: colorProps.inputBackground
                  }]}
                  placeholder="Şifre *"
                  placeholderTextColor={colorProps.textSecondary}
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
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
                    color={colorProps.textSecondary} 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color={colorProps.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { 
                    color: colorProps.text,
                    borderColor: colorProps.border,
                    backgroundColor: colorProps.inputBackground
                  }]}
                  placeholder="Şifre tekrar *"
                  placeholderTextColor={colorProps.textSecondary}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon 
                    name={showConfirmPassword ? "eye-slash" : "eye"} 
                    size={20} 
                    color={colorProps.textSecondary} 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, { backgroundColor: colorProps.primary }]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.registerButtonText}>
                  {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colorProps.textSecondary }]}>
                Zaten hesabınız var mı?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, { color: colorProps.primary }]}>
                  Giriş yapın
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Background>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 10,
    padding: 10,
  },
  title: {
    fontSize: 28,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  registerButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
