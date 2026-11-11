/**
 * Jovens Sarados - Sistema Inteligente do Feed de Notícias
 * Regras:
 * 1. Começa com as 10 notícias reais oficiais do Instagram (@jovens.sarados)
 * 2. Limite máximo: 30 anúncios/notícias no total
 * 3. Validade: Após 90 dias, a notícia expira automaticamente e é deletada
 * 4. Permite adicionar novas notícias de forma simples e prática
 */

var _nowUnix = Math.floor(Date.now() / 1000);
var _daySec = 24 * 60 * 60;

window.JS_INITIAL_FEEDS = [
    {
        id: 'feed-1',
        feedType: 'post',
        feedData: {
            postId: 'insta-aprofundamento-2026',
            title: 'Aprofundamento Geral 2026: "Geração Radical"',
            postImagem: 'img/instagram/insta-img-9.jpg',
            text: 'E vocês ficaram perguntando o que terá nos dias 19 a 22 de novembro… APRO… GERAÇÃO RADICAL! Estão abertas as inscrições para o Aprofundamento Geral 2026 dos Jovens Sarados. Um retiro profundo de imersão espiritual, santidade, oração e formação para toda a juventude da nossa obra. Procure a coordenação da sua missão e garanta a sua vaga!',
            externalUrl: 'https://www.instagram.com/p/DdT-KqUATg4/',
            externalUrlButton: 'Ver o post no Instagram'
        },
        dateTime: _nowUnix - (1 * _daySec), // 1 dia atrás
        likes: 3840
    },
    {
        id: 'feed-2',
        feedType: 'post',
        feedData: {
            postId: 'insta-retiro-mulheres-2026',
            title: 'Retiro para Mulheres: "Castelo Interior - Moradas"',
            postImagem: 'img/instagram/insta-img-16.jpg',
            text: 'É OFICIAL! 🤎 Vem aí o último retiro do ano PARA MULHERES dos Jovens Sarados: Castelo Interior - Moradas! O retiro que conclui toda a nossa jornada durante esse ano e inicia um novo tempo de intimidade profunda com Deus. De 11 a 13 de Dezembro na Casa de Retiro Santa Clara em Campos do Jordão/SP.',
            externalUrl: 'https://www.instagram.com/p/Def6TBcN1DP/',
            externalUrlButton: 'Ver o post no Instagram'
        },
        dateTime: _nowUnix - (3 * _daySec), // 3 dias atrás
        likes: 3120
    },
    {
        id: 'feed-3',
        feedType: 'post',
        feedData: {
            postId: 'insta-retiro-missionario-2026',
            title: 'Retiro de Discernimento Missionário: 06 a 08 de Novembro',
            postImagem: 'img/instagram/insta-img-11.jpg',
            text: 'Falaaa Sarados!! Mais um retiro de discernimento missionário dos Jovens Sarados. Até quando você vai deixar Jesus esperando? De 06 a 08 de novembro, em Bananal-SP. Um tempo exclusivo de silêncio, oração e escuta de Deus para discernir a vocação e a missão de salvar almas!',
            externalUrl: 'https://www.instagram.com/p/DdEWp7XAKBS/',
            externalUrlButton: 'Ver o post no Instagram'
        },
        dateTime: _nowUnix - (6 * _daySec), // 6 dias atrás
        likes: 2790
    },
    {
        id: 'feed-4',
        feedType: 'post',
        feedData: {
            postId: 'insta-retiro-casais-2026',
            title: 'Retiro das Famílias: "Famílias Radicais - A Igreja Doméstica em Missão"',
            postImagem: 'img/instagram/insta-img-10.jpg',
            text: 'Olá, Olá famílias 👨‍👩‍👧‍👧 | É com muita alegria que convidamos vocês para viverem o RETIRO DAS FAMÍLIAS! "Famílias Radicais - A Igreja Doméstica em Missão" em Campos do Jordão - SP. Momentos inesquecíveis de restauração, unção e renovação sacramental para o seu lar.',
            externalUrl: 'https://www.instagram.com/p/Da5a-KFgNcp/',
            externalUrlButton: 'Ver o post no Instagram'
        },
        dateTime: _nowUnix - (10 * _daySec), // 10 dias atrás
        likes: 3450
    },
    {
        id: 'feed-5',
        feedType: 'post',
        feedData: {
            postId: 'insta-carlo-acutis',
            title: 'Você Realmente Conhece São Carlo Acutis?',
            postImagem: 'img/instagram/insta-img-18.jpg',
            text: 'Dia do nosso patrono: São Carlo Acutis. Mais que conhecer a história dele, devemos seguir seu exemplo! O jovem que amou a Eucaristia acima de tudo nos ensina que a santidade é possível no dia a dia. São Carlo Acutis, rogai por nós!',
            externalUrl: 'https://www.instagram.com/p/DebcBEvlVmd/',
            externalUrlButton: 'Ver o post no Instagram'
        },
        dateTime: _nowUnix - (15 * _daySec), // 15 dias atrás
        likes: 4620
    },
    {
        id: 'feed-6',
        feedType: 'post',
        feedData: {
            postId: 'insta-aparecida',
            title: 'A Rede Tava Vazia. Até Ela Aparecer 💙',
            postImagem: 'img/instagram/insta-img-19.jpg',
            text: 'Dia da Mãe desse Brasil, Mãe de todos nós! A rede tava vazia... até Ela aparecer! 💙 Qual rede está vazia hoje no seu coração e você precisa da intercessão da Mãe? Peça com fé e consagre sua juventude e missão sob o manto de Nossa Senhora Aparecida.',
            externalUrl: 'https://www.instagram.com/p/DeYW20AlUO_/',
            externalUrlButton: 'Ver o post no Instagram'
        },
        dateTime: _nowUnix - (21 * _daySec), // 21 dias atrás
        likes: 5120
    },
    {
        id: 'feed-7',
        feedType: 'post',
        feedData: {
            postId: 'insta-programa-js-tv',
            title: 'Programa & Louvor Jovens Sarados: Academia para a Alma',
            postImagem: 'img/instagram/insta-img-13.jpg',
            text: 'Você sabe qual é o som de cada instrumento do nosso ministério de música? 🎶 Colocamos nossos músicos e missionários à prova para partilhar o louvor e a alegria contagiante da nossa obra. Toda semana no Programa Jovens Sarados na TV Canção Nova!',
            externalUrl: 'https://www.instagram.com/reel/DesMDH_vg6Q/',
            externalUrlButton: 'Ver o post no Instagram'
        },
        dateTime: _nowUnix - (28 * _daySec), // 28 dias atrás
        likes: 3980
    },
    {
        id: 'feed-8',
        feedType: 'post',
        feedData: {
            postId: 'insta-ministerio-familias',
            title: 'Famílias em Missão pela Salvação das Almas',
            postImagem: 'img/instagram/insta-img-14.jpg',
            text: 'Ser família Sarada é ser família em missão, é viver o estilo de vida no ordinário! O Ministério das Famílias dos Jovens Sarados (@js.ministeriofamilias) convida todos os casais a fazerem memória de tudo o que Deus realiza na Igreja Doméstica.',
            externalUrl: 'https://www.instagram.com/p/DehhtoelLMz/',
            externalUrlButton: 'Ver o post no Instagram'
        },
        dateTime: _nowUnix - (35 * _daySec), // 35 dias atrás
        likes: 2890
    },
    {
        id: 'feed-9',
        feedType: 'post',
        feedData: {
            postId: 'insta-santa-teresa-frase',
            title: 'Santa Teresa d\'Ávila: "A Perseverança na Oração é a Chave do Céu"',
            postImagem: 'img/instagram/insta-img-15.jpg',
            text: 'Hoje, a Igreja faz memória à grande doutora da oração, Santa Teresa d’Ávila. 🤎 E uma curiosidade: você sabia que o nosso Ministério de Mulheres a tem como patrona? "A perseverança na oração é a chave para abrir as portas do Céu!" Nunca abandone sua oração pessoal.',
            externalUrl: 'https://www.instagram.com/reel/Deg9Ti4xpgT/',
            externalUrlButton: 'Ver o post no Instagram'
        },
        dateTime: _nowUnix - (45 * _daySec), // 45 dias atrás
        likes: 3310
    },
    {
        id: 'feed-10',
        feedType: 'post',
        feedData: {
            postId: 'insta-geracao-radical-bone',
            title: 'Geração Radical: Vista o Carisma do Reino de Deus!',
            postImagem: 'img/instagram/insta-img-17.jpg',
            text: 'Lançamento na nossa loja oficial e falta só você garantir o seu! Boné oficial Jovens Sarados: GERAÇÃO RADICAL. Assuma a identidade e o estilo de vida radical de quem escolheu a santidade!',
            externalUrl: 'https://www.instagram.com/reel/DegliDyt3Ap/',
            externalUrlButton: 'Ver o post no Instagram'
        },
        dateTime: _nowUnix - (60 * _daySec), // 60 dias atrás (dentro dos 90 dias)
        likes: 3990
    }
];

window.JS_FEED_MANAGER = {
    EXPIRATION_DAYS: 90,
    MAX_ITEMS: 30,

    /**
     * Retorna apenas as notícias ativas (com menos de 90 dias), limitadas a 30 no máximo.
     */
    getAllActiveFeeds: function() {
        var nowUnix = Math.floor(Date.now() / 1000);
        var ninetyDaysInSeconds = this.EXPIRATION_DAYS * 24 * 60 * 60; // 90 dias

        var customFeeds = [];
        try {
            var raw = window.localStorage ? window.localStorage.getItem('JS_CUSTOM_NOTICIAS') : null;
            if (raw) {
                customFeeds = JSON.parse(raw);
            }
        } catch(e) {
            console.error('[FeedManager] Erro ao carregar custom feeds:', e);
        }

        // Combina as notícias padrão com as adicionadas pelo usuário
        var all = (window.JS_INITIAL_FEEDS || []).concat(customFeeds);

        // Regra 1: Filtrar qualquer notícia que tenha mais de 90 dias
        var active = all.filter(function(item) {
            var itemTime = parseInt(item.dateTime);
            if (!itemTime) return true;
            var ageInSeconds = nowUnix - itemTime;
            return ageInSeconds <= ninetyDaysInSeconds;
        });

        // Ordena por data decrescente (mais recente primeiro)
        active.sort(function(a, b) {
            return parseInt(b.dateTime) - parseInt(a.dateTime);
        });

        // Regra 2: Limite máximo de 30 anúncios
        if (active.length > this.MAX_ITEMS) {
            active = active.slice(0, this.MAX_ITEMS);
        }

        return active;
    },

    /**
     * Adiciona uma nova notícia ao feed (armazenada de forma persistente)
     */
    addNoticia: function(noticia) {
        if (!noticia || !noticia.titulo) return null;

        var nowUnix = Math.floor(Date.now() / 1000);
        var isYouTube = Boolean(
            noticia.tipo === 'youtube' ||
            noticia.isYouTube ||
            (noticia.link && (noticia.link.indexOf('youtube') !== -1 || noticia.link.indexOf('youtu.be') !== -1)) ||
            (noticia.instagramUrl && (noticia.instagramUrl.indexOf('youtube') !== -1 || noticia.instagramUrl.indexOf('youtu.be') !== -1))
        );

        var finalUrl = noticia.link || noticia.instagramUrl || (isYouTube ? 'https://www.youtube.com/@jovenssarados' : 'https://www.instagram.com/jovens.sarados/');
        var tag = noticia.tag || (isYouTube ? 'Vídeo YouTube' : 'Notícia JS');
        var tagColor = isYouTube ? '#DC2626' : (noticia.tagColor || '#003CFF');

        var titleTag = isYouTube
            ? '<i class="icon ion-social-youtube" style="color: #FF0000; font-size: 18px; vertical-align: middle; margin-right: 6px;"></i><span style="color: ' + tagColor + '; font-weight: 800;">' + tag + '</span> • Vídeo Oficial'
            : '<i class="icon ion-social-instagram" style="color: #E1306C; font-size: 18px; vertical-align: middle; margin-right: 6px;"></i><span style="color: ' + tagColor + '; font-weight: 800;">' + tag + '</span> • Post Oficial';

        var newFeed = {
            id: 'custom-' + Date.now(),
            feedType: 'post',
            feedData: {
                postId: 'custom-post-' + Date.now(),
                titleTag: titleTag,
                title: noticia.titulo,
                postImagem: noticia.imagem || (isYouTube ? 'img/instagram/insta-img-12.jpg' : 'img/instagram/insta-img-9.jpg'),
                text: noticia.descricao || '',
                externalUrl: finalUrl,
                externalUrlButton: isYouTube ? 'Assistir no YouTube' : 'Ver o post no Instagram',
                isYouTube: isYouTube,
                videoId: noticia.videoId || null
            },
            dateTime: nowUnix,
            likes: 0
        };

        var customFeeds = [];
        try {
            var raw = window.localStorage ? window.localStorage.getItem('JS_CUSTOM_NOTICIAS') : null;
            if (raw) {
                customFeeds = JSON.parse(raw);
            }
        } catch(e) {}

        customFeeds.unshift(newFeed);

        // Limita a lista de custom feeds para não exceder MAX_ITEMS
        if (customFeeds.length > this.MAX_ITEMS) {
            customFeeds = customFeeds.slice(0, this.MAX_ITEMS);
        }

        try {
            if (window.localStorage) {
                window.localStorage.setItem('JS_CUSTOM_NOTICIAS', JSON.stringify(customFeeds));
            }
        } catch(e) {
            console.error('[FeedManager] Erro ao salvar custom feed:', e);
        }

        if (window.JS_INITIAL_FEEDS) {
            window.JS_INITIAL_FEEDS.unshift(newFeed);
        }

        // Sincroniza em tempo real com o servidor central para todos os membros
        if (typeof fetch === 'function') {
            fetch('/api/feed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFeed)
            }).catch(function(e) { console.error('[FeedManager] Erro POST /api/feed', e); });
        }

        return newFeed;
    },

    /**
     * Atualiza uma notícia existente pelo ID (título, foto, resumo, link, tipo)
     */
    updateNoticia: function(id, noticia) {
        if (!id || !noticia) return false;

        var isYouTube = Boolean(
            noticia.tipo === 'youtube' ||
            noticia.isYouTube ||
            (noticia.link && (noticia.link.indexOf('youtube') !== -1 || noticia.link.indexOf('youtu.be') !== -1)) ||
            (noticia.instagramUrl && (noticia.instagramUrl.indexOf('youtube') !== -1 || noticia.instagramUrl.indexOf('youtu.be') !== -1))
        );

        var finalUrl = noticia.link || noticia.instagramUrl || (isYouTube ? 'https://www.youtube.com/@jovenssarados' : 'https://www.instagram.com/jovens.sarados/');
        var tag = noticia.tag || (isYouTube ? 'Vídeo YouTube' : 'Notícia JS');
        var tagColor = isYouTube ? '#DC2626' : (noticia.tagColor || '#003CFF');

        var titleTag = isYouTube
            ? '<i class="icon ion-social-youtube" style="color: #FF0000; font-size: 18px; vertical-align: middle; margin-right: 6px;"></i><span style="color: ' + tagColor + '; font-weight: 800;">' + tag + '</span> • Vídeo Oficial'
            : '<i class="icon ion-social-instagram" style="color: #E1306C; font-size: 18px; vertical-align: middle; margin-right: 6px;"></i><span style="color: ' + tagColor + '; font-weight: 800;">' + tag + '</span> • Post Oficial';

        var updatedFields = {
            titleTag: titleTag,
            title: noticia.titulo,
            postImagem: noticia.imagem || (isYouTube ? 'img/instagram/insta-img-12.jpg' : 'img/instagram/insta-img-9.jpg'),
            text: noticia.descricao || '',
            externalUrl: finalUrl,
            externalUrlButton: isYouTube ? 'Assistir no YouTube' : 'Ver o post no Instagram',
            isYouTube: isYouTube,
            videoId: noticia.videoId || null
        };

        var updated = false;
        try {
            var raw = window.localStorage ? window.localStorage.getItem('JS_CUSTOM_NOTICIAS') : null;
            if (raw) {
                var customFeeds = JSON.parse(raw);
                for (var i = 0; i < customFeeds.length; i++) {
                    if (customFeeds[i].id === id || (customFeeds[i].feedData && customFeeds[i].feedData.postId === id)) {
                        for (var k in updatedFields) {
                            customFeeds[i].feedData[k] = updatedFields[k];
                        }
                        if (customFeeds[i].feedData.videoImagem) {
                            customFeeds[i].feedData.videoImagem = updatedFields.postImagem;
                        }
                        updated = true;
                        break;
                    }
                }
                if (updated && window.localStorage) {
                    window.localStorage.setItem('JS_CUSTOM_NOTICIAS', JSON.stringify(customFeeds));
                }
            }
        } catch(e) {}

        var updatedItem = null;
        if (window.JS_INITIAL_FEEDS) {
            for (var j = 0; j < window.JS_INITIAL_FEEDS.length; j++) {
                if (window.JS_INITIAL_FEEDS[j].id === id || (window.JS_INITIAL_FEEDS[j].feedData && window.JS_INITIAL_FEEDS[j].feedData.postId === id)) {
                    for (var key in updatedFields) {
                        window.JS_INITIAL_FEEDS[j].feedData[key] = updatedFields[key];
                    }
                    if (window.JS_INITIAL_FEEDS[j].feedData.videoImagem) {
                        window.JS_INITIAL_FEEDS[j].feedData.videoImagem = updatedFields.postImagem;
                    }
                    updatedItem = window.JS_INITIAL_FEEDS[j];
                    updated = true;
                    break;
                }
            }
        }

        // Sincroniza atualização no servidor central
        if (updatedItem && typeof fetch === 'function') {
            fetch('/api/feed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedItem)
            }).catch(function(e) { console.error('[FeedManager] Erro update /api/feed', e); });
        }

        return updated;
    },

    removeNoticia: function(id) {
        try {
            var raw = window.localStorage ? window.localStorage.getItem('JS_CUSTOM_NOTICIAS') : null;
            if (raw) {
                var customFeeds = JSON.parse(raw);
                customFeeds = customFeeds.filter(function(f) { return f.id !== id; });
                window.localStorage.setItem('JS_CUSTOM_NOTICIAS', JSON.stringify(customFeeds));
            }
            window.JS_INITIAL_FEEDS = (window.JS_INITIAL_FEEDS || []).filter(function(f) { return f.id !== id; });

            if (typeof fetch === 'function') {
                fetch('/api/feed', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id })
                }).catch(function(e) { console.error('[FeedManager] Erro delete /api/feed', e); });
            }
            return true;
        } catch(e) {
            return false;
        }
    },

    setServerFeeds: function(serverFeeds) {
        if (Array.isArray(serverFeeds) && serverFeeds.length > 0) {
            window.JS_INITIAL_FEEDS = serverFeeds;
        }
    }
};
