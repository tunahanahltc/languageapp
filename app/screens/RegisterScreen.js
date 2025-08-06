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

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading } = useAuth();
  const { themeColors } = useTheme();

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
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
    } catch (error) {
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
                <Icon name="arrow-left" size={24} color={themeColors.text} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: themeColors.text }]}>
                Hesap Oluştur
              </Text>
              <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
                Yeni hesabınızı oluşturun
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
                  placeholder="E-posta adresiniz *"
                  placeholderTextColor={themeColors.textSecondary}
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="user" size={20} color={themeColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { 
                    color: themeColors.text,
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.inputBackground
                  }]}
                  placeholder="Kullanıcı adı"
                  placeholderTextColor={themeColors.textSecondary}
                  value={formData.username}
                  onChangeText={(value) => updateFormData('username', value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Icon name="user" size={20} color={themeColors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { 
                      color: themeColors.text,
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.inputBackground
                    }]}
                    placeholder="Ad"
                    placeholderTextColor={themeColors.textSecondary}
                    value={formData.firstName}
                    onChangeText={(value) => updateFormData('firstName', value)}
                    autoCapitalize="words"
                  />
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Icon name="user" size={20} color={themeColors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { 
                      color: themeColors.text,
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.inputBackground
                    }]}
                    placeholder="Soyad"
                    placeholderTextColor={themeColors.textSecondary}
                    value={formData.lastName}
                    onChangeText={(value) => updateFormData('lastName', value)}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Icon name="phone" size={20} color={themeColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { 
                    color: themeColors.text,
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.inputBackground
                  }]}
                  placeholder="Telefon numarası"
                  placeholderTextColor={themeColors.textSecondary}
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  keyboardType="phone-pad"
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
                  placeholder="Şifre *"
                  placeholderTextColor={themeColors.textSecondary}
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
                    color={themeColors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color={themeColors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { 
                    color: themeColors.text,
                    borderColor: themeColors.border,
                    backgroundColor: themeColors.inputBackground
                  }]}
                  placeholder="Şifre tekrar *"
                  placeholderTextColor={themeColors.textSecondary}
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
                    color={themeColors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, { backgroundColor: themeColors.primary }]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.registerButtonText}>
                  {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
                Zaten hesabınız var mı?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, { color: themeColors.primary }]}>
                  Giriş yapın
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