import { gql } from '@apollo/client';

export const GET_WINE_STATS = gql`
    query GetWineStats {
        wineStats {
            totalBottles
            totalValue
            readyToDrink
            byType {
                type
                count
            }
            byCountry {
                country
                count
            }
        }
    }
`;