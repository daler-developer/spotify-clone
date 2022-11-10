import { Injectable } from '@nestjs/common';
import {
  AlreadyLikedSongException,
  CommentNotFoundException,
} from 'src/core/exceptions/comments';
import { DidNotLikeSongException } from 'src/core/exceptions/songs';
import { PrismaService } from 'src/prisma/prisma.service';
import { SongsService } from 'src/songs/songs.service';
import { CreateCommentBodyDto } from './dto/create-comment/body.dto';
import { CreateSubCommentBodyDto } from './dto/create-sub-comment/body.dto';
import { CreateSubCommentParamsDto } from './dto/create-sub-comment/params.dto';

@Injectable()
export class CommentsService {
  constructor(
    private prismaService: PrismaService,
    private songsService: SongsService,
  ) {}

  async createComment({
    creatorId,
    songId,
    text,
  }: CreateCommentBodyDto & { creatorId: number; songId: number }) {
    const song = await this.prismaService.comment.create({
      data: {
        text,
        songId,
        creatorId,
      },
      include: {
        creator: true,
      },
    });
    await this.songsService.incrementSongNumComments({ songId });

    return song;
  }

  async createSubComment({
    creatorId,
    text,
    commentId,
  }: CreateSubCommentBodyDto &
    CreateSubCommentParamsDto & { creatorId: number }) {
    const subComment = await this.prismaService.comment.create({
      data: {
        text,
        creatorId,
        commentId,
      },
      include: {
        creator: true,
      },
    });
    await this.incrementCommentNumSubComments({ commentId });

    return subComment;
  }

  async findCommentSubComments({ commentId }: { commentId: number }) {
    const comment = await this.prismaService.comment.findFirst({
      where: {
        id: commentId,
      },
      include: {
        subComments: true,
      },
    });
    await this.decrementCommentSubComments({ commentId });

    return comment.subComments;
  }

  async checkIfCommentExists({ commentId }: { commentId: number }) {
    return Boolean(
      await this.prismaService.comment.findFirst({ where: { id: commentId } }),
    );
  }

  async failIfCommentDoesNotExist({ commentId }: { commentId: number }) {
    if (!(await this.checkIfCommentExists({ commentId }))) {
      throw new CommentNotFoundException();
    }
  }

  async failIfUserDoesNotLikeComment({
    commentId,
    userId,
  }: {
    commentId: number;
    userId: number;
  }) {
    if (!(await this.checkIfUserLikesComment({ commentId, userId }))) {
      throw new DidNotLikeSongException();
    }
  }

  async failIfUserLikesComment({
    commentId,
    userId,
  }: {
    userId: number;
    commentId: number;
  }) {
    if (await this.checkIfUserLikesComment({ commentId, userId })) {
      throw new AlreadyLikedSongException();
    }
  }

  async checkIfUserLikesComment({
    userId,
    commentId,
  }: {
    userId: number;
    commentId: number;
  }) {
    return Boolean(
      await this.prismaService.comment.findFirst({
        where: {
          id: commentId,
          likers: {
            some: {
              id: userId,
            },
          },
        },
        include: {
          creator: true,
        },
      }),
    );
  }

  async findCommentById(id: number) {
    const comment = await this.prismaService.comment.findFirst({
      where: {
        id,
      },
      include: {
        creator: true,
      },
    });

    return comment;
  }

  async likeComment({
    likerId,
    commentId,
  }: {
    likerId: number;
    commentId: number;
  }) {
    await this.prismaService.comment.update({
      where: {
        id: commentId,
      },
      data: {
        likers: {
          connect: {
            id: likerId,
          },
        },
      },
      include: {
        creator: true,
      },
    });
    await this.incrementCommentNumLikes({ commentId });

    return await this.findCommentById(commentId);
  }

  async unlikeComment({
    likerId,
    commentId,
  }: {
    likerId: number;
    commentId: number;
  }) {
    await this.prismaService.comment.update({
      where: {
        id: commentId,
      },
      data: {
        likers: {
          disconnect: {
            id: likerId,
          },
        },
      },
    });
    await this.decrementCommentNumLikes({ commentId });

    return await this.findCommentById(commentId);
  }

  private async incrementCommentNumLikes({ commentId }: { commentId: number }) {
    await this.prismaService.comment.update({
      where: {
        id: commentId,
      },
      data: {
        numLikes: {
          increment: 1,
        },
      },
    });
  }

  private async decrementCommentNumLikes({ commentId }: { commentId: number }) {
    await this.prismaService.comment.update({
      where: {
        id: commentId,
      },
      data: {
        numLikes: {
          increment: -1,
        },
      },
    });
  }

  private async incrementCommentNumSubComments({
    commentId,
  }: {
    commentId: number;
  }) {
    await this.prismaService.comment.update({
      where: {
        id: commentId,
      },
      data: {
        numSubComments: {
          increment: 1,
        },
      },
    });
  }

  private async decrementCommentSubComments({
    commentId,
  }: {
    commentId: number;
  }) {
    await this.prismaService.comment.update({
      where: {
        id: commentId,
      },
      data: {
        numSubComments: {
          increment: -1,
        },
      },
    });
  }
}
