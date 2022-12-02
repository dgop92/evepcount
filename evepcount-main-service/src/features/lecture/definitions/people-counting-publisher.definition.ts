import { PeopleCountingMessage } from "../entities/people-counting-message";

export const PEOPLE_COUNTING_EXCHANGE = "pcount-exchange";

export interface IPeopleCountingPublisher {
  publish(input: PeopleCountingMessage): Promise<void>;
}
