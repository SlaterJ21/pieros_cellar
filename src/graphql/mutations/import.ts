import { gql } from '@apollo/client';

// Import a single winery
export const IMPORT_WINERY = gql`
    mutation ImportWinery($input: ImportWineryInput!) {
        importWinery(input: $input) {
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
            updatedAt
        }
    }
`;

// Import multiple wineries at once
export const IMPORT_WINERIES = gql`
    mutation ImportWineries($wineries: [ImportWineryInput!]!) {
        importWineries(wineries: $wineries) {
            imported
            skipped
            errors
            wineries {
                id
                name
                region
                country
            }
        }
    }
`;

// Import a single varietal
export const IMPORT_VARIETAL = gql`
    mutation ImportVarietal($input: ImportVarietalInput!) {
        importVarietal(input: $input) {
            id
            name
            type
            description
            commonRegions
            characteristics
            aliases
            createdAt
            updatedAt
        }
    }
`;

// Import multiple varietals at once
export const IMPORT_VARIETALS = gql`
    mutation ImportVarietals($varietals: [ImportVarietalInput!]!) {
        importVarietals(varietals: $varietals) {
            imported
            skipped
            errors
            varietals {
                id
                name
                type
            }
        }
    }
`;

// Import a single wine
export const IMPORT_WINE = gql`
    mutation ImportWine($input: ImportWineInput!) {
        importWine(input: $input) {
            id
            name
            vintage
            varietal {
                id
                name
            }
            winery {
                id
                name
            }
            region
            country
            type
            quantity
            status
        }
    }
`;

// Import multiple wines at once
export const IMPORT_WINES = gql`
    mutation ImportWines($wines: [ImportWineInput!]!) {
        importWines(wines: $wines) {
            imported
            skipped
            errors
            wines {
                id
                name
                vintage
                winery {
                    id
                    name
                }
                varietal {
                    id
                    name
                }
            }
        }
    }
`;

// Import complete collection (all entities)
export const IMPORT_COMPLETE_COLLECTION = gql`
    mutation ImportCompleteCollection($input: ImportCompleteCollectionInput!) {
        importCompleteCollection(input: $input) {
            wineries {
                imported
                skipped
                errors
            }
            varietals {
                imported
                skipped
                errors
            }
            wines {
                imported
                skipped
                errors
            }
            tags {
                imported
                skipped
                errors
            }
        }
    }
`;