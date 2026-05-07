import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows } from '@/lib/theme';

interface AvatarPickerProps {
  url: string | null;
  size?: number;
  onPick: (asset: { base64: string; mimeType: string }) => void;
  uploading?: boolean;
}

export function AvatarPicker({ url, size = 96, onPick, uploading }: AvatarPickerProps) {
  const handlePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền access Photos', 'Vào Settings để cấp quyền.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset.base64) return;
    onPick({ base64: asset.base64, mimeType: asset.mimeType ?? 'image/jpeg' });
  };

  return (
    <Pressable
      onPress={handlePick}
      disabled={uploading}
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {url ? (
        <Image
          source={{ uri: url }}
          style={[styles.avatar, { borderRadius: size / 2 }]}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[styles.placeholder, { borderRadius: size / 2 }]}>
          <Ionicons name="person" size={size * 0.5} color={colors.white} />
        </View>
      )}
      <View style={styles.editBadge}>
        <Ionicons name="pencil" size={14} color={colors.white} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
});
