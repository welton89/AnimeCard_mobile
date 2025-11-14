import { useMemo } from 'react';

export const useYouTubeIframeGenerator = (
  videoUrl: string,
  options?: { useNoCookie?: boolean }
): string => {
  const { useNoCookie = true } = options || {};

  // O uso de useMemo garante que o HTML só seja recalculado se a 'videoUrl' mudar.
  const iframeHtml = useMemo(() => {
    if (!videoUrl) {
      return '';
    }

    const allowedAttributes = `frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation media-playback"`;
    let newSrc = videoUrl;

    // 1. Converter diferentes formatos de URL para o formato /embed/
    newSrc = newSrc
      .replace(/^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/, 'https://www.youtube.com/embed/$1')
      .replace(/^https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/, 'https://www.youtube.com/embed/$2')
      .replace(/^https?:\/\/(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/, 'https://www.youtube.com/embed/$2'); // Normaliza embeds existentes

    // 2. Aplicar youtube-nocookie.com se a opção estiver ativada
    if (useNoCookie) {
      newSrc = newSrc.replace(
        /^https?:\/\/(www\.)?youtube\.com\/embed\//,
        'https://www.youtube-nocookie.com/embed/'
      );
    }
    
    // 3. Adicionar parâmetros de reprodução otimizados para mobile
    const addParam = (url: string, param: string) =>
      url.includes('?') ? `${url}&${param}` : `${url}?${param}`;

    if (!newSrc.includes('playsinline=')) newSrc = addParam(newSrc, 'playsinline=1'); // Importante para iOS
    if (!newSrc.includes('rel=')) newSrc = addParam(newSrc, 'rel=0'); // Remove vídeos relacionados ao final
    if (!newSrc.includes('controls=')) newSrc = addParam(newSrc, 'controls=1');
    if (!newSrc.includes('enablejsapi=')) newSrc = addParam(newSrc, 'enablejsapi=1');

    // 4. Retornar o iframe final com estilos base
    return `<iframe src="${newSrc}" ${allowedAttributes} referrerpolicy="strict-origin-when-cross-origin" style="width:100%;aspect-ratio:16/9;border:0;"></iframe>`;
  }, [videoUrl, useNoCookie]);

  return iframeHtml;
};