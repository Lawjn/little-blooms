import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TagGrid } from '@/components/TagGrid';
import {
  HOBBIES,
  MEALS,
  OTHER_TAGS,
  SELF_CARE,
  WEATHER,
  type TagOption,
} from '@/features/mood/data';
import { colors, radii, spacing, typography } from '@/lib/theme';

interface ActivitiesStepProps {
  hobbies: string[];
  setHobbies: (v: string[]) => void;
  meals: string[];
  setMeals: (v: string[]) => void;
  selfCare: string[];
  setSelfCare: (v: string[]) => void;
  weather: string[];
  setWeather: (v: string[]) => void;
  otherTags: string[];
  setOtherTags: (v: string[]) => void;
}

export function ActivitiesStep({
  hobbies,
  setHobbies,
  meals,
  setMeals,
  selfCare,
  setSelfCare,
  weather,
  setWeather,
  otherTags,
  setOtherTags,
}: ActivitiesStepProps) {
  const totalSelected =
    hobbies.length + meals.length + selfCare.length + weather.length + otherTags.length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Activities & context</Text>
      <Text style={styles.subtitle}>Hôm nay bạn đã làm gì? Skip nếu không nhớ</Text>

      <SubSection title="🎯 Hobbies" options={HOBBIES} value={hobbies} onChange={setHobbies} />
      <SubSection title="🍽 Meals" options={MEALS} value={meals} onChange={setMeals} />
      <SubSection title="💆 Self-Care" options={SELF_CARE} value={selfCare} onChange={setSelfCare} />
      <SubSection title="☀️ Weather" options={WEATHER} value={weather} onChange={setWeather} />
      <SubSection title="📌 Other" options={OTHER_TAGS} value={otherTags} onChange={setOtherTags} />

      {totalSelected > 0 ? (
        <Text style={styles.count}>{totalSelected} tags đã chọn</Text>
      ) : null}
    </ScrollView>
  );
}

interface SubSectionProps {
  title: string;
  options: readonly TagOption[];
  value: string[];
  onChange: (v: string[]) => void;
}

function SubSection({ title, options, value, onChange }: SubSectionProps) {
  return (
    <View style={styles.subSection}>
      <Text style={styles.subTitle}>{title}</Text>
      <TagGrid options={options} selected={value} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xxl,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subSection: {
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  subTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  count: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
