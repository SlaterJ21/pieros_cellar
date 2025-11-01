import { gql } from '@apollo/client';

export const DELETE_PHOTO = gql`
  mutation DeletePhoto($id: ID!) {
    deletePhoto(id: $id) {
      id
    }
  }
`;

export const SET_PRIMARY_PHOTO = gql`
  mutation SetPrimaryPhoto($id: ID!) {
    setPrimaryPhoto(id: $id) {
      id
      isPrimary
    }
  }
`;

export const UPDATE_PHOTO = gql`
  mutation UpdatePhoto($id: ID!, $caption: String, $type: PhotoType) {
    updatePhoto(id: $id, caption: $caption, type: $type) {
      id
      caption
      type
      createdAt
    }
  }
`;