\
/// <reference path="./online-streaming-provider.d.ts" />

class Provider {
  private api = "https://api.anicrush.to";
  private base = "https://anicrush.to";
  private defaultServer = 4;

  getSettings(): Settings {
    return {
      episodeServers: ["AniCrush Server"],
      supportsDub: true,
    };
  }

  async search(query: SearchOptions): Promise<SearchResult[]> {
    try {
      const q = encodeURIComponent(query.query);
      const url = `${this.api}/shared/v2/movie/list?keyword=${q}&limit=24&page=1`;

      const data = await this._fetchJSON(url);
      const movies = data?.result?.movies ?? data?.result ?? data?.movies ?? [];

      if (!Array.isArray(movies) || movies.length === 0) return [];

      const lang: SubOrDub = query.dub ? "dub" : "sub";

      return movies.map((m: any) => ({
        id: `${m.id}/${lang}`,
        title: m.name_english || m.name,
        url: `${this.base}/watch/${m.slug}.${m.id}`,
        subOrDub: lang,
      }));
    } catch (e: any) {
      console.error("[search] error:", e?.message ?? e);
      return [];
    }
  }

  async findEpisodes(id: string): Promise<EpisodeDetails[]> {
    try {
      const [movieId, langPart] = id.split("/");
      const lang: "dub" | "sub" = (langPart === "dub" || langPart === "sub") ? (langPart as any) : "sub";

      const url = `${this.api}/shared/v2/episode/list?_movieId=${movieId}`;
      const data = await this._fetchJSON(url);

      const episodesArr =
        data?.result?.episodes ??
        data?.result?.data ??
        data?.result ??
        data?.episodes ??
        [];

      if (!Array.isArray(episodesArr) || episodesArr.length === 0) {
        console.error("[findEpisodes] no episodes found for", movieId, "raw:", JSON.stringify(data, null, 2));
        return [];
      }

      return episodesArr.map((ep: any) => ({
        id: `${movieId}/${lang}/${(ep.number ?? ep.episode ?? ep.id ?? 0)}`,
        number: ep.number ?? ep.episode ?? ep.id ?? 0,
        title: ep.title ? String(ep.title) : `Episode ${ep.number ?? ep.episode ?? ep.id ?? 0}`,
        url: `${this.api}/shared/v2/episode/sources?_movieId=${movieId}&ep=${ep.number ?? ep.episode ?? ep.id ?? 0}&sv=${this.defaultServer}&sc=${lang}`,
      }));
    } catch (e: any) {
      console.error("[findEpisodes] error:", e?.message ?? e);
      return [];
    }
  }

  async findEpisodeServer(episode: EpisodeDetails, _server: string = "AniCrush Server"): Promise<EpisodeServer> {
    try {
      const data = await this._fetchJSON(episode.url);

      const root = data?.result ?? data?.data ?? data;
      const sources = root?.sources ?? root?.data?.sources ?? [];
      const tracks = root?.tracks ?? root?.data?.tracks ?? [];

      if (!Array.isArray(sources) || sources.length === 0) {
        throw new Error("No video sources in response");
      }

      const videoSources: VideoSource[] = sources
        .map((s: any) => ({
          quality: s.label || s.quality || "auto",
          url: s.file || s.url,
          type: s.type || (String(s.file || s.url).includes(".m3u8") ? "m3u8" : "mp4"),
          subtitles: [],
        }))
        .filter((v: any) => !!v.url);

      // Try attach English subs
      const eng = Array.isArray(tracks)
        ? tracks.find((t: any) => (t.kind === "captions" || t.kind === "subtitles") && /english/i.test(t.label || ""))
        : null;
      if (eng?.file) {
        for (const vs of videoSources) {
          vs.subtitles = [{ url: eng.file, lang: eng.label || "English" }];
        }
      }

      return {
        provider: "anicrush",
        server: _server,
        headers: {
          "Accept": "application/json, text/plain, */*",
          "Origin": this.base,
          "Referer": `${this.base}/`,
          "User-Agent": "Mozilla/5.0",
          "x-site": "anicrush",
        },
        videoSources,
      };
    } catch (e: any) {
      console.error("[findEpisodeServer] error:", e?.message ?? e);
      return {
        provider: "anicrush",
        server: _server,
        headers: {},
        videoSources: [],
      };
    }
  }

  private async _fetchJSON(url: string): Promise<any> {
    const res = await fetch(url, {
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Origin": this.base,
        "Referer": `${this.base}/`,
        "User-Agent": "Mozilla/5.0",
        "x-site": "anicrush",
      },
    });
    return await res.json();
  }
}
