import { ErrorCode, PresentationError } from "@common/errors";
import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Patch,
  Delete,
  Query,
  Param,
  ParseIntPipe,
} from "@nestjs/common";

@Controller({
  path: "basic",
  version: "1",
})
export class BasicControllerV1 {
  @Get()
  get() {
    return { message: "Hello World!" };
  }

  @Post()
  create() {
    return { message: "Hello World!" };
  }
}
