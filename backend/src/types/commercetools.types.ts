/**
 * CommerceTools specific type definitions
 */

export interface CommerceToolsConfig {
  projectKey: string;
  clientId: string;
  clientSecret: string;
  apiUrl: string;
  authUrl: string;
  scopes: string[];
}

export interface CommerceToolsReview {
  id: string;
  version: number;
  key?: string;
  uniquenessValue?: string;
  locale?: string;
  authorName?: string;
  title?: string;
  text?: string;
  target?: {
    typeId: 'product';
    id: string;
  };
  rating?: number;
  state?: {
    typeId: 'state';
    id: string;
  };
  includedInStatistics?: boolean;
  createdAt: string;
  lastModifiedAt: string;
}

export interface CommerceToolsReviewDraft {
  key?: string;
  uniquenessValue?: string;
  authorName?: string;
  title?: string;
  text?: string;
  target: {
    typeId: 'product';
    id: string;
  };
  rating?: number;
  locale?: string;
}
