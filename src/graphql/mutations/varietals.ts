import { gql } from '@apollo/client';

export const CREATE_VARIETAL = gql`
    mutation CreateVarietal($input: CreateVarietalInput!) {
        createVarietal(input: $input) {
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

// Update an existing varietal
export const UPDATE_VARIETAL = gql`
    mutation UpdateVarietal($id: ID!, $input: UpdateVarietalInput!) {
        updateVarietal(id: $id, input: $input) {
            id
            name
            type
            description
            commonRegions
            characteristics
            aliases
            updatedAt
        }
    }
`;

// Delete a varietal
export const DELETE_VARIETAL = gql`
    mutation DeleteVarietal($id: ID!) {
        deleteVarietal(id: $id)
    }
`;
