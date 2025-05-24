export class ChallengeDto {
  description: string;

  conditionKey: string;

  conditionValue: number;

  unit?: string;

  timeFrame?: string;

  conditionKeywords?: string[];
  rewardAmount?: number;
}
