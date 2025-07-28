const fs = require('fs');

// Read the inline manifest
const manifest = JSON.parse(fs.readFileSync('manifest-inline.json', 'utf8'));
const providerCode = manifest.payload;

// Evaluate the provider code to get the Provider class
eval(`global.Provider = ${providerCode.replace('class Provider', 'class Provider')}`);

// Mock fetch for testing
global.fetch = async (url, options) => {
  console.log(`[MOCK FETCH] ${url}`);
  
  if (url.includes('megacloud.blog/embed-2/v3/e-1/')) {
    // Mock MegaCloud iframe HTML response
    return {
      ok: true,
      text: async () => `
        <html>
        <head><title>MegaCloud</title></head>
        <body>
          <script>
            var videoId = "HWYEIHrW5Sh6";
            var apiUrl = "/ajax/embed-4/getSources?id=" + videoId;
            // Some other JavaScript code
          </script>
          <div id="player"></div>
        </body>
        </html>
      `
    };
  }
  
  if (url.includes('ajax/embed-4/getSources')) {
    // Mock MegaCloud API response
    return {
      ok: true,
      json: async () => ({
        sources: [
          {
            file: "https://example.com/video.m3u8",
            label: "1080p",
            type: "hls"
          },
          {
            file: "https://example.com/video-720p.m3u8", 
            label: "720p",
            type: "hls"
          }
        ],
        tracks: [
          {
            file: "https://example.com/subtitles.vtt",
            label: "English",
            kind: "captions"
          }
        ]
      })
    };
  }
  
  // Default mock response
  return {
    ok: false,
    status: 404
  };
};

async function testMegaCloudExtraction() {
  try {
    console.log('=== Testing MegaCloud Extraction ===');
    
    const provider = new Provider();
    const testIframeUrl = "https://megacloud.blog/embed-2/v3/e-1/HWYEIHrW5Sh6?z=";
    
    console.log(`Testing iframe URL: ${testIframeUrl}`);
    
    // Call the private method directly (access via prototype)
    const result = await provider._extractMegaCloudSources(testIframeUrl);
    
    console.log('\n=== Extraction Result ===');
    console.log(JSON.stringify(result, null, 2));
    
    if (result && result.length > 0) {
      console.log('\n✅ SUCCESS: MegaCloud extraction worked!');
      console.log(`Found ${result.length} video sources`);
      result.forEach((source, i) => {
        console.log(`  ${i+1}. ${source.quality} - ${source.type} - ${source.url}`);
      });
    } else {
      console.log('\n❌ FAILED: No video sources extracted');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR during MegaCloud extraction:', error.message);
    console.error(error.stack);
  }
}

testMegaCloudExtraction();