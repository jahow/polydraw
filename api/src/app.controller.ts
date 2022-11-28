import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Req,
  Sse,
} from '@nestjs/common';
import {
  ActorsInfo,
  AppService,
  FeaturesList,
  PositionsUpdate,
  SessionsUpdate,
} from './app.service';
import { interval, map, merge, Observable, startWith } from 'rxjs';
import { ActorId, ActorInfo, ActorPosition, FeatureInfo } from './model';
import { Request } from 'express';

interface SessionStart {
  type: 'sessionStart';
  data: {
    me: ActorInfo;
    others: ActorsInfo;
  };
}
interface SessionUpdate {
  type: 'sessionUpdate';
  data: {
    positions?: PositionsUpdate;
    sessions?: SessionsUpdate;
  };
}
interface FeaturesUpdate {
  type: 'featuresUpdate';
  data: {
    features?: FeaturesList;
  };
}

export type MessageEvent = SessionStart | SessionUpdate | FeaturesUpdate;

interface ActorUpdateDto {
  id: ActorId;
  position: ActorPosition;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Sse('/draw')
  drawSession(@Req() req: Request): Observable<MessageEvent> {
    const actor = this.appService.newSession();
    req.on('close', () => this.appService.closeSession(actor.id));
    return merge(
      this.appService
        .getPositionsUpdates(actor.id)
        .pipe(
          map(
            (positions) =>
              ({ type: 'sessionUpdate', data: { positions } } as SessionUpdate),
          ),
        ),
      this.appService
        .getSessionsUpdates(actor.id)
        .pipe(
          map(
            (sessions) =>
              ({ type: 'sessionUpdate', data: { sessions } } as SessionUpdate),
          ),
        ),
      this.appService.getFeaturesUpdates().pipe(
        map(
          (features) =>
            ({
              type: 'featuresUpdate',
              data: { features },
            } as FeaturesUpdate),
        ),
      ),
    ).pipe(
      startWith({
        type: 'sessionStart',
        data: { me: actor, others: this.appService.getOtherSessions(actor.id) },
      } as SessionStart),
    );
  }

  @Sse('/test')
  test(): Observable<unknown> {
    return interval(1000).pipe(map(() => ({ data: { hello: 'world' } })));
  }

  @Post('/move')
  @HttpCode(200)
  move(@Body() { id, position }: ActorUpdateDto): void {
    this.appService.updatePosition(id, position);
  }

  @Put('/feature')
  @HttpCode(200)
  addFeature(@Body() feature: FeatureInfo): void {
    this.appService.addFeature(feature);
  }

  @Get('/data.json')
  @HttpCode(200)
  getFeatureCollection() {
    return this.appService.getFeatureCollection();
  }
}
