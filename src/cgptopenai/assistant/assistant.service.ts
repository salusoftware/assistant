import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { BaseAssistant } from './base.assistant';

@Injectable()
export class FlowService {
  constructor(private readonly moduleRef: ModuleRef) {}

  // async run<TFlow extends BaseAssistant<any>>(
  //   FlowClass: Type<TFlow>,
  //   data: TFlow['data'],
  // ): Promise<void> {
  //   const instance = await this.moduleRef.resolve(FlowClass);
  //   instance.setData(data);
  //   await instance.run();
  // }
}
