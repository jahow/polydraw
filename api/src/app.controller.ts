import { Body, Controller, Get, HttpCode, Post, Sse } from '@nestjs/common';
import { AppService, PositionsUpdate, SessionsUpdate } from './app.service';
import { interval, map, merge, Observable, of, startWith } from 'rxjs';
import { ActorId, ActorInfo, ActorPosition } from './model';

interface SessionStart {
  type: 'sessionStart';
  data: {
    me: ActorInfo;
    others: ActorInfo[];
  };
}
interface SessionUpdate {
  type: 'sessionUpdate';
  data: {
    positions?: PositionsUpdate;
    sessions?: SessionsUpdate;
  };
}

export type MessageEvent = SessionStart | SessionUpdate;

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
  drawSession(): Observable<MessageEvent> {
    const actor = this.appService.newSession();
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
}
