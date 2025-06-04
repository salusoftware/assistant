import { Reflector } from '@nestjs/core';
import { TOOL_NAME_METADATA } from '../../decorators/assistant-decorators';
type Constructor<T = unknown> = new (...args: unknown[]) => T;
export type ClassOrInstance<T = any> = T | (new (...args: any[]) => T);

export class AssistantProcessDecoratorService {
  static findMethodByToolName(instanceOrClass: any, toolName: string) {
    const reflector = new Reflector();

    const isClass = typeof instanceOrClass === 'function';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const target = isClass
      ? instanceOrClass
      : Object.getPrototypeOf(instanceOrClass);

    const methodName = Object.getOwnPropertyNames(target)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .filter((name) => typeof target[name] === 'function')
      .find((name) => {
        const meta = reflector.get<string>(
          TOOL_NAME_METADATA,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          target[name],
        );
        return meta === toolName;
      });

    if (!methodName) {
      throw new Error(`Tool with name "${toolName}" not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const method = target[methodName];

    // Se for classe (static), não precisa bind
    // Se for instância (não static), faz bind no instance
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    return isClass ? method : method.bind(instanceOrClass);
  }

  static exploreMethodsByMetadata<T extends object>(
    instanceOrClass: ClassOrInstance<T>,
    metadataKey: string,
  ): Array<{
    eventOrToolName: string;
    method: (...args: unknown[]) => unknown;
  }> {
    const reflector = new Reflector();

    const isClass = typeof instanceOrClass === 'function';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const target: T = isClass
      ? (instanceOrClass as Constructor<T>).prototype
      : Object.getPrototypeOf(instanceOrClass);

    return (Object.getOwnPropertyNames(target) as Array<keyof T>)
      .filter((name) => typeof target[name] === 'function')
      .map((name) => {
        const method = target[name];
        if (typeof method !== 'function') return null;

        const meta = reflector.get<string>(metadataKey, method);
        if (!meta) return null;

        return {
          eventOrToolName: meta,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          method: isClass
            ? method.bind(undefined)
            : method.bind(instanceOrClass),
        };
      })
      .filter(
        (
          item,
        ): item is {
          eventOrToolName: string;
          method: (...args: unknown[]) => unknown;
        } => !!item,
      );
  }
}
