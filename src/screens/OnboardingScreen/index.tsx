import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width, height } = Dimensions.get('window');

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;  
  const btnScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Заголовок
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    // Кнопка
    Animated.sequence([
      Animated.delay(900),
      Animated.spring(btnScale, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => navigation.navigate('RoleSelect'));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0E17" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Шапка */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >          
          <Text style={styles.title}>
            Beauty on call
          </Text>
          <Text style={styles.desc}>
            Beauty on call - це твій новий спосіб замовляти beauty-послуги
            легко, швидко і там, де тобі зручно. 
          </Text>
          <Text style={styles.desc}>
            Тепер не потрібно витрачати час на пошук майстра чи довге очікування у салоні. 
          </Text>
          <Text style={styles.desc}>
            Просто відкрий додаток, обери послугу - і професійний beauty-майстер приїде до тебе додому або прийме в себе у зручний для тебе час 
          </Text>
        </Animated.View>

        {/* Кнопка */}
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            style={styles.btn}
            onPress={handlePress}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>Продовжити</Text>
            <Text style={styles.btnArrow}>→</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0E17',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 40,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8572215',
    borderWidth: 1,
    borderColor: '#E8572240',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
  },
  badgeText: {
    color: '#E85722',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 46,
    marginBottom: 16,
  },
  desc: {
    fontSize: 16,
    color: '#8B8A9E',
    lineHeight: 26,
  },
  cards: {
    gap: 12,
    marginBottom: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1A1830',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#2A2840',
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#0F0E17',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#8B8A9E',
    lineHeight: 19,
  },
  btn: {
    backgroundColor: '#E85722',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#E85722',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  btnArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
  },
});