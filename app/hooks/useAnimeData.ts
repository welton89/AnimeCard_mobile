import { useState, useEffect, useCallback } from 'react';
import { AnimeApiResponse, AnimeData } from '@app/_services/types';



// URLs de base
const BASE_URL = 'https://api.jikan.moe/v4/anime?order_by=popularity&sfw=true';
const SEARCH_BASE_URL = 'https://api.jikan.moe/v4/anime?sfw=true'; 


export const useAnimeData = (searchTerm: string) => {
    const [animes, setAnimes] = useState<AnimeData[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasNextPage, setHasNextPage] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isThrottled, setIsThrottled] = useState(false); // Controla o intervalo entre chamadas
    const [error, setError] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);



    const fetchData = useCallback(async (page: number, isNewSearch: boolean) => {
        console.log("termo de busca:    "+searchTerm)
        // Se não houver próxima página ou estiver carregando/throttled e não for uma nova pesquisa, aborta
        if (!isNewSearch && (!hasNextPage || isLoading || isThrottled)) return;
        
        setIsLoading(true);
        setIsThrottled(true); // Ativa o throttle para evitar chamadas imediatas em cascata
        setError(null);

        let url = '';
        if (searchTerm && (isNewSearch || page === 1)) {
            // Busca ou nova pesquisa
            url = `${SEARCH_BASE_URL}&q=${encodeURIComponent(searchTerm)}&page=${page}`;
        } else {
            url = `${BASE_URL}&page=${page}`;
        }
        
        console.log('Buscando animes da URL:', url);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro de rede: ${response.status}`);
            }
            const data: AnimeApiResponse = await response.json();

            if (isNewSearch) {
                // Se for uma nova busca (página 1), substitui os dados
                setAnimes(data.data);
            } else {
                // Se for paginação (página > 1), adiciona ao final
                setAnimes(prevAnimes => [...prevAnimes, ...data.data]);
            }
            
            setCurrentPage(data.pagination.current_page);
            setHasNextPage(data.pagination.has_next_page);
            
        } catch (e: any) {
            console.error('Erro ao buscar dados:', e.message);
            if (e.message.includes('429')) {
                setError('Limite de requisições atingido (Jikan API). Tente novamente em alguns segundos.');
            } else {
                setError(`Falha ao carregar dados: ${e.message}`);
            }
            setHasNextPage(false);
        } finally {
            setIsLoading(false);
            setIsInitialLoad(false);
            // Desativa o throttle após 500ms
            setTimeout(() => {
                setIsThrottled(false);
            }, 500);
        }
    }, [searchTerm, ]);

    // Efeito para a carga inicial ou para uma nova pesquisa (quando searchTerm muda)
    useEffect(() => {
        setAnimes([]);
        setCurrentPage(1);
        setHasNextPage(true);
        setIsInitialLoad(true);

        fetchData(1, true); 
    }, [searchTerm, fetchData]); 


    const handleLoadMore = () => {
        // Só carrega mais se houver próxima página E o throttle estiver inativo
        if (hasNextPage && !isThrottled) {
            console.log('Fim da lista atingido. Carregando página:', currentPage + 1);
            fetchData(currentPage + 1, false); // Não é uma nova pesquisa
        } else if (!hasNextPage) {
            console.log('Não há mais páginas para carregar.');
        }
    };


    return {
        animes,
        isLoading,
        error,
        isInitialLoad,
        hasNextPage,
        handleLoadMore,
    };
};