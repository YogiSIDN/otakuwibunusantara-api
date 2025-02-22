const axios = require("axios")
const ytSearch = require("youtube-search-api");

async function yts(query) {
       try {
           const res = await ytSearch.GetListByKeyword(query, false, 10);
           if (!res.items || res.items.length === 0) {
               return {
                   status: 404,
                   dev: "@mysu_019",
                   message: "Tidak ada hasil yang ditemukan."
               };
           }
           const videos = res.items.map(video => ({
               id: video.id,
               title: video.title,
               duration: video.length.simpleText || "N/A",
               channel: video.channelTitle,
               thumbnail: video.thumbnail.thumbnails.pop().url,
               link: `https://www.youtube.com/watch?v=${video.id}`
           }));

           return {
               status: 200,
               dev: "@mysu_019",
               data: videos
           };
       } catch (error) {
           return {
               status: 500,
               dev: "@mysu_019",
               message: "Terjadi kesalahan.",
               error: error.message
           };
      }
}

async function getAccessToken() {
    try {
        const basic = Buffer.from('acc6302297e040aeb6e4ac1fbdfd62c3:0e8439a1280a43aba9a5bc0a16f3f009').toString("base64");
        const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
            headers: {
                Authorization: `Basic ${basic}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting Spotify access token:', error.response?.data || error.message);
        throw new Error('An error occurred while obtaining Spotify access token.');
    }
}

async function sps(query) {
    try {
        const SPOTIFY_ACCESS_TOKEN = await getAccessToken();
        const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
            headers: {
                Authorization: `Bearer ${SPOTIFY_ACCESS_TOKEN}`,
            },
        });

        // Validasi respons dari Spotify
        if (!response.data.tracks || !response.data.tracks.items || response.data.tracks.items.length === 0) {
            return {
                status: 404,
                dev: "@mysu_019",
                message: "Tidak ada hasil yang ditemukan."
            };
        }

        // Mapping hasil pencarian
        const tracks = response.data.tracks.items.map(item => ({
            name: item.name,
            artists: item.artists.map(artist => artist.name).join(', '),
            popularity: item.popularity,
            link: item.external_urls.spotify,
            image: item.album.images.length > 0 ? item.album.images[0].url : null, // Cegah error jika tidak ada gambar
            duration_ms: item.duration_ms,
        }));

        return {
            status: 200,
            dev: "@mysu_019",
            data: tracks
        };
    } catch (error) {
        console.error("Error in sps function:", error.response?.data || error.message);
        return {
            status: 500,
            dev: "@mysu_019",
            message: "Terjadi kesalahan saat mencari lagu di Spotify."
        };
    }
}

module.exports = { sps, yts }