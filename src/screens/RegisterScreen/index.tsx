import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { City, District, RootStackParamList } from '../../types';
import { useCities, useDistricts } from '../../hooks/useGeo';
import { useRegister } from '../../hooks/useRegister';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

// ─── Компонент кастомного Dropdown ───────────────────────────────────────────
interface DropdownProps {
  label: string;
  placeholder: string;
  value: string | null;
  items: { id: number; name: string }[];
  onSelect: (id: number, name: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder,
  value,
  items,
  onSelect,
  disabled = false,
  loading = false,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={dd.wrap}>
      <Text style={dd.label}>{label}</Text>

      <TouchableOpacity
        style={[dd.trigger, disabled && dd.triggerDisabled, open && dd.triggerOpen]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#E85722" />
        ) : (
          <>
            <Text style={[dd.value, !value && dd.placeholder]}>
              {value ?? placeholder}
            </Text>
            <Text style={dd.arrow}>{open ? '▲' : '▼'}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Модальний список */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={dd.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={dd.sheet}>
            <View style={dd.sheetHeader}>
              <Text style={dd.sheetTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={dd.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    dd.item,
                    value === item.name && dd.itemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.id, item.name);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      dd.itemText,
                      value === item.name && dd.itemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {value === item.name && (
                    <Text style={dd.itemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={dd.sep} />}
              showsVerticalScrollIndicator={false}
              style={dd.list}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ─── Головний екран ───────────────────────────────────────────────────────────
export const RegisterScreen: React.FC<Props> = ({ route, navigation }) => {
  const { role } = route.params;

  // Форма
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cityId, setCityId] = useState<number | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [districtName, setDistrictName] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // API
  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const { data: districts = [], isLoading: districtsLoading } = useDistricts(cityId);
  const { mutate: register, isPending } = useRegister();

  // Анімації
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // Скинути район при зміні міста
  const handleCitySelect = (id: number, name: string) => {
    setCityId(id);
    setCityName(name);
    setDistrictId(null);
    setDistrictName(null);
    setErrors((e) => ({ ...e, cityId: '', districtId: '' }));
  };

  // Валідація
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Введіть ваше ім'я";
    if (!/^\d{9,10}$/.test(phone)) newErrors.phone = 'Введіть коректний номер (9-10 цифр)';
    if (!cityId) newErrors.cityId = 'Оберіть місто';
    if (!districtId) newErrors.districtId = 'Оберіть район';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    register(
      {
        name: name.trim(),
        phone,
        cityId: cityId!,
        districtId: districtId!,
        role,
      },
      {
        onSuccess: (data) => {
          Alert.alert('Успіх!', data.message || 'Реєстрацію завершено', [
            { text: 'OK' },
          ]);
        },
        onError: (error) => {
          Alert.alert('Помилка', error.message || 'Щось пішло не так');
        },
      },
    );
  };

  const roleBadge = role === 'master' ? '🔧 Майстер' : '🏠 Клієнт';

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F0E17" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Шапка */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Назад */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{roleBadge}</Text>
          </View>
          <Text style={styles.title}>Реєстрація</Text>
        </Animated.View>

        {/* Форма */}
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* Ім'я */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Ваше ім'я</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder="Введіть ім'я"
              placeholderTextColor="#5A5870"
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (v.trim()) setErrors((e) => ({ ...e, name: '' }));
              }}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          {/* Телефон */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Ваш номер телефону</Text>
            <View style={styles.phoneRow}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixText}>+380</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  styles.phoneInput,
                  errors.phone ? styles.inputError : null,
                ]}
                placeholder="XX XXX XX XX"
                placeholderTextColor="#5A5870"
                value={phone}
                onChangeText={(v) => {
                  const digits = v.replace(/\D/g, '').slice(0, 10);
                  setPhone(digits);
                  if (digits.length >= 9) setErrors((e) => ({ ...e, phone: '' }));
                }}
                keyboardType="number-pad"
                maxLength={10}
                returnKeyType="done"
              />
            </View>
            {errors.phone ? (
              <Text style={styles.errorText}>{errors.phone}</Text>
            ) : null}
          </View>

          {/* Місто */}
          <Dropdown
            label="Місто"
            placeholder="Оберіть місто"
            value={cityName}
            items={cities}
            onSelect={handleCitySelect}
            loading={citiesLoading}
          />
          {errors.cityId ? (
            <Text style={[styles.errorText, { marginTop: -8, marginBottom: 12 }]}>
              {errors.cityId}
            </Text>
          ) : null}

          {/* Район */}
          <Dropdown
            label="Район"
            placeholder={cityId ? 'Оберіть район' : 'Спочатку оберіть місто'}
            value={districtName}
            items={districts}
            onSelect={(id, name) => {
              setDistrictId(id);
              setDistrictName(name);
              setErrors((e) => ({ ...e, districtId: '' }));
            }}
            disabled={!cityId}
            loading={districtsLoading}
          />
          {errors.districtId ? (
            <Text style={[styles.errorText, { marginTop: -8, marginBottom: 12 }]}>
              {errors.districtId}
            </Text>
          ) : null}

          {/* Кнопка */}
          <TouchableOpacity
            style={[styles.btn, isPending && styles.btnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.btnText}>Зареєструватися</Text>
            )}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Стилі Dropdown ──────────────────────────────────────────────────────────
const dd = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B8A9E',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  trigger: {
    backgroundColor: '#1A1830',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2A2840',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerDisabled: { opacity: 0.5 },
  triggerOpen: { borderColor: '#E85722' },
  value: { fontSize: 16, color: '#FFFFFF', flex: 1 },
  placeholder: { color: '#5A5870' },
  arrow: { fontSize: 11, color: '#5A5870', marginLeft: 8 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1A1830',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    borderTopWidth: 1,
    borderColor: '#2A2840',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2840',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sheetClose: {
    fontSize: 16,
    color: '#8B8A9E',
    padding: 4,
  },
  list: { paddingVertical: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  itemSelected: { backgroundColor: '#E8572210' },
  itemText: { fontSize: 16, color: '#CCCCCC' },
  itemTextSelected: { color: '#E85722', fontWeight: '600' },
  itemCheck: { fontSize: 16, color: '#E85722' },
  sep: { height: 1, backgroundColor: '#2A284050', marginHorizontal: 20 },
});

// ─── Стилі екрану ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F0E17',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 56,
    marginBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1A1830',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2840',
  },
  backArrow: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8572215',
    borderWidth: 1,
    borderColor: '#E8572240',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 14,
  },
  roleBadgeText: {
    color: '#E85722',
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B8A9E',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#1A1830',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2A2840',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  inputError: {
    borderColor: '#E85722',
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  phonePrefix: {
    backgroundColor: '#1A1830',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2A2840',
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phonePrefixText: {
    fontSize: 16,
    color: '#8B8A9E',
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#E85722',
    marginTop: 6,
    paddingLeft: 4,
  },
  btn: {
    backgroundColor: '#E85722',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#E85722',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    minHeight: 58,
  },
  btnDisabled: {
    opacity: 0.7,
    shadowOpacity: 0,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  legal: {
    alignItems: 'center',
    paddingBottom: 8,
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