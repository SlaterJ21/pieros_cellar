// src/graphql/mutations/wines.ts
import { gql } from '@apollo/client';

export const CREATE_WINE = gql`
    mutation CreateWine($input: WineInput!) {
        createWine(input: $input) {
            id
            name
            winery {
                id
                name
            }
            vintage
            type
            quantity
            createdAt
        }
    }
`;

export const UPDATE_WINE = gql`
    mutation UpdateWine($id: ID!, $input: WineInput!) {
        updateWine(id: $id, input: $input) {
            id
            name
            winery {
                id
                name
            }
            vintage
            type
            quantity
            updatedAt
        }
    }
`;

export const DELETE_WINE = gql`
    mutation DeleteWine($id: ID!) {
        deleteWine(id: $id) {
            id
            name
        }
    }
`;

export const UPDATE_WINE_QUANTITY = gql`
    mutation UpdateWineQuantity($id: ID!, $quantity: Int!) {
        updateWineQuantity(id: $id, quantity: $quantity) {
            id
            quantity
        }
    }
`;

export const CREATE_TAG = gql`
    mutation CreateTag($name: String!, $color: String) {
        createTag(name: $name, color: $color) {
            id
            name
            color
        }
    }
`;

export const ADD_PHOTO_TO_WINE = gql`
    mutation AddPhotoToWine($wineId: ID!, $url: String!, $s3Key: String, $type: PhotoType, $isPrimary: Boolean) {
        addPhotoToWine(wineId: $wineId, url: $url, s3Key: $s3Key, type: $type, isPrimary: $isPrimary) {
            id
            url
            type
            isPrimary
        }
    }
`;

export const DELETE_PHOTO = gql`
    mutation DeletePhoto($id: ID!) {
        deletePhoto(id: $id) {
            id
        }
    }
`;