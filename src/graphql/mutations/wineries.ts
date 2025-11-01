import { gql } from '@apollo/client';

export const CREATE_WINERY = gql`
    mutation CreateWinery($input: WineryInput!) {
        createWinery(input: $input) {
            id
            name
            region
            country
            website
            description
            email
            phone
            foundedYear
            logo
            createdAt
        }
    }
`;

export const UPDATE_WINERY = gql`
    mutation UpdateWinery($id: ID!, $input: WineryInput!) {
        updateWinery(id: $id, input: $input) {
            id
            name
            region
            country
            website
            description
            email
            phone
            foundedYear
            logo
            updatedAt
        }
    }
`;

export const DELETE_WINERY = gql`
    mutation DeleteWinery($id: ID!) {
        deleteWinery(id: $id) {
            id
            name
        }
    }
`;