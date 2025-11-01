// hooks/usePhotoUpload.ts
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@apollo/client/react';
import { DELETE_PHOTO, SET_PRIMARY_PHOTO } from '../graphql/mutations/photos';
import { ADD_PHOTO_TO_WINE } from '../graphql/mutations/wines';
import { GET_WINE, GET_WINES  } from '../graphql/queries/wines';

// Configuration
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadResponse {
    success: boolean;
    url: string;
    key: string;
    size: number;
    mimetype: string;
}

interface UsePhotoUploadOptions {
    wineId: string;
    onUploadComplete?: () => void;
    onUploadError?: (error: string) => void;
}

export function usePhotoUpload({ wineId, onUploadComplete, onUploadError }: UsePhotoUploadOptions) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [addPhotoMutation] = useMutation(ADD_PHOTO_TO_WINE, {
        refetchQueries: [
            { query: GET_WINE, variables: { id: wineId } },
            { query: GET_WINES, variables: { take: 10000, filter: null } }
        ],
        awaitRefetchQueries: true,
    });

    const [deletePhotoMutation] = useMutation(DELETE_PHOTO, {
        update: (cache, { data }) => {
            if (!data?.deletePhoto?.id) return;
            // Only evict the deleted photo from cache
            cache.evict({ id: cache.identify({ __typename: 'Photo', id: data.deletePhoto.id }) });
            cache.gc();
        },
        refetchQueries: [
            { query: GET_WINE, variables: { id: wineId } },
            { query: GET_WINES, variables: { take: 10000, filter: null } }
        ],
        awaitRefetchQueries: true,
    });

    const [setPrimaryMutation] = useMutation(SET_PRIMARY_PHOTO, {
        refetchQueries: [
            { query: GET_WINE, variables: { id: wineId } },
            { query: GET_WINES, variables: { take: 10000, filter: null } }
        ],
        awaitRefetchQueries: true,
    });

    // Request permissions
    const requestPermissions = async () => {
        if (Platform.OS !== 'web') {
            const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
            const mediaResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (cameraResult.status !== 'granted' || mediaResult.status !== 'granted') {
                Alert.alert(
                    'Permissions Required',
                    'Camera and photo library permissions are required to upload photos.',
                    [{ text: 'OK' }]
                );
                return false;
            }
        }
        return true;
    };

    // Validate image before upload
    const validateImage = (uri: string, size?: number): boolean => {
        if (size && size > MAX_FILE_SIZE) {
            Alert.alert(
                'File Too Large',
                'Please select an image smaller than 5MB.'
            );
            return false;
        }
        return true;
    };

    // Upload image to S3
    const uploadToS3 = async (uri: string): Promise<UploadResponse> => {
        const formData = new FormData();
        const filename = uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('file', {
            uri,
            name: filename,
            type,
        } as any);

        formData.append('wineId', wineId);

        const response = await fetch(`${API_URL}/api/upload-photo`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Upload failed');
        }

        return await response.json();
    };

    // Add photo to database
    const savePhotoToDatabase = async (
        url: string,
        s3Key: string,
        type: 'LABEL' | 'BOTTLE' | 'CORK' | 'POUR' | 'OTHER' = 'LABEL',
        isPrimary: boolean = false,
        caption?: string
    ) => {
        await addPhotoMutation({
            variables: {
                wineId,
                url,
                s3Key,
                type,
                isPrimary,
                caption,
            },
        });
    };

    // Main upload handler
    const handleUpload = async (
        uri: string,
        options?: {
            type?: 'LABEL' | 'BOTTLE' | 'CORK' | 'POUR' | 'OTHER';
            isPrimary?: boolean;
            caption?: string;
        }
    ) => {
        try {
            setUploading(true);
            setUploadProgress(0);

            // Validate
            if (!validateImage(uri)) {
                return null;
            }

            setUploadProgress(20);

            // Upload to S3
            const uploadResult = await uploadToS3(uri);
            setUploadProgress(60);

            // Save to database
            await savePhotoToDatabase(
                uploadResult.url,
                uploadResult.key,
                options?.type || 'LABEL',
                options?.isPrimary || false,
                options?.caption
            );
            setUploadProgress(100);

            if (onUploadComplete) {
                onUploadComplete();
            }

            return uploadResult;
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to upload photo';
            console.error('Upload error:', error);

            if (onUploadError) {
                onUploadError(errorMessage);
            } else {
                Alert.alert('Upload Failed', errorMessage);
            }
            return null;
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // Pick image from library
    const pickFromLibrary = async (options?: {
        type?: 'LABEL' | 'BOTTLE' | 'CORK' | 'POUR' | 'OTHER';
        isPrimary?: boolean;
        caption?: string;
    }) => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return null;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [3, 4],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                return await handleUpload(result.assets[0].uri, options);
            }

            return null;
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
            return null;
        }
    };

    // Take photo with camera
    const takePhoto = async (options?: {
        type?: 'LABEL' | 'BOTTLE' | 'CORK' | 'POUR' | 'OTHER';
        isPrimary?: boolean;
        caption?: string;
    }) => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return null;

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [3, 4],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                return await handleUpload(result.assets[0].uri, options);
            }

            return null;
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
            return null;
        }
    };

    // Delete photo
    const deletePhoto = async (photoId: string, s3Key?: string) => {
        try {
            // Delete from S3 (optional - backend should handle this)
            if (s3Key) {
                try {
                    await fetch(`${API_URL}/api/photo/${s3Key}`, {
                        method: 'DELETE',
                    });
                } catch (error) {
                    console.error('Failed to delete from S3:', error);
                    // Continue with database deletion
                }
            }

            // Delete from database
            await deletePhotoMutation({
                variables: { id: photoId },
            });

            return true;
        } catch (error: any) {
            console.error('Delete error:', error);
            Alert.alert('Error', error.message || 'Failed to delete photo');
            return false;
        }
    };

    // Set photo as primary
    const setPrimary = async (photoId: string) => {
        try {
            await setPrimaryMutation({
                variables: { id: photoId },
            });
            return true;
        } catch (error: any) {
            console.error('Set primary error:', error);
            Alert.alert('Error', error.message || 'Failed to set primary photo');
            return false;
        }
    };

    // Show photo picker menu
    const showPhotoMenu = () => {
        Alert.alert(
            'Add Photo',
            'Choose a photo source',
            [
                {
                    text: 'Take Photo',
                    onPress: () => takePhoto(),
                },
                {
                    text: 'Choose from Library',
                    onPress: () => pickFromLibrary(),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ],
            { cancelable: true }
        );
    };

    return {
        // State
        uploading,
        uploadProgress,

        // Methods
        pickFromLibrary,
        takePhoto,
        deletePhoto,
        setPrimary,
        showPhotoMenu,
        handleUpload,
        requestPermissions,
    };
}