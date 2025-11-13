/**
 * Utilidades para manejo de videos
 */

/**
 * Detecta la duración de un video de YouTube
 * @param youtubeUrl URL del video de YouTube
 * @returns Duración en segundos (default 30 si no se puede detectar)
 */
export const getYouTubeDuration = async (youtubeUrl: string): Promise<number> => {
  try {
    // Extraer video ID
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) return 30;

    // Usar oEmbed API de YouTube para obtener información
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    
    if (!response.ok) return 30;
    
    // YouTube oEmbed no devuelve duración, así que usamos un valor estimado
    // En producción, se usaría YouTube Data API con API key
    return 30;
  } catch (error) {
    console.error('Error detectando duración de YouTube:', error);
    return 30;
  }
};

/**
 * Detecta la duración de un video local
 * @param file Archivo de video
 * @returns Duración en segundos (default 30 si no se puede detectar)
 */
export const getLocalVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);

    const onLoadedMetadata = () => {
      const duration = Math.round(video.duration);
      URL.revokeObjectURL(url);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('error', onError);
      resolve(duration || 30);
    };

    const onError = () => {
      URL.revokeObjectURL(url);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('error', onError);
      resolve(30); // Default si hay error
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('error', onError);
    video.src = url;
  });
};

/**
 * Extrae el video ID de una URL de YouTube
 * @param url URL del video
 * @returns Video ID o null
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Valida si una URL es un video de YouTube válido
 * @param url URL a validar
 * @returns true si es válida
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  return extractYouTubeVideoId(url) !== null;
};
