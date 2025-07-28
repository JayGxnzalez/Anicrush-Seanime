/// <reference path="./online-streaming-provider.d.ts" />

class Provider {
  private api = "https://api.anicrush.to";
  private base = "https://anicrush.to";
  private availableServers = [4, 1, 3, 5, 6]; // Try multiple servers in order of preference

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
        id: `${m.id}/${lang}`, // Use alphanumeric ID (correct format)
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
      // Handle both ID formats: "movieId/lang" and just "movieId"
      const idParts = id.split("/");
      const movieId = idParts[0];
      const langPart = idParts[1];
      const lang: "dub" | "sub" = (langPart === "dub" || langPart === "sub") ? (langPart as any) : "sub";

      // Validate movieId
      if (!movieId || movieId.trim().length === 0) {
        console.error("[findEpisodes] Invalid movieId:", movieId);
        return [];
      }

      // Check if we received a numeric ID (which indicates an issue with Seanime)
      if (/^\d+$/.test(movieId)) {
        console.error("[findEpisodes] Received numeric ID which is not supported by AniCrush API:", movieId);
        console.error("[findEpisodes] Please ensure search results are using the correct alphanumeric movie IDs from AniCrush");
        return [];
      }

      const url = `${this.api}/shared/v2/episode/list?_movieId=${movieId}`;
      const data = await this._fetchJSON(url);

      // Check if API returned an error
      if (!data?.status) {
        console.error("[findEpisodes] API error for", movieId, ":", data?.message || "Unknown error");
        return [];
      }

      // Handle new grouped episode structure
      let episodesArr: any[] = [];
      
      if (data?.result) {
        // Episodes are now grouped by ranges like "001 - 100", "101 - 200", etc.
        const result = data.result;
        for (const key of Object.keys(result)) {
          if (Array.isArray(result[key])) {
            episodesArr = episodesArr.concat(result[key]);
          }
        }
      }

      if (!Array.isArray(episodesArr) || episodesArr.length === 0) {
        console.error("[findEpisodes] no episodes found for", movieId, "raw:", JSON.stringify(data, null, 2));
        return [];
      }

      return episodesArr.map((ep: any) => ({
        id: `${movieId}/${lang}/${(ep.number ?? ep.episode ?? ep.id ?? 0)}`,
        number: ep.number ?? ep.episode ?? ep.id ?? 0,
        title: ep.name_english || ep.title || ep.name || `Episode ${ep.number ?? ep.episode ?? ep.id ?? 0}`,
        url: `${movieId}/${lang}/${ep.number ?? ep.episode ?? ep.id ?? 0}`, // Store episode info for server fallback
      }));
    } catch (e: any) {
      console.error("[findEpisodes] error:", e?.message ?? e);
      return [];
    }
  }

  async findEpisodeServer(episode: EpisodeDetails, _server: string = "AniCrush Server"): Promise<EpisodeServer> {
    try {
      // Parse episode URL to extract movieId, lang, and episode number
      const urlParts = episode.url.split("/");
      if (urlParts.length < 3) {
        throw new Error("Invalid episode URL format");
      }
      
      const movieId = urlParts[0];
      const lang = urlParts[1];
      const episodeNum = urlParts[2];

      console.log(`[findEpisodeServer] Trying to find server for ${movieId} episode ${episodeNum} (${lang})`);

      // Try multiple servers until we find one that works
      for (const serverId of this.availableServers) {
        try {
          const serverUrl = `${this.api}/shared/v2/episode/sources?_movieId=${movieId}&ep=${episodeNum}&sv=${serverId}&sc=${lang}`;
          console.log(`[findEpisodeServer] Trying server ${serverId}: ${serverUrl}`);
          
          const data = await this._fetchJSON(serverUrl);

          if (!data?.status || !data?.result) {
            console.log(`[findEpisodeServer] Server ${serverId} returned no valid result`);
            continue;
          }

          const result = data.result;

          // Skip servers that return error type
          if (result.type === "error") {
            console.log(`[findEpisodeServer] Server ${serverId} returned error type`);
            continue;
          }

          // Handle iframe type response (MegaCloud, etc.)
          if (result.type === "iframe" && result.link) {
            console.log(`[findEpisodeServer] Server ${serverId} returned iframe: ${result.link}`);
            
            return {
              provider: "anicrush",
              server: `${_server} (Server ${serverId})`,
              headers: {
                "Accept": "application/json, text/plain, */*",
                "Origin": this.base,
                "Referer": `${this.base}/`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "x-site": "anicrush",
              },
              videoSources: [{
                quality: "auto",
                url: result.link,
                type: "iframe", // Changed back to iframe
                subtitles: [],
              }],
            };
          }

          // Handle direct sources (legacy support)
          const sources = result?.sources ?? [];
          const tracks = result?.tracks ?? [];

          if (Array.isArray(sources) && sources.length > 0) {
            console.log(`[findEpisodeServer] Server ${serverId} returned ${sources.length} direct sources`);
            
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
              server: `${_server} (Server ${serverId})`,
              headers: {
                "Accept": "application/json, text/plain, */*",
                "Origin": this.base,
                "Referer": `${this.base}/`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "x-site": "anicrush",
              },
              videoSources,
            };
          }

          console.log(`[findEpisodeServer] Server ${serverId} had no usable sources`);
        } catch (serverError: any) {
          console.log(`[findEpisodeServer] Server ${serverId} failed:`, serverError?.message ?? serverError);
          continue; // Try next server
        }
      }

      // If all servers failed
      throw new Error(`No working servers found for episode ${episodeNum}`);
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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "x-site": "anicrush",
      },
    });
    return await res.json();
  }
}
