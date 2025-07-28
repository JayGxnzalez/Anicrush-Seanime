// TypeScript definitions for Seanime online streaming providers

/**
 * Sub or Dub preference
 */
type SubOrDub = "sub" | "dub";

/**
 * Search options for finding anime
 */
interface SearchOptions {
  query: string;
  dub?: boolean;
}

/**
 * Search result returned by the search method
 */
interface SearchResult {
  id: string;
  title: string;
  url: string;
  subOrDub: SubOrDub;
}

/**
 * Episode details with all necessary information
 */
interface EpisodeDetails {
  id: string;
  number: number;
  title: string;
  url: string;
}

/**
 * Subtitle information
 */
interface Subtitle {
  url: string;
  lang: string;
}

/**
 * Video source information
 */
interface VideoSource {
  quality: string;
  url: string;
  type: string;
  subtitles: Subtitle[];
}

/**
 * Headers for HTTP requests
 */
interface Headers {
  [key: string]: string;
}

/**
 * Episode server response containing video sources
 */
interface EpisodeServer {
  provider: string;
  server: string;
  headers: Headers;
  videoSources: VideoSource[];
}

/**
 * Provider settings configuration
 */
interface Settings {
  episodeServers: string[];
  supportsDub: boolean;
}

/**
 * Main provider interface that all online streaming providers must implement
 */
interface Provider {
  /**
   * Get provider settings including supported servers and dub support
   */
  getSettings(): Settings;

  /**
   * Search for anime with the given query
   * @param query Search options containing the search term and preferences
   * @returns Promise that resolves to an array of search results
   */
  search(query: SearchOptions): Promise<SearchResult[]>;

  /**
   * Find episodes for a given anime ID
   * @param id The anime ID from search results
   * @returns Promise that resolves to an array of episode details
   */
  findEpisodes(id: string): Promise<EpisodeDetails[]>;

  /**
   * Find episode server and video sources for a given episode
   * @param episode Episode details from findEpisodes
   * @param server Optional server name preference
   * @returns Promise that resolves to episode server with video sources
   */
  findEpisodeServer(episode: EpisodeDetails, server?: string): Promise<EpisodeServer>;
}

// Global type declarations for the provider environment
declare global {
  /**
   * Fetch function available in the provider environment
   */
  function fetch(input: string, init?: {
    method?: string;
    headers?: Headers;
    body?: string;
  }): Promise<{
    ok: boolean;
    status: number;
    statusText: string;
    json(): Promise<any>;
    text(): Promise<string>;
  }>;

  /**
   * Console object for logging (available in development/testing)
   */
  const console: {
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
  };

  /**
   * URL encoding function
   */
  function encodeURIComponent(str: string): string;

  /**
   * JSON parsing and stringification
   */
  const JSON: {
    parse(text: string): any;
    stringify(value: any, replacer?: any, space?: any): string;
  };

  /**
   * String manipulation
   */
  interface String {
    includes(searchString: string): boolean;
    split(separator: string): string[];
  }

  /**
   * Array utilities
   */
  interface Array<T> {
    isArray(obj: any): obj is any[];
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[];
    filter(callbackfn: (value: T, index: number, array: T[]) => boolean): T[];
    concat(...items: T[][]): T[];
    slice(start?: number, end?: number): T[];
    length: number;
  }

  /**
   * Object utilities
   */
  interface ObjectConstructor {
    keys(o: object): string[];
  }

  const Object: ObjectConstructor;
}

// Export types for use in provider implementations
export {
  Provider,
  SearchOptions,
  SearchResult,
  EpisodeDetails,
  VideoSource,
  EpisodeServer,
  Settings,
  SubOrDub,
  Subtitle,
  Headers
};