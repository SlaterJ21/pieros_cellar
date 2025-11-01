// src/graphql/queries/wineries.ts
import { gql } from '@apollo/client';

export const GET_WINERIES = gql`
    query GetWineries($search: String) {
        wineries(search: $search) {
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
            wines {
                id
                quantity
            }
            createdAt
            updatedAt
        }
    }
`;

export const GET_WINERY = gql`
    query GetWinery($id: ID!) {
        winery(id: $id) {
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
            wines {
                id
                name
                vintage
                type
                quantity
            }
            createdAt
            updatedAt
        }
    }
`;