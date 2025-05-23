import { Inject, Injectable } from '@nestjs/common';
import {
  BROKER_CONFIG,
  BrokerConfig,
  MessageBrokerClientProxyService,
  REDIS_CONFIG_TOKEN,
  RedisConfig, TracingLogger,
} from 'common_be';
import { SyncCommand } from '../sync.constant';
import { StudentInfoDto } from '../dtos/student-info.dto';

@Injectable()
export  class SyncProxyService extends MessageBrokerClientProxyService{
  constructor(
    @Inject(REDIS_CONFIG_TOKEN)
    protected readonly redisConfig: RedisConfig,
    @Inject(BROKER_CONFIG)
    protected readonly messageBrokerConfig: BrokerConfig,
    protected readonly  logger: TracingLogger,
  ) {
    super(redisConfig, messageBrokerConfig, logger );
    this.logger.setContext(SyncProxyService.name);
  }

  async getStudentInfo(): Promise<StudentInfoDto[]>{
    return await this.sendMessage(SyncCommand.GET_STUDENT_INFO);
  }
}