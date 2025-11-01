import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  Decimal: { input: any; output: any; }
};

export type BottleSize =
  | 'DOUBLE_MAGNUM'
  | 'HALF'
  | 'IMPERIAL'
  | 'JEROBOAM'
  | 'MAGNUM'
  | 'STANDARD';

export type CellarLocation = {
  __typename?: 'CellarLocation';
  capacity?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  humidity?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  temperature?: Maybe<Scalars['String']['output']>;
};

export type CountryCount = {
  __typename?: 'CountryCount';
  count: Scalars['Int']['output'];
  country: Scalars['String']['output'];
};

export type CreateVarietalInput = {
  aliases?: InputMaybe<Array<Scalars['String']['input']>>;
  characteristics?: InputMaybe<Array<Scalars['String']['input']>>;
  commonRegions?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  type?: InputMaybe<WineType>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addPhotoToWine: Photo;
  createCellarLocation: CellarLocation;
  createTag: Tag;
  createVarietal: Varietal;
  createWine: Wine;
  createWinery: Winery;
  deletePhoto: Photo;
  deleteTag: Tag;
  deleteVarietal: Scalars['Boolean']['output'];
  deleteWine: Wine;
  deleteWinery: Winery;
  importWinesFromCSV: Array<Wine>;
  setPrimaryPhoto: Photo;
  updatePhoto: Photo;
  updateVarietal: Varietal;
  updateWine: Wine;
  updateWineQuantity: Wine;
  updateWinery: Winery;
};


export type MutationAddPhotoToWineArgs = {
  caption?: InputMaybe<Scalars['String']['input']>;
  isPrimary?: InputMaybe<Scalars['Boolean']['input']>;
  s3Key?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<PhotoType>;
  url: Scalars['String']['input'];
  wineId: Scalars['ID']['input'];
};


export type MutationCreateCellarLocationArgs = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  humidity?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  temperature?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateTagArgs = {
  color?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateVarietalArgs = {
  input: CreateVarietalInput;
};


export type MutationCreateWineArgs = {
  input: WineInput;
};


export type MutationCreateWineryArgs = {
  input: WineryInput;
};


export type MutationDeletePhotoArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTagArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteVarietalArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWineArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWineryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationImportWinesFromCsvArgs = {
  csvData: Scalars['String']['input'];
};


export type MutationSetPrimaryPhotoArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdatePhotoArgs = {
  caption?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  type?: InputMaybe<PhotoType>;
};


export type MutationUpdateVarietalArgs = {
  id: Scalars['ID']['input'];
  input: UpdateVarietalInput;
};


export type MutationUpdateWineArgs = {
  id: Scalars['ID']['input'];
  input: WineInput;
};


export type MutationUpdateWineQuantityArgs = {
  id: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
};


export type MutationUpdateWineryArgs = {
  id: Scalars['ID']['input'];
  input: WineryInput;
};

export type Photo = {
  __typename?: 'Photo';
  caption?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isPrimary: Scalars['Boolean']['output'];
  s3Key?: Maybe<Scalars['String']['output']>;
  type: PhotoType;
  url: Scalars['String']['output'];
  wine: Wine;
  wineId: Scalars['String']['output'];
};

export type PhotoType =
  | 'BOTTLE'
  | 'CORK'
  | 'LABEL'
  | 'OTHER'
  | 'POUR';

export type Query = {
  __typename?: 'Query';
  cellarLocations: Array<CellarLocation>;
  tags: Array<Tag>;
  varietal?: Maybe<Varietal>;
  varietalByName?: Maybe<Varietal>;
  varietals: Array<Varietal>;
  wine?: Maybe<Wine>;
  wineStats: WineStats;
  wineries: Array<Winery>;
  winery?: Maybe<Winery>;
  wines: Array<Wine>;
};


export type QueryVarietalArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVarietalByNameArgs = {
  name: Scalars['String']['input'];
};


export type QueryVarietalsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<WineType>;
};


export type QueryWineArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWineriesArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWineryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWinesArgs = {
  filter?: InputMaybe<WineFilterInput>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type Sweetness =
  | 'BONE_DRY'
  | 'DRY'
  | 'MEDIUM_SWEET'
  | 'OFF_DRY'
  | 'SWEET'
  | 'VERY_SWEET';

export type Tag = {
  __typename?: 'Tag';
  color?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  wines: Array<Wine>;
};

export type TypeCount = {
  __typename?: 'TypeCount';
  count: Scalars['Int']['output'];
  type: WineType;
};

export type UpdateVarietalInput = {
  aliases?: InputMaybe<Array<Scalars['String']['input']>>;
  characteristics?: InputMaybe<Array<Scalars['String']['input']>>;
  commonRegions?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<WineType>;
};

export type Varietal = {
  __typename?: 'Varietal';
  aliases: Array<Scalars['String']['output']>;
  characteristics: Array<Scalars['String']['output']>;
  commonRegions: Array<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type?: Maybe<WineType>;
  updatedAt: Scalars['DateTime']['output'];
  wines: Array<Wine>;
};

export type Wine = {
  __typename?: 'Wine';
  appellation?: Maybe<Scalars['String']['output']>;
  binNumber?: Maybe<Scalars['String']['output']>;
  bottleSize: BottleSize;
  cellarZone?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  criticName?: Maybe<Scalars['String']['output']>;
  criticsRating?: Maybe<Scalars['Int']['output']>;
  currentValue?: Maybe<Scalars['Decimal']['output']>;
  drinkFrom?: Maybe<Scalars['Int']['output']>;
  drinkTo?: Maybe<Scalars['Int']['output']>;
  estimatedValue?: Maybe<Scalars['Decimal']['output']>;
  id: Scalars['ID']['output'];
  location?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  peakDrinking?: Maybe<Scalars['Int']['output']>;
  personalNotes?: Maybe<Scalars['String']['output']>;
  personalRating?: Maybe<Scalars['Int']['output']>;
  photos: Array<Photo>;
  purchaseDate?: Maybe<Scalars['DateTime']['output']>;
  purchaseLocation?: Maybe<Scalars['String']['output']>;
  purchasePrice?: Maybe<Scalars['Decimal']['output']>;
  quantity: Scalars['Int']['output'];
  rackNumber?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  retailer?: Maybe<Scalars['String']['output']>;
  status: WineStatus;
  subRegion?: Maybe<Scalars['String']['output']>;
  sweetness?: Maybe<Sweetness>;
  tags: Array<Tag>;
  tastingNotes?: Maybe<Scalars['String']['output']>;
  type: WineType;
  updatedAt: Scalars['DateTime']['output'];
  varietal?: Maybe<Varietal>;
  varietalId?: Maybe<Scalars['String']['output']>;
  vintage?: Maybe<Scalars['Int']['output']>;
  winery: Winery;
  wineryId: Scalars['String']['output'];
};

export type WineFilterInput = {
  country?: InputMaybe<Scalars['String']['input']>;
  maxPrice?: InputMaybe<Scalars['Decimal']['input']>;
  maxVintage?: InputMaybe<Scalars['Int']['input']>;
  minPrice?: InputMaybe<Scalars['Decimal']['input']>;
  minVintage?: InputMaybe<Scalars['Int']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<WineStatus>;
  type?: InputMaybe<WineType>;
  varietalId?: InputMaybe<Scalars['String']['input']>;
  wineryId?: InputMaybe<Scalars['String']['input']>;
};

export type WineInput = {
  appellation?: InputMaybe<Scalars['String']['input']>;
  binNumber?: InputMaybe<Scalars['String']['input']>;
  bottleSize?: InputMaybe<BottleSize>;
  cellarZone?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  criticName?: InputMaybe<Scalars['String']['input']>;
  criticsRating?: InputMaybe<Scalars['Int']['input']>;
  currentValue?: InputMaybe<Scalars['Decimal']['input']>;
  drinkFrom?: InputMaybe<Scalars['Int']['input']>;
  drinkTo?: InputMaybe<Scalars['Int']['input']>;
  estimatedValue?: InputMaybe<Scalars['Decimal']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  peakDrinking?: InputMaybe<Scalars['Int']['input']>;
  personalNotes?: InputMaybe<Scalars['String']['input']>;
  personalRating?: InputMaybe<Scalars['Int']['input']>;
  purchaseDate?: InputMaybe<Scalars['DateTime']['input']>;
  purchaseLocation?: InputMaybe<Scalars['String']['input']>;
  purchasePrice?: InputMaybe<Scalars['Decimal']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  rackNumber?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  retailer?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<WineStatus>;
  subRegion?: InputMaybe<Scalars['String']['input']>;
  sweetness?: InputMaybe<Sweetness>;
  tagIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  tastingNotes?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<WineType>;
  varietalId?: InputMaybe<Scalars['String']['input']>;
  vintage?: InputMaybe<Scalars['Int']['input']>;
  wineryId: Scalars['String']['input'];
};

export type WineStats = {
  __typename?: 'WineStats';
  byCountry: Array<CountryCount>;
  byType: Array<TypeCount>;
  readyToDrink: Scalars['Int']['output'];
  totalBottles: Scalars['Int']['output'];
  totalValue: Scalars['Decimal']['output'];
};

export type WineStatus =
  | 'CONSUMED'
  | 'GIFTED'
  | 'IN_CELLAR'
  | 'PAST_PEAK'
  | 'READY_TO_DRINK'
  | 'RESERVED'
  | 'SOLD';

export type WineType =
  | 'DESSERT'
  | 'FORTIFIED'
  | 'ORANGE'
  | 'RED'
  | 'ROSE'
  | 'SPARKLING'
  | 'WHITE';

export type Winery = {
  __typename?: 'Winery';
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  foundedYear?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  website?: Maybe<Scalars['String']['output']>;
  wines: Array<Wine>;
};

export type WineryInput = {
  country?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  foundedYear?: InputMaybe<Scalars['Int']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type DeletePhotoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeletePhotoMutation = { __typename?: 'Mutation', deletePhoto: { __typename?: 'Photo', id: string } };

export type SetPrimaryPhotoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SetPrimaryPhotoMutation = { __typename?: 'Mutation', setPrimaryPhoto: { __typename?: 'Photo', id: string, isPrimary: boolean } };

export type UpdatePhotoMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  caption?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<PhotoType>;
}>;


export type UpdatePhotoMutation = { __typename?: 'Mutation', updatePhoto: { __typename?: 'Photo', id: string, caption?: string | null, type: PhotoType, createdAt: any } };

export type CreateVarietalMutationVariables = Exact<{
  input: CreateVarietalInput;
}>;


export type CreateVarietalMutation = { __typename?: 'Mutation', createVarietal: { __typename?: 'Varietal', id: string, name: string, type?: WineType | null, description?: string | null, commonRegions: Array<string>, characteristics: Array<string>, aliases: Array<string>, createdAt: any } };

export type UpdateVarietalMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateVarietalInput;
}>;


export type UpdateVarietalMutation = { __typename?: 'Mutation', updateVarietal: { __typename?: 'Varietal', id: string, name: string, type?: WineType | null, description?: string | null, commonRegions: Array<string>, characteristics: Array<string>, aliases: Array<string>, updatedAt: any } };

export type DeleteVarietalMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteVarietalMutation = { __typename?: 'Mutation', deleteVarietal: boolean };

export type CreateWineryMutationVariables = Exact<{
  input: WineryInput;
}>;


export type CreateWineryMutation = { __typename?: 'Mutation', createWinery: { __typename?: 'Winery', id: string, name: string, region?: string | null, country?: string | null, website?: string | null, description?: string | null, email?: string | null, phone?: string | null, foundedYear?: number | null, logo?: string | null, createdAt: any } };

export type UpdateWineryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: WineryInput;
}>;


export type UpdateWineryMutation = { __typename?: 'Mutation', updateWinery: { __typename?: 'Winery', id: string, name: string, region?: string | null, country?: string | null, website?: string | null, description?: string | null, email?: string | null, phone?: string | null, foundedYear?: number | null, logo?: string | null, updatedAt: any } };

export type DeleteWineryMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteWineryMutation = { __typename?: 'Mutation', deleteWinery: { __typename?: 'Winery', id: string, name: string } };

export type CreateWineMutationVariables = Exact<{
  input: WineInput;
}>;


export type CreateWineMutation = { __typename?: 'Mutation', createWine: { __typename?: 'Wine', id: string, name: string, vintage?: number | null, type: WineType, quantity: number, createdAt: any, winery: { __typename?: 'Winery', id: string, name: string } } };

export type UpdateWineMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: WineInput;
}>;


export type UpdateWineMutation = { __typename?: 'Mutation', updateWine: { __typename?: 'Wine', id: string, name: string, vintage?: number | null, type: WineType, quantity: number, updatedAt: any, winery: { __typename?: 'Winery', id: string, name: string } } };

export type DeleteWineMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteWineMutation = { __typename?: 'Mutation', deleteWine: { __typename?: 'Wine', id: string, name: string } };

export type UpdateWineQuantityMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
}>;


export type UpdateWineQuantityMutation = { __typename?: 'Mutation', updateWineQuantity: { __typename?: 'Wine', id: string, quantity: number } };

export type CreateTagMutationVariables = Exact<{
  name: Scalars['String']['input'];
  color?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateTagMutation = { __typename?: 'Mutation', createTag: { __typename?: 'Tag', id: string, name: string, color?: string | null } };

export type AddPhotoToWineMutationVariables = Exact<{
  wineId: Scalars['ID']['input'];
  url: Scalars['String']['input'];
  s3Key?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<PhotoType>;
  isPrimary?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type AddPhotoToWineMutation = { __typename?: 'Mutation', addPhotoToWine: { __typename?: 'Photo', id: string, url: string, type: PhotoType, isPrimary: boolean } };

export type GetWineStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWineStatsQuery = { __typename?: 'Query', wineStats: { __typename?: 'WineStats', totalBottles: number, totalValue: any, readyToDrink: number, byType: Array<{ __typename?: 'TypeCount', type: WineType, count: number }>, byCountry: Array<{ __typename?: 'CountryCount', country: string, count: number }> } };

export type GetVarietalsQueryVariables = Exact<{
  type?: InputMaybe<WineType>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetVarietalsQuery = { __typename?: 'Query', varietals: Array<{ __typename?: 'Varietal', id: string, name: string, type?: WineType | null, description?: string | null, commonRegions: Array<string>, characteristics: Array<string>, aliases: Array<string>, createdAt: any }> };

export type GetVarietalQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetVarietalQuery = { __typename?: 'Query', varietal?: { __typename?: 'Varietal', id: string, name: string, type?: WineType | null, description?: string | null, commonRegions: Array<string>, characteristics: Array<string>, aliases: Array<string>, createdAt: any, updatedAt: any, wines: Array<{ __typename?: 'Wine', id: string, name: string, vintage?: number | null, quantity: number, status: WineStatus, winery: { __typename?: 'Winery', id: string, name: string }, photos: Array<{ __typename?: 'Photo', id: string, url: string, isPrimary: boolean }> }> } | null };

export type GetVarietalByNameQueryVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type GetVarietalByNameQuery = { __typename?: 'Query', varietalByName?: { __typename?: 'Varietal', id: string, name: string, type?: WineType | null, description?: string | null, characteristics: Array<string>, aliases: Array<string> } | null };

export type GetWineriesQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetWineriesQuery = { __typename?: 'Query', wineries: Array<{ __typename?: 'Winery', id: string, name: string, region?: string | null, country?: string | null, website?: string | null, description?: string | null, email?: string | null, phone?: string | null, foundedYear?: number | null, logo?: string | null, createdAt: any, updatedAt: any, wines: Array<{ __typename?: 'Wine', id: string, quantity: number }> }> };

export type GetWineryQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetWineryQuery = { __typename?: 'Query', winery?: { __typename?: 'Winery', id: string, name: string, region?: string | null, country?: string | null, website?: string | null, description?: string | null, email?: string | null, phone?: string | null, foundedYear?: number | null, logo?: string | null, createdAt: any, updatedAt: any, wines: Array<{ __typename?: 'Wine', id: string, name: string, vintage?: number | null, type: WineType, quantity: number }> } | null };

export type GetWinesQueryVariables = Exact<{
  filter?: InputMaybe<WineFilterInput>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetWinesQuery = { __typename?: 'Query', wines: Array<{ __typename?: 'Wine', id: string, name: string, vintage?: number | null, region?: string | null, country?: string | null, type: WineType, quantity: number, bottleSize: BottleSize, purchasePrice?: any | null, currentValue?: any | null, location?: string | null, status: WineStatus, personalRating?: number | null, drinkFrom?: number | null, drinkTo?: number | null, createdAt: any, winery: { __typename?: 'Winery', id: string, name: string, region?: string | null, country?: string | null }, varietal?: { __typename?: 'Varietal', id: string, name: string } | null, photos: Array<{ __typename?: 'Photo', id: string, url: string, type: PhotoType, isPrimary: boolean }>, tags: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> }> };

export type GetWineQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetWineQuery = { __typename?: 'Query', wine?: { __typename?: 'Wine', id: string, name: string, vintage?: number | null, region?: string | null, subRegion?: string | null, country?: string | null, appellation?: string | null, type: WineType, sweetness?: Sweetness | null, quantity: number, bottleSize: BottleSize, purchaseDate?: any | null, purchasePrice?: any | null, purchaseLocation?: string | null, retailer?: string | null, location?: string | null, binNumber?: string | null, rackNumber?: string | null, cellarZone?: string | null, drinkFrom?: number | null, drinkTo?: number | null, peakDrinking?: number | null, personalRating?: number | null, criticsRating?: number | null, criticName?: string | null, personalNotes?: string | null, tastingNotes?: string | null, currentValue?: any | null, estimatedValue?: any | null, status: WineStatus, createdAt: any, updatedAt: any, winery: { __typename?: 'Winery', id: string, name: string, region?: string | null, country?: string | null, website?: string | null, description?: string | null, foundedYear?: number | null, logo?: string | null }, varietal?: { __typename?: 'Varietal', id: string, name: string, type?: WineType | null, characteristics: Array<string>, aliases: Array<string> } | null, photos: Array<{ __typename?: 'Photo', id: string, url: string, s3Key?: string | null, type: PhotoType, caption?: string | null, isPrimary: boolean, createdAt: any }>, tags: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null }> } | null };

export type GetTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTagsQuery = { __typename?: 'Query', tags: Array<{ __typename?: 'Tag', id: string, name: string, color?: string | null, wines: Array<{ __typename?: 'Wine', id: string }> }> };

export type GetCellarLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCellarLocationsQuery = { __typename?: 'Query', cellarLocations: Array<{ __typename?: 'CellarLocation', id: string, name: string, description?: string | null, capacity?: number | null, temperature?: string | null, humidity?: string | null }> };


export const DeletePhotoDocument = gql`
    mutation DeletePhoto($id: ID!) {
  deletePhoto(id: $id) {
    id
  }
}
    `;
export type DeletePhotoMutationFn = Apollo.MutationFunction<DeletePhotoMutation, DeletePhotoMutationVariables>;

/**
 * __useDeletePhotoMutation__
 *
 * To run a mutation, you first call `useDeletePhotoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeletePhotoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deletePhotoMutation, { data, loading, error }] = useDeletePhotoMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeletePhotoMutation(baseOptions?: Apollo.MutationHookOptions<DeletePhotoMutation, DeletePhotoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeletePhotoMutation, DeletePhotoMutationVariables>(DeletePhotoDocument, options);
      }
export type DeletePhotoMutationHookResult = ReturnType<typeof useDeletePhotoMutation>;
export type DeletePhotoMutationResult = Apollo.MutationResult<DeletePhotoMutation>;
export type DeletePhotoMutationOptions = Apollo.BaseMutationOptions<DeletePhotoMutation, DeletePhotoMutationVariables>;
export const SetPrimaryPhotoDocument = gql`
    mutation SetPrimaryPhoto($id: ID!) {
  setPrimaryPhoto(id: $id) {
    id
    isPrimary
  }
}
    `;
export type SetPrimaryPhotoMutationFn = Apollo.MutationFunction<SetPrimaryPhotoMutation, SetPrimaryPhotoMutationVariables>;

/**
 * __useSetPrimaryPhotoMutation__
 *
 * To run a mutation, you first call `useSetPrimaryPhotoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetPrimaryPhotoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setPrimaryPhotoMutation, { data, loading, error }] = useSetPrimaryPhotoMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSetPrimaryPhotoMutation(baseOptions?: Apollo.MutationHookOptions<SetPrimaryPhotoMutation, SetPrimaryPhotoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetPrimaryPhotoMutation, SetPrimaryPhotoMutationVariables>(SetPrimaryPhotoDocument, options);
      }
export type SetPrimaryPhotoMutationHookResult = ReturnType<typeof useSetPrimaryPhotoMutation>;
export type SetPrimaryPhotoMutationResult = Apollo.MutationResult<SetPrimaryPhotoMutation>;
export type SetPrimaryPhotoMutationOptions = Apollo.BaseMutationOptions<SetPrimaryPhotoMutation, SetPrimaryPhotoMutationVariables>;
export const UpdatePhotoDocument = gql`
    mutation UpdatePhoto($id: ID!, $caption: String, $type: PhotoType) {
  updatePhoto(id: $id, caption: $caption, type: $type) {
    id
    caption
    type
    createdAt
  }
}
    `;
export type UpdatePhotoMutationFn = Apollo.MutationFunction<UpdatePhotoMutation, UpdatePhotoMutationVariables>;

/**
 * __useUpdatePhotoMutation__
 *
 * To run a mutation, you first call `useUpdatePhotoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePhotoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePhotoMutation, { data, loading, error }] = useUpdatePhotoMutation({
 *   variables: {
 *      id: // value for 'id'
 *      caption: // value for 'caption'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useUpdatePhotoMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePhotoMutation, UpdatePhotoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePhotoMutation, UpdatePhotoMutationVariables>(UpdatePhotoDocument, options);
      }
export type UpdatePhotoMutationHookResult = ReturnType<typeof useUpdatePhotoMutation>;
export type UpdatePhotoMutationResult = Apollo.MutationResult<UpdatePhotoMutation>;
export type UpdatePhotoMutationOptions = Apollo.BaseMutationOptions<UpdatePhotoMutation, UpdatePhotoMutationVariables>;
export const CreateVarietalDocument = gql`
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
export type CreateVarietalMutationFn = Apollo.MutationFunction<CreateVarietalMutation, CreateVarietalMutationVariables>;

/**
 * __useCreateVarietalMutation__
 *
 * To run a mutation, you first call `useCreateVarietalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateVarietalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createVarietalMutation, { data, loading, error }] = useCreateVarietalMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateVarietalMutation(baseOptions?: Apollo.MutationHookOptions<CreateVarietalMutation, CreateVarietalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateVarietalMutation, CreateVarietalMutationVariables>(CreateVarietalDocument, options);
      }
export type CreateVarietalMutationHookResult = ReturnType<typeof useCreateVarietalMutation>;
export type CreateVarietalMutationResult = Apollo.MutationResult<CreateVarietalMutation>;
export type CreateVarietalMutationOptions = Apollo.BaseMutationOptions<CreateVarietalMutation, CreateVarietalMutationVariables>;
export const UpdateVarietalDocument = gql`
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
export type UpdateVarietalMutationFn = Apollo.MutationFunction<UpdateVarietalMutation, UpdateVarietalMutationVariables>;

/**
 * __useUpdateVarietalMutation__
 *
 * To run a mutation, you first call `useUpdateVarietalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVarietalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVarietalMutation, { data, loading, error }] = useUpdateVarietalMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateVarietalMutation(baseOptions?: Apollo.MutationHookOptions<UpdateVarietalMutation, UpdateVarietalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateVarietalMutation, UpdateVarietalMutationVariables>(UpdateVarietalDocument, options);
      }
export type UpdateVarietalMutationHookResult = ReturnType<typeof useUpdateVarietalMutation>;
export type UpdateVarietalMutationResult = Apollo.MutationResult<UpdateVarietalMutation>;
export type UpdateVarietalMutationOptions = Apollo.BaseMutationOptions<UpdateVarietalMutation, UpdateVarietalMutationVariables>;
export const DeleteVarietalDocument = gql`
    mutation DeleteVarietal($id: ID!) {
  deleteVarietal(id: $id)
}
    `;
export type DeleteVarietalMutationFn = Apollo.MutationFunction<DeleteVarietalMutation, DeleteVarietalMutationVariables>;

/**
 * __useDeleteVarietalMutation__
 *
 * To run a mutation, you first call `useDeleteVarietalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteVarietalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteVarietalMutation, { data, loading, error }] = useDeleteVarietalMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteVarietalMutation(baseOptions?: Apollo.MutationHookOptions<DeleteVarietalMutation, DeleteVarietalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteVarietalMutation, DeleteVarietalMutationVariables>(DeleteVarietalDocument, options);
      }
export type DeleteVarietalMutationHookResult = ReturnType<typeof useDeleteVarietalMutation>;
export type DeleteVarietalMutationResult = Apollo.MutationResult<DeleteVarietalMutation>;
export type DeleteVarietalMutationOptions = Apollo.BaseMutationOptions<DeleteVarietalMutation, DeleteVarietalMutationVariables>;
export const CreateWineryDocument = gql`
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
export type CreateWineryMutationFn = Apollo.MutationFunction<CreateWineryMutation, CreateWineryMutationVariables>;

/**
 * __useCreateWineryMutation__
 *
 * To run a mutation, you first call `useCreateWineryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWineryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWineryMutation, { data, loading, error }] = useCreateWineryMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateWineryMutation(baseOptions?: Apollo.MutationHookOptions<CreateWineryMutation, CreateWineryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWineryMutation, CreateWineryMutationVariables>(CreateWineryDocument, options);
      }
export type CreateWineryMutationHookResult = ReturnType<typeof useCreateWineryMutation>;
export type CreateWineryMutationResult = Apollo.MutationResult<CreateWineryMutation>;
export type CreateWineryMutationOptions = Apollo.BaseMutationOptions<CreateWineryMutation, CreateWineryMutationVariables>;
export const UpdateWineryDocument = gql`
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
export type UpdateWineryMutationFn = Apollo.MutationFunction<UpdateWineryMutation, UpdateWineryMutationVariables>;

/**
 * __useUpdateWineryMutation__
 *
 * To run a mutation, you first call `useUpdateWineryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWineryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWineryMutation, { data, loading, error }] = useUpdateWineryMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateWineryMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWineryMutation, UpdateWineryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWineryMutation, UpdateWineryMutationVariables>(UpdateWineryDocument, options);
      }
export type UpdateWineryMutationHookResult = ReturnType<typeof useUpdateWineryMutation>;
export type UpdateWineryMutationResult = Apollo.MutationResult<UpdateWineryMutation>;
export type UpdateWineryMutationOptions = Apollo.BaseMutationOptions<UpdateWineryMutation, UpdateWineryMutationVariables>;
export const DeleteWineryDocument = gql`
    mutation DeleteWinery($id: ID!) {
  deleteWinery(id: $id) {
    id
    name
  }
}
    `;
export type DeleteWineryMutationFn = Apollo.MutationFunction<DeleteWineryMutation, DeleteWineryMutationVariables>;

/**
 * __useDeleteWineryMutation__
 *
 * To run a mutation, you first call `useDeleteWineryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWineryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWineryMutation, { data, loading, error }] = useDeleteWineryMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteWineryMutation(baseOptions?: Apollo.MutationHookOptions<DeleteWineryMutation, DeleteWineryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteWineryMutation, DeleteWineryMutationVariables>(DeleteWineryDocument, options);
      }
export type DeleteWineryMutationHookResult = ReturnType<typeof useDeleteWineryMutation>;
export type DeleteWineryMutationResult = Apollo.MutationResult<DeleteWineryMutation>;
export type DeleteWineryMutationOptions = Apollo.BaseMutationOptions<DeleteWineryMutation, DeleteWineryMutationVariables>;
export const CreateWineDocument = gql`
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
export type CreateWineMutationFn = Apollo.MutationFunction<CreateWineMutation, CreateWineMutationVariables>;

/**
 * __useCreateWineMutation__
 *
 * To run a mutation, you first call `useCreateWineMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWineMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWineMutation, { data, loading, error }] = useCreateWineMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateWineMutation(baseOptions?: Apollo.MutationHookOptions<CreateWineMutation, CreateWineMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWineMutation, CreateWineMutationVariables>(CreateWineDocument, options);
      }
export type CreateWineMutationHookResult = ReturnType<typeof useCreateWineMutation>;
export type CreateWineMutationResult = Apollo.MutationResult<CreateWineMutation>;
export type CreateWineMutationOptions = Apollo.BaseMutationOptions<CreateWineMutation, CreateWineMutationVariables>;
export const UpdateWineDocument = gql`
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
export type UpdateWineMutationFn = Apollo.MutationFunction<UpdateWineMutation, UpdateWineMutationVariables>;

/**
 * __useUpdateWineMutation__
 *
 * To run a mutation, you first call `useUpdateWineMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWineMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWineMutation, { data, loading, error }] = useUpdateWineMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateWineMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWineMutation, UpdateWineMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWineMutation, UpdateWineMutationVariables>(UpdateWineDocument, options);
      }
export type UpdateWineMutationHookResult = ReturnType<typeof useUpdateWineMutation>;
export type UpdateWineMutationResult = Apollo.MutationResult<UpdateWineMutation>;
export type UpdateWineMutationOptions = Apollo.BaseMutationOptions<UpdateWineMutation, UpdateWineMutationVariables>;
export const DeleteWineDocument = gql`
    mutation DeleteWine($id: ID!) {
  deleteWine(id: $id) {
    id
    name
  }
}
    `;
export type DeleteWineMutationFn = Apollo.MutationFunction<DeleteWineMutation, DeleteWineMutationVariables>;

/**
 * __useDeleteWineMutation__
 *
 * To run a mutation, you first call `useDeleteWineMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWineMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWineMutation, { data, loading, error }] = useDeleteWineMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteWineMutation(baseOptions?: Apollo.MutationHookOptions<DeleteWineMutation, DeleteWineMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteWineMutation, DeleteWineMutationVariables>(DeleteWineDocument, options);
      }
export type DeleteWineMutationHookResult = ReturnType<typeof useDeleteWineMutation>;
export type DeleteWineMutationResult = Apollo.MutationResult<DeleteWineMutation>;
export type DeleteWineMutationOptions = Apollo.BaseMutationOptions<DeleteWineMutation, DeleteWineMutationVariables>;
export const UpdateWineQuantityDocument = gql`
    mutation UpdateWineQuantity($id: ID!, $quantity: Int!) {
  updateWineQuantity(id: $id, quantity: $quantity) {
    id
    quantity
  }
}
    `;
export type UpdateWineQuantityMutationFn = Apollo.MutationFunction<UpdateWineQuantityMutation, UpdateWineQuantityMutationVariables>;

/**
 * __useUpdateWineQuantityMutation__
 *
 * To run a mutation, you first call `useUpdateWineQuantityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWineQuantityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWineQuantityMutation, { data, loading, error }] = useUpdateWineQuantityMutation({
 *   variables: {
 *      id: // value for 'id'
 *      quantity: // value for 'quantity'
 *   },
 * });
 */
export function useUpdateWineQuantityMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWineQuantityMutation, UpdateWineQuantityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWineQuantityMutation, UpdateWineQuantityMutationVariables>(UpdateWineQuantityDocument, options);
      }
export type UpdateWineQuantityMutationHookResult = ReturnType<typeof useUpdateWineQuantityMutation>;
export type UpdateWineQuantityMutationResult = Apollo.MutationResult<UpdateWineQuantityMutation>;
export type UpdateWineQuantityMutationOptions = Apollo.BaseMutationOptions<UpdateWineQuantityMutation, UpdateWineQuantityMutationVariables>;
export const CreateTagDocument = gql`
    mutation CreateTag($name: String!, $color: String) {
  createTag(name: $name, color: $color) {
    id
    name
    color
  }
}
    `;
export type CreateTagMutationFn = Apollo.MutationFunction<CreateTagMutation, CreateTagMutationVariables>;

/**
 * __useCreateTagMutation__
 *
 * To run a mutation, you first call `useCreateTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTagMutation, { data, loading, error }] = useCreateTagMutation({
 *   variables: {
 *      name: // value for 'name'
 *      color: // value for 'color'
 *   },
 * });
 */
export function useCreateTagMutation(baseOptions?: Apollo.MutationHookOptions<CreateTagMutation, CreateTagMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTagMutation, CreateTagMutationVariables>(CreateTagDocument, options);
      }
export type CreateTagMutationHookResult = ReturnType<typeof useCreateTagMutation>;
export type CreateTagMutationResult = Apollo.MutationResult<CreateTagMutation>;
export type CreateTagMutationOptions = Apollo.BaseMutationOptions<CreateTagMutation, CreateTagMutationVariables>;
export const AddPhotoToWineDocument = gql`
    mutation AddPhotoToWine($wineId: ID!, $url: String!, $s3Key: String, $type: PhotoType, $isPrimary: Boolean) {
  addPhotoToWine(
    wineId: $wineId
    url: $url
    s3Key: $s3Key
    type: $type
    isPrimary: $isPrimary
  ) {
    id
    url
    type
    isPrimary
  }
}
    `;
export type AddPhotoToWineMutationFn = Apollo.MutationFunction<AddPhotoToWineMutation, AddPhotoToWineMutationVariables>;

/**
 * __useAddPhotoToWineMutation__
 *
 * To run a mutation, you first call `useAddPhotoToWineMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddPhotoToWineMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addPhotoToWineMutation, { data, loading, error }] = useAddPhotoToWineMutation({
 *   variables: {
 *      wineId: // value for 'wineId'
 *      url: // value for 'url'
 *      s3Key: // value for 's3Key'
 *      type: // value for 'type'
 *      isPrimary: // value for 'isPrimary'
 *   },
 * });
 */
export function useAddPhotoToWineMutation(baseOptions?: Apollo.MutationHookOptions<AddPhotoToWineMutation, AddPhotoToWineMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddPhotoToWineMutation, AddPhotoToWineMutationVariables>(AddPhotoToWineDocument, options);
      }
export type AddPhotoToWineMutationHookResult = ReturnType<typeof useAddPhotoToWineMutation>;
export type AddPhotoToWineMutationResult = Apollo.MutationResult<AddPhotoToWineMutation>;
export type AddPhotoToWineMutationOptions = Apollo.BaseMutationOptions<AddPhotoToWineMutation, AddPhotoToWineMutationVariables>;
export const GetWineStatsDocument = gql`
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

/**
 * __useGetWineStatsQuery__
 *
 * To run a query within a React component, call `useGetWineStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWineStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWineStatsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetWineStatsQuery(baseOptions?: Apollo.QueryHookOptions<GetWineStatsQuery, GetWineStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWineStatsQuery, GetWineStatsQueryVariables>(GetWineStatsDocument, options);
      }
export function useGetWineStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWineStatsQuery, GetWineStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWineStatsQuery, GetWineStatsQueryVariables>(GetWineStatsDocument, options);
        }
export function useGetWineStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWineStatsQuery, GetWineStatsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWineStatsQuery, GetWineStatsQueryVariables>(GetWineStatsDocument, options);
        }
export type GetWineStatsQueryHookResult = ReturnType<typeof useGetWineStatsQuery>;
export type GetWineStatsLazyQueryHookResult = ReturnType<typeof useGetWineStatsLazyQuery>;
export type GetWineStatsSuspenseQueryHookResult = ReturnType<typeof useGetWineStatsSuspenseQuery>;
export type GetWineStatsQueryResult = Apollo.QueryResult<GetWineStatsQuery, GetWineStatsQueryVariables>;
export const GetVarietalsDocument = gql`
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

/**
 * __useGetVarietalsQuery__
 *
 * To run a query within a React component, call `useGetVarietalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVarietalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVarietalsQuery({
 *   variables: {
 *      type: // value for 'type'
 *      search: // value for 'search'
 *   },
 * });
 */
export function useGetVarietalsQuery(baseOptions?: Apollo.QueryHookOptions<GetVarietalsQuery, GetVarietalsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVarietalsQuery, GetVarietalsQueryVariables>(GetVarietalsDocument, options);
      }
export function useGetVarietalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVarietalsQuery, GetVarietalsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVarietalsQuery, GetVarietalsQueryVariables>(GetVarietalsDocument, options);
        }
export function useGetVarietalsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetVarietalsQuery, GetVarietalsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetVarietalsQuery, GetVarietalsQueryVariables>(GetVarietalsDocument, options);
        }
export type GetVarietalsQueryHookResult = ReturnType<typeof useGetVarietalsQuery>;
export type GetVarietalsLazyQueryHookResult = ReturnType<typeof useGetVarietalsLazyQuery>;
export type GetVarietalsSuspenseQueryHookResult = ReturnType<typeof useGetVarietalsSuspenseQuery>;
export type GetVarietalsQueryResult = Apollo.QueryResult<GetVarietalsQuery, GetVarietalsQueryVariables>;
export const GetVarietalDocument = gql`
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

/**
 * __useGetVarietalQuery__
 *
 * To run a query within a React component, call `useGetVarietalQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVarietalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVarietalQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetVarietalQuery(baseOptions: Apollo.QueryHookOptions<GetVarietalQuery, GetVarietalQueryVariables> & ({ variables: GetVarietalQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVarietalQuery, GetVarietalQueryVariables>(GetVarietalDocument, options);
      }
export function useGetVarietalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVarietalQuery, GetVarietalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVarietalQuery, GetVarietalQueryVariables>(GetVarietalDocument, options);
        }
export function useGetVarietalSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetVarietalQuery, GetVarietalQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetVarietalQuery, GetVarietalQueryVariables>(GetVarietalDocument, options);
        }
export type GetVarietalQueryHookResult = ReturnType<typeof useGetVarietalQuery>;
export type GetVarietalLazyQueryHookResult = ReturnType<typeof useGetVarietalLazyQuery>;
export type GetVarietalSuspenseQueryHookResult = ReturnType<typeof useGetVarietalSuspenseQuery>;
export type GetVarietalQueryResult = Apollo.QueryResult<GetVarietalQuery, GetVarietalQueryVariables>;
export const GetVarietalByNameDocument = gql`
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

/**
 * __useGetVarietalByNameQuery__
 *
 * To run a query within a React component, call `useGetVarietalByNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetVarietalByNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetVarietalByNameQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useGetVarietalByNameQuery(baseOptions: Apollo.QueryHookOptions<GetVarietalByNameQuery, GetVarietalByNameQueryVariables> & ({ variables: GetVarietalByNameQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetVarietalByNameQuery, GetVarietalByNameQueryVariables>(GetVarietalByNameDocument, options);
      }
export function useGetVarietalByNameLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetVarietalByNameQuery, GetVarietalByNameQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetVarietalByNameQuery, GetVarietalByNameQueryVariables>(GetVarietalByNameDocument, options);
        }
export function useGetVarietalByNameSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetVarietalByNameQuery, GetVarietalByNameQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetVarietalByNameQuery, GetVarietalByNameQueryVariables>(GetVarietalByNameDocument, options);
        }
export type GetVarietalByNameQueryHookResult = ReturnType<typeof useGetVarietalByNameQuery>;
export type GetVarietalByNameLazyQueryHookResult = ReturnType<typeof useGetVarietalByNameLazyQuery>;
export type GetVarietalByNameSuspenseQueryHookResult = ReturnType<typeof useGetVarietalByNameSuspenseQuery>;
export type GetVarietalByNameQueryResult = Apollo.QueryResult<GetVarietalByNameQuery, GetVarietalByNameQueryVariables>;
export const GetWineriesDocument = gql`
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

/**
 * __useGetWineriesQuery__
 *
 * To run a query within a React component, call `useGetWineriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWineriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWineriesQuery({
 *   variables: {
 *      search: // value for 'search'
 *   },
 * });
 */
export function useGetWineriesQuery(baseOptions?: Apollo.QueryHookOptions<GetWineriesQuery, GetWineriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWineriesQuery, GetWineriesQueryVariables>(GetWineriesDocument, options);
      }
export function useGetWineriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWineriesQuery, GetWineriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWineriesQuery, GetWineriesQueryVariables>(GetWineriesDocument, options);
        }
export function useGetWineriesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWineriesQuery, GetWineriesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWineriesQuery, GetWineriesQueryVariables>(GetWineriesDocument, options);
        }
export type GetWineriesQueryHookResult = ReturnType<typeof useGetWineriesQuery>;
export type GetWineriesLazyQueryHookResult = ReturnType<typeof useGetWineriesLazyQuery>;
export type GetWineriesSuspenseQueryHookResult = ReturnType<typeof useGetWineriesSuspenseQuery>;
export type GetWineriesQueryResult = Apollo.QueryResult<GetWineriesQuery, GetWineriesQueryVariables>;
export const GetWineryDocument = gql`
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

/**
 * __useGetWineryQuery__
 *
 * To run a query within a React component, call `useGetWineryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWineryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWineryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetWineryQuery(baseOptions: Apollo.QueryHookOptions<GetWineryQuery, GetWineryQueryVariables> & ({ variables: GetWineryQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWineryQuery, GetWineryQueryVariables>(GetWineryDocument, options);
      }
export function useGetWineryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWineryQuery, GetWineryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWineryQuery, GetWineryQueryVariables>(GetWineryDocument, options);
        }
export function useGetWinerySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWineryQuery, GetWineryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWineryQuery, GetWineryQueryVariables>(GetWineryDocument, options);
        }
export type GetWineryQueryHookResult = ReturnType<typeof useGetWineryQuery>;
export type GetWineryLazyQueryHookResult = ReturnType<typeof useGetWineryLazyQuery>;
export type GetWinerySuspenseQueryHookResult = ReturnType<typeof useGetWinerySuspenseQuery>;
export type GetWineryQueryResult = Apollo.QueryResult<GetWineryQuery, GetWineryQueryVariables>;
export const GetWinesDocument = gql`
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

/**
 * __useGetWinesQuery__
 *
 * To run a query within a React component, call `useGetWinesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWinesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWinesQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      skip: // value for 'skip'
 *      take: // value for 'take'
 *   },
 * });
 */
export function useGetWinesQuery(baseOptions?: Apollo.QueryHookOptions<GetWinesQuery, GetWinesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWinesQuery, GetWinesQueryVariables>(GetWinesDocument, options);
      }
export function useGetWinesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWinesQuery, GetWinesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWinesQuery, GetWinesQueryVariables>(GetWinesDocument, options);
        }
export function useGetWinesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWinesQuery, GetWinesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWinesQuery, GetWinesQueryVariables>(GetWinesDocument, options);
        }
export type GetWinesQueryHookResult = ReturnType<typeof useGetWinesQuery>;
export type GetWinesLazyQueryHookResult = ReturnType<typeof useGetWinesLazyQuery>;
export type GetWinesSuspenseQueryHookResult = ReturnType<typeof useGetWinesSuspenseQuery>;
export type GetWinesQueryResult = Apollo.QueryResult<GetWinesQuery, GetWinesQueryVariables>;
export const GetWineDocument = gql`
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

/**
 * __useGetWineQuery__
 *
 * To run a query within a React component, call `useGetWineQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWineQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWineQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetWineQuery(baseOptions: Apollo.QueryHookOptions<GetWineQuery, GetWineQueryVariables> & ({ variables: GetWineQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWineQuery, GetWineQueryVariables>(GetWineDocument, options);
      }
export function useGetWineLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWineQuery, GetWineQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWineQuery, GetWineQueryVariables>(GetWineDocument, options);
        }
export function useGetWineSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetWineQuery, GetWineQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetWineQuery, GetWineQueryVariables>(GetWineDocument, options);
        }
export type GetWineQueryHookResult = ReturnType<typeof useGetWineQuery>;
export type GetWineLazyQueryHookResult = ReturnType<typeof useGetWineLazyQuery>;
export type GetWineSuspenseQueryHookResult = ReturnType<typeof useGetWineSuspenseQuery>;
export type GetWineQueryResult = Apollo.QueryResult<GetWineQuery, GetWineQueryVariables>;
export const GetTagsDocument = gql`
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

/**
 * __useGetTagsQuery__
 *
 * To run a query within a React component, call `useGetTagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTagsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTagsQuery(baseOptions?: Apollo.QueryHookOptions<GetTagsQuery, GetTagsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTagsQuery, GetTagsQueryVariables>(GetTagsDocument, options);
      }
export function useGetTagsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTagsQuery, GetTagsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTagsQuery, GetTagsQueryVariables>(GetTagsDocument, options);
        }
export function useGetTagsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTagsQuery, GetTagsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTagsQuery, GetTagsQueryVariables>(GetTagsDocument, options);
        }
export type GetTagsQueryHookResult = ReturnType<typeof useGetTagsQuery>;
export type GetTagsLazyQueryHookResult = ReturnType<typeof useGetTagsLazyQuery>;
export type GetTagsSuspenseQueryHookResult = ReturnType<typeof useGetTagsSuspenseQuery>;
export type GetTagsQueryResult = Apollo.QueryResult<GetTagsQuery, GetTagsQueryVariables>;
export const GetCellarLocationsDocument = gql`
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

/**
 * __useGetCellarLocationsQuery__
 *
 * To run a query within a React component, call `useGetCellarLocationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCellarLocationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCellarLocationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCellarLocationsQuery(baseOptions?: Apollo.QueryHookOptions<GetCellarLocationsQuery, GetCellarLocationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCellarLocationsQuery, GetCellarLocationsQueryVariables>(GetCellarLocationsDocument, options);
      }
export function useGetCellarLocationsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCellarLocationsQuery, GetCellarLocationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCellarLocationsQuery, GetCellarLocationsQueryVariables>(GetCellarLocationsDocument, options);
        }
export function useGetCellarLocationsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCellarLocationsQuery, GetCellarLocationsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCellarLocationsQuery, GetCellarLocationsQueryVariables>(GetCellarLocationsDocument, options);
        }
export type GetCellarLocationsQueryHookResult = ReturnType<typeof useGetCellarLocationsQuery>;
export type GetCellarLocationsLazyQueryHookResult = ReturnType<typeof useGetCellarLocationsLazyQuery>;
export type GetCellarLocationsSuspenseQueryHookResult = ReturnType<typeof useGetCellarLocationsSuspenseQuery>;
export type GetCellarLocationsQueryResult = Apollo.QueryResult<GetCellarLocationsQuery, GetCellarLocationsQueryVariables>;