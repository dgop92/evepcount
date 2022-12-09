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
      peopleCountingItems: [],
      photos: [],
    });
    myLogger.debug("lecture created", { id: result.insertedId.toHexString() });
    return {
      id: result.insertedId.toHexString(),
      title: input.title,
      description,
    };
  }

  async update(
    lecture: Lecture,
    input: LectureUpdateRepoData
  ): Promise<Lecture> {
    myLogger.debug("updating lecture", {
      id: lecture.id,
      ...input,
    });
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
    myLogger.debug("lecture updated", { id: lecture.id });
    return {
      id: lecture.id,
      title: input.title ?? lecture.title,
      description: input.description ?? lecture.description,
    };
  }

  async delete(lecture: Lecture): Promise<void> {
    myLogger.debug("deleting lecture", { id: lecture.id });
    await this.collection.deleteOne({ _id: new ObjectId(lecture.id) });
    myLogger.debug("lecture deleted", { id: lecture.id });
  }

  async getOneBy(input: LectureSearchInput): Promise<Lecture | undefined> {
    myLogger.debug("getting one lecture by", { input });
    const query = this.getQuery(input.searchBy);
    const projection = this.getProjection(input.options);

    const result = await this.collection.findOne(query, {
      projection: projection,
    });

    if (result === null) {
      myLogger.debug("lecture not found");
      return undefined;
    }

    const { _id, ...rest } = result ?? {};
    myLogger.debug("lecture found", { id: _id.toHexString() });
    return {
      id: _id.toHexString(),
      ...rest,
    };
  }

  async getManyBy(
    input: LectureSearchInput
  ): Promise<SLPaginationResult<Lecture>> {
    myLogger.debug("getting many lectures by", { input });
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
    const query: { [key: string]: any } = {};

    if (searchBy?.id) {
      query["_id"] = new ObjectId(searchBy.id);
    }

    if (searchBy?.title) {
      query["title"] = { $regex: new RegExp("^" + searchBy.title, "i") };
    }

    return query;
  }

  private getProjection(options: LectureSearchInput["options"]) {
    const projection = getMongoProjection({
      photos: options?.fetchPhotos,
      peopleCountingItems: options?.fetchPeopleCountingItems,
    });
    return projection;
  }
}
