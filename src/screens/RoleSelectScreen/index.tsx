import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  Linking,
  Dimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Role, RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelect'>;

const { width } = Dimensions.get('window');

const ROLES: { key: Role; label: string }[] = [
  {
    key: 'master',
    label: 'Я — Майстер'
  },
  {
    key: 'client',
    label: 'Я — Клієнт'
  },
];

export const RoleSelectScreen: React.FC<Props> = ({ navigation }) => {
  const [selected, setSelected] = useState<Role | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(0.95)).current;

  // Анімація вибору картки
  const selectedScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(200),
      Animated.timing(card1Anim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(380),
      Animated.timing(card2Anim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  // Показати кнопку коли роль вибрана
  useEffect(() => {
    if (selected) {
      Animated.parallel([
        Animated.timing(btnOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(btnScale, { toValue: 1, tension: 100, friction: 7, useNativeDriver: true }),
      ]).start();
    }
  }, [selected]);

  const handleRoleSelect = (role: Role) => {
    setSelected(role);
    Animated.sequence([
      Animated.timing(selectedScale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(selectedScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleContinue = () => {
    if (!selected) return;
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => navigation.navigate('Register', { role: selected }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0E17" />

      {/* Заголовок */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.title}>Beauty on call</Text>
        <Text style={styles.subtitle}>
          Знайдіть майстра, що виконає ваше замовлення, або пропонуйте свої послуги та знаходьте нових клієнтів.
        </Text>
        <Text style={styles.rolePrompt}>Оберіть свою роль</Text>
      </Animated.View>

      {/* Картки вибору ролі */}
      <View style={styles.cards}>
        {ROLES.map((role, i) => {
          const anim = i === 0 ? card1Anim : card2Anim;
          const isSelected = selected === role.key;

          return (
            <Animated.View
              key={role.key}
              style={{
                opacity: anim,
                transform: [
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => handleRoleSelect(role.key)}
                activeOpacity={0.8}
              >
                {/* Індикатор вибору */}
                <View style={styles.cardTop}>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>

                {/* Іконка */}
                <View
                  style={[
                    styles.iconWrap,
                    isSelected && styles.iconWrapSelected,
                  ]}
                >
                </View>

                <Text style={[styles.roleLabel, isSelected && styles.roleLabelSelected]}>
                  {role.label}
                </Text>

                {/* Підсвічування при виборі */}
                {isSelected && <View style={styles.selectedGlow} />}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Кнопка — з'являється після вибору ролі */}
      <Animated.View
        style={[
          styles.btnWrap,
          { opacity: btnOpacity, transform: [{ scale: btnScale }] },
        ]}
        pointerEvents={selected ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={styles.btn}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Далі</Text>
          <Text style={styles.btnArrow}>→</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Юридичний текст */}
      <View style={styles.legal}>
        <Text style={styles.legalText}>
          Створюючи обліковий запис, я погоджуюся з{' '}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL('https://example.com/terms')}
          >
            Умовами надання послуг
          </Text>
          {' '}і{' '}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL('https://example.com/privacy')}
          >
            Політикою конфіденційності
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0E17',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 64,
    marginBottom: 36,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#8B8A9E',
    lineHeight: 22,
    marginBottom: 28,
  },
  rolePrompt: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  cards: {
    flex: 1,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#1A1830',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#2A2840',
    overflow: 'hidden',
    minHeight: 200,
    justifyContent: 'flex-start',
  },
  cardSelected: {
    borderColor: '#E85722',
    backgroundColor: '#1E1620',
  },
  cardTop: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3A3850',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#E85722',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E85722',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0F0E17',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconWrapSelected: {
    backgroundColor: '#E8572215',
  },
  icon: {
    fontSize: 26,
  },
  roleLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  roleLabelSelected: {
    color: '#E85722',
  },
  roleDesc: {
    fontSize: 13,
    color: '#8B8A9E',
    lineHeight: 19,
  },
  selectedGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8572210',
  },
  btnWrap: {
    marginBottom: 20,
  },
  btn: {
    backgroundColor: '#E85722',
    borderRadius: 16,
    paddingVertical: 18,
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
  },
  legal: {
    alignItems: 'center',
  },
  legalText: {
    fontSize: 12,
    color: '#5A5870',
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: '#8B8A9E',
    textDecorationLine: 'underline',
  },
});