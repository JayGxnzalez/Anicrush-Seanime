/// <reference path="./online-streaming-provider.d.ts" />

class Provider {
  private api = "https://api.anicrush.to";
  private base = "https://anicrush.to";
  private availableServers = [4, 1, 3, 5, 6]; // Try multiple servers in order of preference
  
  // Simplified headers like GojoWtf
  private headers = {
    "Referer": "https://anicrush.to/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  };

  getSettings(): Settings {
    return {
      episodeServers: ["AniCrush Server"],
      supportsDub: true,
    };
  }

  async search(query: SearchOptions): Promise<SearchResult[]> {
    try {
      const originalQuery = query.query;
      const searchTerms = [];
      
      // Always try lowercase first (AniCrush seems to prefer lowercase)
      searchTerms.push(originalQuery.toLowerCase());
      
      // Try original case if different from lowercase
      if (originalQuery !== originalQuery.toLowerCase()) {
        searchTerms.push(originalQuery);
      }
      
      // Add variations for common title patterns
      const lowerQuery = originalQuery.toLowerCase();
      
      // Remove common suffixes that might not be in AniCrush
      const suffixesToRemove = [
        " the animation",
        " (tv)",
        " season 1", " season 2", " season 3", " season 4", " season 5",
        " s1", " s2", " s3", " s4", " s5",
        " part 1", " part 2", " part 3",
        " cour 1", " cour 2"
      ];
      
      for (const suffix of suffixesToRemove) {
        if (lowerQuery.includes(suffix)) {
          const withoutSuffix = lowerQuery.replace(suffix, "").trim();
          if (withoutSuffix && !searchTerms.includes(withoutSuffix)) {
            searchTerms.push(withoutSuffix);
          }
        }
      }
      
      // Try romanized versions (replace common patterns)
      const romanizedQuery = lowerQuery
        .replace(/ō/g, "ou")
        .replace(/ū/g, "uu")
        .replace(/ā/g, "aa")
        .replace(/ē/g, "ee")
        .replace(/ī/g, "ii");
      
      if (romanizedQuery !== lowerQuery && !searchTerms.includes(romanizedQuery)) {
        searchTerms.push(romanizedQuery);
      }
      
      // Try each search term until we find results
      for (const searchTerm of searchTerms) {
        try {
          console.log(`[search] Trying search term: "${searchTerm}"`);
          
          const q = encodeURIComponent(searchTerm);
          const searchUrl = `https://api.anicrush.to/shared/v2/movie/list?keyword=${q}&limit=24&page=1`;
          const searchResponse = await this._fetchJSON(searchUrl);
          
          if (searchResponse.data && searchResponse.data.length > 0) {
            console.log(`[search] Found ${searchResponse.data.length} results for: "${searchTerm}"`);
            
            const results = searchResponse.data.map(item => ({
              id: item._id,
              title: item.title,
              url: `https://anicrush.to/watch/${item.slug}`,
              subOrDub: query.dubbed ? "dub" : "sub"
            }));
            
            return results;
          } else {
            console.log(`[search] No results for: "${searchTerm}"`);
          }
        } catch (error: any) {
          console.log(`[search] Error with term "${searchTerm}": ${error.message}`);
          continue;
        }
      }
      
      // If no search terms worked, throw error
      throw new Error(`No results found for any search variation of: ${originalQuery}`);
      
    } catch (error: any) {
      console.error(`[search] error: ${error.message}`);
      throw new Error(error.message);
    }
  }

  async findEpisodes(id: string): Promise<EpisodeDetails[]> {
    try {
      // Handle both ID formats: "movieId/lang" and just "movieId"
      const idParts = id.split("/");
      const movieId = idParts[0];
      const langPart = idParts[1];
      const lang: "dub" | "sub" = (langPart === "dub" || langPart === "sub") ? langPart : "sub";

      // Validate movieId
      if (!movieId || movieId.trim().length === 0) {
        throw new Error("Invalid movieId");
      }

      // Check if we received a numeric ID (which indicates an issue with Seanime)
      if (/^\d+$/.test(movieId)) {
        throw new Error("Received numeric ID which is not supported by AniCrush API");
      }

      const url = `${this.api}/shared/v2/episode/list?_movieId=${movieId}`;
      const data = await this._fetchJSON(url);

      // Check if API returned an error
      if (!data?.status) {
        throw new Error(data?.message || "Failed to fetch episodes");
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
        throw new Error("No episodes found");
      }

      return episodesArr.map((ep: any) => ({
        id: `${movieId}/${lang}/${(ep.number ?? ep.episode ?? ep.id ?? 0)}`,
        number: ep.number ?? ep.episode ?? ep.id ?? 0,
        title: ep.name_english || ep.title || ep.name || `Episode ${ep.number ?? ep.episode ?? ep.id ?? 0}`,
        url: `${movieId}/${lang}/${ep.number ?? ep.episode ?? ep.id ?? 0}`, // Store episode info for server fallback
      }));
    } catch (e: any) {
      console.error("[findEpisodes] error:", e?.message ?? e);
      throw new Error(e?.message ?? "Failed to find episodes");
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

          // Handle iframe type response (MegaCloud, etc.) - try to extract direct sources
          if (result.type === "iframe" && result.link) {
            console.log(`[findEpisodeServer] Server ${serverId} returned iframe: ${result.link}`);
            
            try {
              // Try to extract direct sources from MegaCloud
              const extractedSources = await this._extractMegaCloudSources(result.link);
              
              if (extractedSources && extractedSources.length > 0) {
                console.log(`[findEpisodeServer] Successfully extracted ${extractedSources.length} direct sources from MegaCloud`);
                
                return {
                  provider: "anicrush",
                  server: `${_server} (Server ${serverId})`,
                  headers: this.headers,
                  videoSources: extractedSources,
                };
              }
            } catch (extractError: any) {
              console.log(`[findEpisodeServer] MegaCloud extraction failed:`, extractError?.message ?? extractError);
            }
            
            // Fallback to iframe if extraction fails
            console.log(`[findEpisodeServer] Falling back to iframe for server ${serverId}`);
            
            return {
              provider: "anicrush",
              server: `${_server} (Server ${serverId})`,
              headers: this.headers,
              videoSources: [{
                quality: "auto",
                url: result.link,
                type: "iframe",
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
              .map((s: any) => {
                // Clean URL like GojoWtf does
                const cleanUrl = (s.file || s.url)?.replace(/[\r\n]+/g, '').trim();
                
                return {
                  quality: s.label || s.quality || "auto",
                  url: cleanUrl,
                  type: s.type || (String(cleanUrl).includes(".m3u8") ? "m3u8" : "mp4"),
                  subtitles: [],
                };
              })
              .filter((v: VideoSource) => !!v.url);

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
              headers: this.headers,
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
      throw new Error(e?.message ?? "Failed to find episode server");
    }
  }

  private async _fetchJSON(url: string): Promise<any> {
    const res = await fetch(url, {
      headers: this.headers,
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    return await res.json();
  }

  private async _extractMegaCloudSources(iframeUrl: string): Promise<VideoSource[]> {
    try {
      console.log(`[_extractMegaCloudSources] Extracting from: ${iframeUrl}`);
      
      // Fetch the iframe page
      const iframeResponse = await fetch(iframeUrl, {
        headers: {
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Referer": this.base + "/",
          "User-Agent": this.headers["User-Agent"],
        },
      });

      if (!iframeResponse.ok) {
        throw new Error(`Failed to fetch iframe: ${iframeResponse.status}`);
      }

      const iframeHtml = await iframeResponse.text();
      console.log(`[_extractMegaCloudSources] Iframe HTML length: ${iframeHtml.length}`);

      // Extract the video ID from the iframe URL
      const videoIdMatch = iframeUrl.match(/\/e-1\/([^?]+)/);
      if (!videoIdMatch) {
        throw new Error("Could not extract video ID from iframe URL");
      }
      
      const videoId = videoIdMatch[1];
      console.log(`[_extractMegaCloudSources] Extracted video ID: ${videoId}`);

      // Try multiple patterns to find MegaCloud API endpoints
      const apiPatterns = [
        /ajax\/embed-4\/getSources\?id=([^"&\s]+)/,
        /\/ajax\/embed-4\/getSources\?id=([^"&\s]+)/,
        /"ajax\/embed-4\/getSources\?id=([^"&\s]+)"/,
        /getSources\?id=([^"&\s]+)/,
        new RegExp(`getSources\\?id=${videoId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
      ];

      let megaCloudApiUrl = null;
      let extractedId = null;

      for (const pattern of apiPatterns) {
        const match = iframeHtml.match(pattern);
        if (match) {
          extractedId = match[1] || videoId;
          megaCloudApiUrl = `https://megacloud.blog/ajax/embed-4/getSources?id=${extractedId}`;
          console.log(`[_extractMegaCloudSources] Found MegaCloud API URL: ${megaCloudApiUrl}`);
          break;
        }
      }

      // If no pattern matched, try with the video ID from URL
      if (!megaCloudApiUrl) {
        megaCloudApiUrl = `https://megacloud.blog/ajax/embed-4/getSources?id=${videoId}`;
        console.log(`[_extractMegaCloudSources] Using video ID from URL: ${megaCloudApiUrl}`);
      }

      // Try to call the MegaCloud API
      const sourcesResponse = await fetch(megaCloudApiUrl, {
        headers: {
          "Accept": "application/json, text/javascript, */*; q=0.01",
          "Referer": iframeUrl,
          "User-Agent": this.headers["User-Agent"],
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      console.log(`[_extractMegaCloudSources] API response status: ${sourcesResponse.status}`);

      if (sourcesResponse.ok) {
        const sourcesData = await sourcesResponse.json();
        console.log(`[_extractMegaCloudSources] MegaCloud API response:`, JSON.stringify(sourcesData).substring(0, 500));
        
        if (sourcesData.sources && Array.isArray(sourcesData.sources)) {
          const videoSources: VideoSource[] = sourcesData.sources.map((source: any) => {
            // Clean URL like GojoWtf does
            const cleanUrl = source.file?.replace(/[\r\n]+/g, '').trim();
            
            return {
              quality: source.label || "auto",
              url: cleanUrl,
              type: cleanUrl && cleanUrl.includes(".m3u8") ? "m3u8" : "mp4",
              subtitles: [],
            };
          }).filter((vs: VideoSource) => vs.url);

          // Add subtitles if available
          if (sourcesData.tracks && Array.isArray(sourcesData.tracks)) {
            const engSub = sourcesData.tracks.find((track: any) => 
              track.kind === "captions" && /eng/i.test(track.label || "")
            );
            if (engSub && engSub.file) {
              videoSources.forEach(vs => {
                vs.subtitles = [{ url: engSub.file, lang: engSub.label || "English" }];
              });
            }
          }

          if (videoSources.length > 0) {
            console.log(`[_extractMegaCloudSources] Successfully extracted ${videoSources.length} video sources from API`);
            return videoSources;
          }
        }
      }

      throw new Error("No video sources found in MegaCloud iframe");
    } catch (error: any) {
      console.error(`[_extractMegaCloudSources] Error:`, error?.message ?? error);
      throw error; // Re-throw to allow fallback to iframe
    }
  }
}
