import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/core/decorators/user.decorator';
import { JoiValidationPipe } from 'src/core/pipes/joi-validation.pipe';
import { CommentsService } from './comments.service';
import { CreateCommentBodyDto } from './dto/create-comment/body.dto';
import createCommentBodySchema from './schemas/create-comment/body.schema';
import createCommentParamsSchema from './schemas/create-comment/params.schema';
import likeCommentParamsSchema from './schemas/like-comment/params.schema';
import unlikeCommentParamsSchema from './schemas/unlike-comment/params.schema';
import findCommentSubCommentsSchema from './schemas/find-comment-sub-comments/params.schema';
import createSubCommentsParamsSchema from './schemas/create-sub-comment/params.schema';
import createSubCommentBodySchema from './schemas/create-sub-comment/body.schema';
import { User as UserEntity } from '@prisma/client';
import { CreateCommentParamsDto } from './dto/create-comment/params.dto';
import { LikeCommentParamsDto } from './dto/like-comment/params.dto';
import { UnlikeCommentParamsDto } from './dto/unlike-comment/params.dto';
import { FindCommentsSubCommentsParams } from './dto/find-comment-sub-comments/params.dto';
import { CreateSubCommentParamsDto } from './dto/create-sub-comment/params.dto';
import { CreateSubCommentBodyDto } from './dto/create-sub-comment/body.dto';
import { SongsService } from 'src/songs/songs.service';

@Controller('/api')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
  ) {}

  @Get('/comments/:commentId/comments')
  async findCommentSubComments(
    @Param(new JoiValidationPipe(findCommentSubCommentsSchema))
    params: FindCommentsSubCommentsParams,
  ) {
    const subComments = await this.commentsService.findCommentSubComments({
      commentId: params.commentId,
    });

    return subComments;
  }

  @Post('/comments/:commentId/comments')
  @UseGuards(JwtAuthGuard)
  async createSubComment(
    @Param(new JoiValidationPipe(createSubCommentsParamsSchema))
    params: CreateSubCommentParamsDto,
    @Body(new JoiValidationPipe(createSubCommentBodySchema))
    body: CreateSubCommentBodyDto,
    @User() user: UserEntity,
  ) {
    const comment = await this.commentsService.createSubComment({
      ...body,
      ...params,
      creatorId: user.id,
    });

    return { comment };
  }

  @Post('/songs/:songId/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Body(new JoiValidationPipe(createCommentBodySchema))
    body: CreateCommentBodyDto,
    @User() user: UserEntity,
    @Param(new JoiValidationPipe(createCommentParamsSchema))
    params: CreateCommentParamsDto,
  ) {
    const song = await this.commentsService.createComment({
      ...body,
      creatorId: user.id,
      songId: params.songId,
    });

    return { song };
  }

  @Patch('/comments/:commentId/like')
  @UseGuards(JwtAuthGuard)
  async likeComment(
    @Param(new JoiValidationPipe(likeCommentParamsSchema))
    params: LikeCommentParamsDto,
    @User() user: UserEntity,
  ) {
    await this.commentsService.failIfUserLikesComment({
      commentId: params.commentId,
      userId: user.id,
    });
    const comment = await this.commentsService.likeComment({
      likerId: user.id,
      commentId: params.commentId,
    });

    return { comment };
  }

  @Patch('/comments/:commentId/unlike')
  @UseGuards(JwtAuthGuard)
  async unlikeComment(
    @Param(new JoiValidationPipe(unlikeCommentParamsSchema))
    params: UnlikeCommentParamsDto,
    @User() user: UserEntity,
  ) {
    await this.commentsService.failIfUserDoesNotLikeComment({
      commentId: params.commentId,
      userId: user.id,
    });
    const comment = await this.commentsService.unlikeComment({
      likerId: user.id,
      commentId: params.commentId,
    });

    return { comment };
  }
}
