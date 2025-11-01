import { gql } from '@apollo/client';

export const GET_VARIETALS = gql`
    query GetVarietals($type: WineType, $search: String) {
        varietals(type: $type, search: $search) {
            id
            name
            type
            description
            commonRegions
            characteristics
            aliases
            createdAt
        }
    }
`;

// Get a single varietal with its wines
export const GET_VARIETAL = gql`
    query GetVarietal($id: ID!) {
        varietal(id: $id) {
            id
            name
            type
            description
            commonRegions
            characteristics
            aliases
            wines {
                id
                name
                vintage
                winery {
                    id
                    name
                }
                photos {
                    id
                    url
                    isPrimary
                }
                quantity
                status
            }
            createdAt
            updatedAt
        }
    }
`;

// Get varietal by name
export const GET_VARIETAL_BY_NAME = gql`
    query GetVarietalByName($name: String!) {
        varietalByName(name: $name) {
            id
            name
            type
            description
            characteristics
            aliases
        }
    }
`;