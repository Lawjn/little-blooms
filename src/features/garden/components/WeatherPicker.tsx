import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WEATHER_OPTIONS, type WeatherTheme } from '../weather';
import { colors, radii, shadows, spacing, typography } from '@/lib/theme';

interface WeatherPickerProps {
  visible: boolean;
  current: WeatherTheme;
  onClose: () => void;
  onSelect: (theme: WeatherTheme) => void;
}

/**
 * Modal "Choose your weather" — theo Figma. 4 weather options.
 */
export function WeatherPicker({ visible, current, onClose, onSelect }: WeatherPickerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <Text style={styles.title}>Choose your weather</Text>
          <View style={styles.row}>
            {WEATHER_OPTIONS.map((opt) => {
              const isActive = opt.theme === current;
              return (
                <Pressable
                  key={opt.theme}
                  onPress={() => {
                    onSelect(opt.theme);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    isActive && styles.optionActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <MaterialCommunityIcons name={opt.icon as never} size={40} color={opt.color} />
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadows.lg,
  },
  title: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  option: {
    width: 60,
    height: 60,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.greenLight,
  },
  pressed: { opacity: 0.6 },
});
