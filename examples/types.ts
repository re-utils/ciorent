export interface Example {
  /**
   * Heading of the example
   */
  heading?: string;

  /**
   * Description of the example
   */
  desc?: string;
}

export interface Config {
  /**
   * Heading for all the examples in a directory
   */
  heading: string;

  /**
   * Description for all the examples
   */
  desc?: string;

  /**
   * List of examples to register in order
   */
  examples: Record<string, Example>;

  /**
   * Content priority
   */
  priority?: number;
}

export default (c: Config): Config => c;
