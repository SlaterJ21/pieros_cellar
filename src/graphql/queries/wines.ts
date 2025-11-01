import { gql } from '@apollo/client';

export const GET_WINES = gql`
    query GetWines($filter: WineFilterInput, $skip: Int, $take: Int) {
        wines(filter: $filter, skip: $skip, take: $take) {
            id
            name
            winery {
                id
                name
                region
                country
            }
            vintage
            varietal {
                id
                name
            }
            region
            country
            type
            quantity
            bottleSize
            purchasePrice
            currentValue
            location
            status
            personalRating
            drinkFrom
            drinkTo
            photos {
                id
                url
                type
                isPrimary
            }
            tags {
                id
                name
                color
            }
            createdAt
        }
    }
`;

export const GET_WINE = gql`
    query GetWine($id: ID!) {
        wine(id: $id) {
            id
            name
            winery {
                id
                name
                region
                country
                website
                description
                foundedYear
                logo
            }
            vintage
            varietal {
                id
                name
                type
                characteristics
                aliases
            }
            region
            subRegion
            country
            appellation
            type
            sweetness
            quantity
            bottleSize
            purchaseDate
            purchasePrice
            purchaseLocation
            retailer
            location
            binNumber
            rackNumber
            cellarZone
            drinkFrom
            drinkTo
            peakDrinking
            personalRating
            criticsRating
            criticName
            personalNotes
            tastingNotes
            currentValue
            estimatedValue
            status
            photos {
                id
                url
                s3Key
                type
                caption
                isPrimary
                createdAt
            }
            tags {
                id
                name
                color
            }
            createdAt
            updatedAt
        }
    }
`;

export const GET_TAGS = gql`
    query GetTags {
        tags {
            id
            name
            color
            wines {
                id
            }
        }
    }
`;

export const GET_CELLAR_LOCATIONS = gql`
    query GetCellarLocations {
        cellarLocations {
            id
            name
            description
            capacity
            temperature
            humidity
        }
    }
`;