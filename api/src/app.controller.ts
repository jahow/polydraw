import {
  Body,
  Controller,
  Get,
  Header,
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
  ActorPositionUpdate,
  ActorInfoUpdate,
} from './app.service';
import { interval, map, merge, Observable, startWith } from 'rxjs';
import { ActorId, ActorInfo, ActorPosition, FeatureInfo } from './model';
import { Request } from 'express';

interface SessionStart {
  type: 'sessionStart';
  data: {
    me: ActorInfo;
    others: ActorsInfo;
    features: FeaturesList;
  };
}
interface ActorsUpdate {
  type: 'actorsUpdate';
  data: {
    positions?: ActorPositionUpdate;
    infos?: ActorInfoUpdate;
  };
}
interface FeaturesUpdate {
  type: 'featuresUpdate';
  data: {
    features?: FeaturesList;
  };
}
interface ActorSpeak {
  type: 'actorSpeak';
  data: {
    actor: ActorInfo;
    message: string;
  };
}

export type MessageEvent =
  | SessionStart
  | ActorsUpdate
  | FeaturesUpdate
  | ActorSpeak;

interface ActorUpdateDto {
  id: ActorId;
  position: ActorPosition;
}

interface ActorSpeakDto {
  id: ActorId;
  message: string;
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
        .getActorsPositionUpdates(actor.id)
        .pipe(
          map(
            (positions) =>
              ({ type: 'actorsUpdate', data: { positions } } as ActorsUpdate),
          ),
        ),
      this.appService.getActorsInfoUpdates(actor.id).pipe(
        map(
          (infos) =>
            ({
              type: 'actorsUpdate',
              data: { infos },
            } as ActorsUpdate),
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
      this.appService.getActorSpeaks().pipe(
        map(
          (speak) =>
            ({
              type: 'actorSpeak',
              data: speak,
            } as ActorSpeak),
        ),
      ),
    ).pipe(
      startWith({
        type: 'sessionStart',
        data: {
          me: actor,
          others: this.appService.getOtherActorsInfo(actor.id),
          features: this.appService.getAllFeatures(),
        },
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

  @Post('/speak')
  @HttpCode(200)
  speak(@Body() { id, message }: ActorSpeakDto): void {
    this.appService.actorSpeak(id, message);
  }

  @Get('/data.json')
  @HttpCode(200)
  @Header('Content-Type', 'application/geo+json')
  getFeatureCollection() {
    return this.appService.getFeatureCollection();
  }
}
