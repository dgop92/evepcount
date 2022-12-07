/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface LectureCreateInput {
  data: {
    description?: string;
    title: string;
  };
}

export interface LectureOptions {
  fetchPeopleCountingPhotos?: boolean;
  fetchPhotos?: boolean;
}

export interface LecturePagination {
  /**
   * Limit results per request, max 500. must be used with skip
   */
  limit?: number;
  /**
   * Skips results per request. must be used with limit
   */
  skip?: number;
}

export interface LectureSearchInput {
  options?: LectureOptions;
  pagination?: LecturePagination;
  searchBy?: {
    id?: string;
    title?: string;
  };
}

export interface LectureUpdateInput {
  data: {
    description?: string;
    title?: string;
  };
  searchBy: {
    id: string;
  };
}