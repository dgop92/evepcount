import { AppLogger } from "@common/logging/logger";
import { SLPaginationResult } from "@common/types/common-types";
import { Lecture } from "@features/lecture/entities/lecture";
import {
  LectureCreateRepoData,
  LectureUpdateRepoData,
  ILectureRepository,
} from "@features/lecture/definitions/lecture.repository.definition";
import { LectureSearchInput } from "@features/lecture/schema-types";
import { LectureDocument } from "../models/lecture.document";
import { Collection, ObjectId } from "mongodb";
import { ErrorCode, RepositoryError } from "@common/errors";
import { getMongoProjection } from "@common/mongo/utils";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class LectureRepository implements ILectureRepository {
  constructor(private readonly collection: Collection<LectureDocument>) {}

  async create(input: LectureCreateRepoData): Promise<Lecture> {
    myLogger.debug("creating lecture", {
      name: input.title,
    });
    const description = input.description || "";
    const result = await this.collection.insertOne({
      title: input.title,
      description,
    });
    return {
      id: result.insertedId.toHexString(),
      title: input.title,
      description,
      peopleCountingPhotos: [],
      photos: [],
    };
  }

  async update(
    lecture: Lecture,
    input: LectureUpdateRepoData
  ): Promise<Lecture> {
    const updateDoc: { $set: LectureUpdateRepoData } = { $set: {} };
    if (input.title) {
      updateDoc["$set"]["title"] = input.title;
    }
    if (input.description) {
      updateDoc["$set"]["description"] = input.description;
    }
    await this.collection.updateOne(
      { _id: new ObjectId(lecture.id) },
      updateDoc
    );
    return {
      id: lecture.id,
      title: input.title ?? lecture.title,
      description: input.description ?? lecture.description,
    };
  }

  async delete(lecture: Lecture): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(lecture.id) });
  }

  async getOneBy(input: LectureSearchInput): Promise<Lecture | undefined> {
    const query = this.getQuery(input.searchBy);
    const projection = this.getProjection(input.options);

    const result = await this.collection.findOne(query, {
      projection: projection,
    });

    if (result === null) {
      return undefined;
    }

    const { _id, ...rest } = result ?? {};
    return {
      id: _id.toHexString(),
      ...rest,
    };
  }

  async getManyBy(
    input: LectureSearchInput
  ): Promise<SLPaginationResult<Lecture>> {
    const query = this.getQuery(input.searchBy);
    const projection = this.getProjection(input.options);

    const cursor = this.collection.find(query, {
      projection: projection,
      skip: input.pagination?.skip,
      limit: input.pagination?.limit,
    });

    const documents = await cursor.toArray();
    const totalCount = documents.length;
    const lectures = documents.map((document) => {
      const { _id, ...rest } = document;
      return {
        id: _id.toHexString(),
        ...rest,
      };
    });

    return {
      count: totalCount,
      results: lectures,
    };
  }

  private getQuery(searchBy: LectureSearchInput["searchBy"]) {
    if (searchBy === undefined) {
      throw new RepositoryError(
        "searchBy is required",
        ErrorCode.INVALID_OPERATION
      );
    }

    const query: { [key: string]: any } = {};

    if (searchBy.id) {
      query["_id"] = new ObjectId(searchBy.id);
    }

    if (searchBy.title) {
      query["title"] = searchBy.title;
    }

    return query;
  }

  private getProjection(options: LectureSearchInput["options"]) {
    const projection = getMongoProjection({
      photos: options?.fetchPhotos,
      peopleCountingPhotos: options?.fetchPeopleCountingPhotos,
    });
    return projection;
  }
}
