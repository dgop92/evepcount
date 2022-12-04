import { PeopleCountingMessage } from "../entities/people-counting-message";

export interface IPeopleCountingPublisher {
  publish(input: PeopleCountingMessage): Promise<void>;
}
