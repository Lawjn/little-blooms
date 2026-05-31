import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { useSignOut } from '@/features/auth/hooks';
import { useUser } from '@/features/auth/store';
import { AvatarPicker } from '@/features/profile/components/AvatarPicker';
import { StreakIndicator } from '@/features/profile/components/StreakIndicator';
import {
  useProfile,
  useUpdateProfileName,
  useUploadAvatar,
} from '@/features/profile/hooks';
import { colors, radii, spacing, typography } from '@/lib/theme';

export default function ProfileScreen() {
  const user = useUser();
  const router = useRouter();
  const profileQuery = useProfile(user?.id);
  const signOut = useSignOut();
  const updateName = useUpdateProfileName();
  const uploadAvatar = useUploadAvatar();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  useEffect(() => {
    if (profileQuery.data?.name) setNameDraft(profileQuery.data.name);
  }, [profileQuery.data?.name]);

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut.mutateAsync();
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Sign out thất bại';
            Alert.alert('Lỗi', msg);
          }
        },
      },
    ]);
  };

  const handleSaveName = async () => {
    if (!user) return;
    const trimmed = nameDraft.trim();
    if (trimmed.length < 2) {
      Alert.alert('Tên không hợp lệ', 'Tên tối thiểu 2 ký tự.');
      return;
    }
    try {
      await updateName.mutateAsync({ userId: user.id, name: trimmed });
      setEditingName(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Update thất bại';
      Alert.alert('Lỗi', msg);
    }
  };

  const handleAvatarPick = async ({
    base64,
    mimeType,
  }: {
    base64: string;
    mimeType: string;
  }) => {
    if (!user) return;
    try {
      await uploadAvatar.mutateAsync({ userId: user.id, base64, mimeType });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload avatar thất bại';
      Alert.alert('Lỗi', msg);
    }
  };

  const profile = profileQuery.data;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar + name + email */}
        <View style={styles.userCard}>
          <AvatarPicker
            url={profile?.avatar_url ?? null}
            size={96}
            onPick={handleAvatarPick}
            uploading={uploadAvatar.isPending}
          />
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{profile?.name ?? '...'}</Text>
            <Pressable onPress={() => setEditingName(true)} hitSlop={8}>
              <Ionicons name="pencil-outline" size={18} color={colors.primary} />
            </Pressable>
          </View>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Streak */}
        <StreakIndicator />

        {/* Gallery link */}
        <Pressable
          onPress={() => router.push('/gallery' as never)}
          style={styles.linkCard}
        >
          <View style={styles.linkLeft}>
            <View style={styles.linkIcon}>
              <Ionicons name="images" size={22} color={colors.white} />
            </View>
            <View>
              <Text style={styles.linkTitle}>My Photos</Text>
              <Text style={styles.linkSub}>Xem lại tất cả ảnh đã log</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
        </Pressable>

        {/* Sign out */}
        <Button
          label="Sign Out"
          onPress={handleSignOut}
          loading={signOut.isPending}
          variant="secondary"
          fullWidth
          style={styles.signOutBtn}
        />
      </ScrollView>

      {/* Edit name modal */}
      <Modal
        visible={editingName}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingName(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setEditingName(false)}>
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit name</Text>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              style={styles.modalInput}
              placeholder="Your name"
              placeholderTextColor={colors.text.secondary}
              autoFocus
            />
            <View style={styles.modalRow}>
              <Button
                label="Cancel"
                onPress={() => setEditingName(false)}
                variant="ghost"
                style={styles.modalBtn}
              />
              <Button
                label="Save"
                onPress={handleSaveName}
                loading={updateName.isPending}
                style={styles.modalBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  headerBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xl,
    color: colors.white,
    textAlign: 'center',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  userCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userName: {
    fontFamily: typography.fontFamily.extrabold,
    fontSize: typography.sizes.xl,
    color: colors.text.primary,
  },
  userEmail: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cream,
    borderRadius: radii.xl,
    padding: spacing.md,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  linkSub: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  signOutBtn: {
    marginTop: spacing.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: radii.md,
    padding: spacing.md,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  modalRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalBtn: {
    flex: 1,
  },
});
