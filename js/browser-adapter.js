/**
 * Browser Adapter & Mock Service for Jovens Sarados App
 * Permite visualizar e interagir com o app no navegador sem erros de Cordova ou servidor offline.
 */

(function () {
    console.log('[BrowserAdapter] Inicializando ambiente de visualização Web...');

    // 1. Emular eventos do Cordova (deviceready)
    window.addEventListener('DOMContentLoaded', function () {
        setTimeout(function () {
            var event = document.createEvent('Event');
            event.initEvent('deviceready', true, true);
            document.dispatchEvent(event);
            console.log('[BrowserAdapter] deviceready disparado.');
        }, 150);
    });

    // 2. Mock de plugins nativos do Cordova
    window.cordova = window.cordova || {
        exec: function () { },
        plugins: {},
        require: function () { return {}; }
    };

    window.StatusBar = window.StatusBar || {
        overlaysWebView: function () { },
        styleLightContent: function () { },
        styleDefault: function () { },
        styleBlackTranslucent: function () { },
        styleBlackOpaque: function () { },
        backgroundColorByName: function () { },
        backgroundColorByHexString: function () { },
        show: function () { },
        hide: function () { },
        isVisible: true
    };

    navigator.splashscreen = navigator.splashscreen || {
        hide: function () { }
    };

    window.facebookConnectPlugin = window.facebookConnectPlugin || {
        getLoginStatus: function (s, f) { if (s) s({ status: 'connected', authResponse: { accessToken: 'demo' } }); },
        login: function (p, s, f) { if (s) s({ authResponse: { accessToken: 'demo' } }); },
        api: function (p, f, s) { if (s) s({ id: '123', name: 'Usuário Teste' }); },
        showDialog: function (o, s) { if (s) s({ postId: '1' }); }
    };

    // 3. Carregamento em tempo real da Liturgia Diária (Canção Nova / CNBB)
    function formatLiturgiaHtml(data) {
        var html = '<div class="liturgia-conteudo" style="font-family: \'Inter\', sans-serif; line-height: 1.7; color: #1E293B;">';

        var corStyle = 'background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0;';
        if (data.cor && data.cor.toLowerCase().indexOf('branco') !== -1) corStyle = 'background: #F8FAFC; color: #334155; border: 1px solid #CBD5E1;';
        if (data.cor && data.cor.toLowerCase().indexOf('vermelho') !== -1) corStyle = 'background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA;';
        if (data.cor && data.cor.toLowerCase().indexOf('roxo') !== -1) corStyle = 'background: #F5F3FF; color: #5B21B6; border: 1px solid #DDD6FE;';

        html += '<div style="margin: 4px 0 16px; padding: 14px 16px; background: #EFF6FF; border-left: 4px solid #003CFF; border-radius: 14px; box-shadow: 0 2px 8px rgba(0, 60, 255, 0.06);">';
        html += '<h4 style="margin: 0 0 6px 0; color: #101650; font-family: \'Montserrat\', sans-serif; font-weight: 800; font-size: 16px;">' + (data.liturgia || 'Liturgia do Dia') + '</h4>';
        if (data.cor) {
            html += '<span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 800; ' + corStyle + '">Cor: ' + data.cor + '</span>';
        }
        html += '</div>';

        if (data.dia) {
            html += '<div style="margin-bottom: 20px; font-style: italic; color: #475569; background: #F8FAFC; border: 1.5px solid #E2E8F0; padding: 14px 16px; border-radius: 14px;">';
            html += '<b style="color: #003CFF; font-family: \'Montserrat\', sans-serif;">Oração do Dia:</b><br>' + data.dia;
            html += '</div>';
        }

        if (data.primeiraLeitura && data.primeiraLeitura.texto) {
            html += '<div style="margin-bottom: 24px; padding: 16px; background: #FFFFFF; border-radius: 16px; border: 1.5px solid #E2E8F0;">';
            html += '<h4 style="color: #003CFF; margin: 0 0 6px 0; font-family: \'Montserrat\', sans-serif; font-weight: 800;">Primeira Leitura (' + (data.primeiraLeitura.referencia || '') + ')</h4>';
            if (data.primeiraLeitura.titulo) {
                html += '<p style="font-weight: 700; color: #101650; margin-bottom: 8px;">' + data.primeiraLeitura.titulo + '</p>';
            }
            html += '<p style="text-align: justify; white-space: pre-line; line-height: 1.75;">' + data.primeiraLeitura.texto + '</p>';
            html += '</div>';
        }

        if (data.salmo && data.salmo.texto) {
            html += '<div style="margin-bottom: 24px; padding: 16px; background: #FFFFFF; border-radius: 16px; border: 1.5px solid #E2E8F0;">';
            html += '<h4 style="color: #059669; margin: 0 0 6px 0; font-family: \'Montserrat\', sans-serif; font-weight: 800;">Salmo Responsorial - ' + (data.salmo.referencia || '') + '</h4>';
            if (data.salmo.refrao) {
                html += '<p style="font-weight: 800; color: #003CFF; background: #EFF6FF; border-left: 3px solid #003CFF; padding: 10px 14px; border-radius: 8px;">— ' + data.salmo.refrao + '</p>';
            }
            html += '<p style="text-align: justify; white-space: pre-line; line-height: 1.75;">' + data.salmo.texto + '</p>';
            html += '</div>';
        }

        if (data.segundaLeitura && typeof data.segundaLeitura === 'object' && data.segundaLeitura.texto) {
            html += '<div style="margin-bottom: 24px; padding: 16px; background: #FFFFFF; border-radius: 16px; border: 1.5px solid #E2E8F0;">';
            html += '<h4 style="color: #003CFF; margin: 0 0 6px 0; font-family: \'Montserrat\', sans-serif; font-weight: 800;">Segunda Leitura (' + (data.segundaLeitura.referencia || '') + ')</h4>';
            if (data.segundaLeitura.titulo) {
                html += '<p style="font-weight: 700; color: #101650; margin-bottom: 8px;">' + data.segundaLeitura.titulo + '</p>';
            }
            html += '<p style="text-align: justify; white-space: pre-line; line-height: 1.75;">' + data.segundaLeitura.texto + '</p>';
            html += '</div>';
        }

        if (data.evangelho && data.evangelho.texto) {
            html += '<div style="margin-bottom: 24px; padding: 18px; background: #FFFDF7; border-radius: 18px; border: 2px solid #F59E0B; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.1);">';
            html += '<h4 style="color: #D97706; margin: 0 0 6px 0; font-family: \'Montserrat\', sans-serif; font-weight: 800;">✝️ Evangelho (' + (data.evangelho.referencia || '') + ')</h4>';
            if (data.evangelho.titulo) {
                html += '<p style="font-weight: 700; color: #92400E; margin-bottom: 8px;">' + data.evangelho.titulo + '</p>';
            }
            html += '<p style="text-align: justify; white-space: pre-line; line-height: 1.8;">' + data.evangelho.texto + '</p>';
            html += '<p style="text-align: right; color: #D97706; font-weight: 700; font-size: 12px; margin-top: 10px;">— Palavra da Salvação. Glória a Vós, Senhor.</p>';
            html += '</div>';
        }

        if (data.oferendas || data.comunhao) {
            html += '<div style="margin-top: 15px; font-size: 13px; color: #475569; background: #F8FAFC; border: 1.5px solid #E2E8F0; padding: 12px 14px; border-radius: 12px;">';
            if (data.oferendas) html += '<p style="margin-bottom: 6px;"><b>Sobre as Oferendas:</b> ' + data.oferendas + '</p>';
            if (data.comunhao) html += '<p style="margin-bottom: 0;"><b>Depois da Comunhão:</b> ' + data.comunhao + '</p>';
            html += '</div>';
        }

        html += '<p style="text-align: right; font-size: 11px; color: #94A3B8; margin-top: 15px;">Fonte: Canção Nova / CNBB</p>';
        html += '</div>';
        return html;
    }

    var liturgiaMemoryCache = {};
    var liturgiaStore = null;

    function getLiturgia(dateParam, callback) {
        // Tentar buscar da API em tempo real (Canção Nova / CNBB)
        var dia, mes, cacheKey;
        if (dateParam && typeof dateParam === 'string' && dateParam.indexOf('-') !== -1) {
            var parts = dateParam.split('-');
            dia = parseInt(parts[2], 10);
            mes = parseInt(parts[1], 10);
            cacheKey = dateParam;
        } else {
            var today = new Date();
            dia = today.getDate();
            mes = today.getMonth() + 1;
            var dStr = (dia < 10 ? '0' : '') + dia;
            var mStr = (mes < 10 ? '0' : '') + mes;
            cacheKey = today.getFullYear() + '-' + mStr + '-' + dStr;
        }

        // Se já está no cache de memória, entrega IMEDIATAMENTE (0ms - instantâneo)
        if (liturgiaMemoryCache[cacheKey]) {
            console.log('[BrowserAdapter] Liturgia servida instantaneamente do cache em memória:', cacheKey);
            callback(liturgiaMemoryCache[cacheKey].formatted, liturgiaMemoryCache[cacheKey].raw);
            return;
        }

        var apiUrl = 'https://liturgia.up.railway.app/?dia=' + dia + '&mes=' + mes;
        console.log('[BrowserAdapter] Buscando Liturgia Diária de ' + dia + '/' + mes + ' na Canção Nova...');

        fetch(apiUrl)
            .then(function (res) {
                if (!res.ok) throw new Error('Falha HTTP ' + res.status);
                return res.json();
            })
            .then(function (json) {
                console.log('[BrowserAdapter] Liturgia recebida com sucesso:', json.liturgia);
                var formatted = formatLiturgiaHtml(json);
                liturgiaMemoryCache[cacheKey] = { formatted: formatted, raw: json };
                callback(formatted, json);
            })
            .catch(function (err) {
                console.warn('[BrowserAdapter] API externa inacessível, usando fallback offline:', err);
                // Fallback para arquivo local se estiver sem internet
                if (liturgiaStore !== null) {
                    callback(liturgiaStore[dateParam] || null, null);
                    return;
                }
                fetch('js/sqls.js')
                    .then(function (r) { return r.json(); })
                    .then(function (sqlStatements) {
                        liturgiaStore = {};
                        for (var i = 0; i < sqlStatements.length; i++) {
                            var sql = sqlStatements[i];
                            var idx = sql.indexOf("VALUES ('");
                            if (idx !== -1) {
                                var p = sql.substring(idx + 9).split("', '");
                                if (p.length >= 2) {
                                    liturgiaStore[p[0]] = p[1].replace(/'\)$/, '').replace(/\\'/g, "'").replace(/\\"/g, '"');
                                }
                            }
                        }
                        callback(liturgiaStore[dateParam] || null);
                    })
                    .catch(function () {
                        callback(null);
                    });
            });
    }

    // Pré-carrega a liturgia de hoje na memória imediatamente na inicialização
    try {
        var _now = new Date();
        var _d = _now.getDate();
        var _m = _now.getMonth() + 1;
        var _dStr = (_d < 10 ? '0' : '') + _d;
        var _mStr = (_m < 10 ? '0' : '') + _m;
        var _tKey = _now.getFullYear() + '-' + _mStr + '-' + _dStr;
        getLiturgia(_tKey, function (res) {
            if (res) console.log('[BrowserAdapter] Liturgia de hoje pré-carregada na memória com sucesso!');
        });
    } catch (e) {
        console.warn('Erro ao pré-carregar liturgia:', e);
    }

    // 4. Injetar módulo Angular para sobrescrever e emular plugins nativos e webservices
    angular.module('starter')
        .run(function (localStorage, G) {
            // Verificar perfil cadastrado
            var savedProfileRaw = window.localStorage.getItem('js_user_profile_v1');
            var savedProfile = null;
            try {
                if (savedProfileRaw) savedProfile = JSON.parse(savedProfileRaw);
            } catch(e) {}

            var isRegistered = savedProfile && savedProfile.cadastrado === true && savedProfile.nome && savedProfile.email;

            if (isRegistered) {
                var userObj = savedProfile;
                try {
                    window.localStorage.setItem('js_user_profile_v1', JSON.stringify(userObj));
                } catch(e) {}
                localStorage.set('jsUser', userObj);
                G.user = userObj;
            } else {
                localStorage.del('jsUser');
                G.user = false;
            }

            // Sincronizar membros cadastrados a partir do servidor (/api/membros)
            if (typeof fetch === 'function') {
                fetch('/api/membros')
                    .then(function(res) { return res.json(); })
                    .then(function(lista) {
                        if (lista && Array.isArray(lista) && lista.length > 0) {
                            try {
                                var localRaw = window.localStorage.getItem('js_admin_membros_db');
                                var localList = localRaw ? JSON.parse(localRaw) : [];
                                var map = {};
                                for (var i = 0; i < localList.length; i++) {
                                    if (localList[i].email) map[localList[i].email.toLowerCase().trim()] = localList[i];
                                }
                                for (var j = 0; j < lista.length; j++) {
                                    if (lista[j].email) {
                                        var em = lista[j].email.toLowerCase().trim();
                                        map[em] = angular.extend({}, map[em] || {}, lista[j]);
                                    }
                                }
                                var merged = Object.keys(map).map(function(k) { return map[k]; });
                                window.localStorage.setItem('js_admin_membros_db', JSON.stringify(merged));
                            } catch(e) {}
                        }
                    })
                    .catch(function() {});
            }
        })
        .decorator('$cordovaSQLite', function ($delegate, $q) {
            return {
                openDB: function () { return { name: 'mock.db' }; },
                execute: function (db, query, params) {
                    var q = $q.defer();
                    query = query || '';
                    params = params || [];

                    if (query.indexOf('liturgia_diaria') !== -1) {
                        if (query.indexOf('SELECT') !== -1) {
                            var dateParam = params[0];

                            getLiturgia(dateParam, function(text, rawData) {
                                var resultText = text || '<b>Liturgia Diária</b><br><br>Primeira Leitura: Sl 23<br>Evangelho: Jo 1,1-14<br><br><i>"O Senhor é o meu pastor, nada me faltará."</i>';
                                q.resolve({
                                    rows: {
                                        length: 1,
                                        item: function (i) {
                                            return { data: dateParam, texto: resultText, raw: rawData };
                                        }
                                    }
                                });
                            });
                            return q.promise;
                        }
                    }

                    // Fallback para outros executes
                    q.resolve({ rows: { length: 0, item: function () { return null; } } });
                    return q.promise;
                }
            };
        })
        .decorator('$cordovaNetwork', function ($delegate, $rootScope) {
            return {
                isOnline: function () { return true; },
                isOffline: function () { return false; },
                getNetwork: function () { return 'wifi'; }
            };
        })
        .decorator('$cordovaToast', function ($delegate) {
            return {
                showShortBottom: function (msg) { console.log('[Toast]', msg); },
                showLongBottom: function (msg) { console.log('[Toast]', msg); }
            };
        })
        .decorator('webService', function ($delegate, $q, $timeout) {
            // Mock de dados para simular as respostas do servidor antigo (app.jovenssarados.com)

            var PEDRINHAS_DEF = [
                {
                    key: 'oracaoPessoal',
                    tipo: 'pedrinha',
                    numero: 1,
                    titulo: 'Oração Pessoal',
                    subtitulo: 'Intimidade diária no ritmo da vida',
                    img: 'img/pedrinhas/oracao.svg',
                    icone: 'ion-ios-flame',
                    cor: '#003CFF',
                    defaultCumpridas: 14,
                    resumo: 'Diálogo diário no secreto do coração com o Senhor. Rezar no ritmo da vida.',
                    citacao: '“Para mim, a oração é um impulso do coração, um simples olhar lançado para o céu, um grito de gratidão e de amor.” — Santa Teresinha',
                    explicacao: 'A oração pessoal diária é o oxigênio do Jovem Sarado. Rezar no ritmo da vida significa que, em meio à correria do trabalho, estudo e família, cavamos um tempo inegociável para estar a sós com o Pai. É adoração em espírito e em verdade: sermos filhos apaixonados e não simples empregados de Deus.'
                },
                {
                    key: 'terco',
                    tipo: 'pedrinha',
                    numero: 2,
                    titulo: 'Santo Terço / Rosário',
                    subtitulo: 'Adorar Jesus contemplando-O na presença de Maria',
                    img: 'img/pedrinhas/terco.svg',
                    icone: 'ion-record',
                    cor: '#3B82F6',
                    defaultCumpridas: 20,
                    resumo: 'Reza diária do terço contemplando os mistérios da vida de Jesus através da escola de Nossa Senhora.',
                    citacao: '“O Rosário é uma oração cristológica: o centro do terço não é Maria, mas Jesus contemplado com o olhar da Mãe.” — São João Paulo II',
                    explicacao: 'Rezar o terço diariamente no ônibus, no carro, no intervalo ou em casa. Não como uma repetição mecânica, mas como memória viva da salvação. A cartilha recomenda o uso das cláusulas meditadas no meio da Ave-Maria para manter a mente e o coração imersos em Cristo.'
                },
                {
                    key: 'biblia',
                    tipo: 'pedrinha',
                    numero: 3,
                    titulo: 'Diário Bíblico & Lectio Divina',
                    subtitulo: 'Leitura orante da Palavra e Diário Espiritual',
                    img: 'img/pedrinhas/biblia.svg',
                    icone: 'ion-ios-book',
                    cor: '#8B5CF6',
                    defaultCumpridas: 11,
                    resumo: 'Pelo menos 30 minutos diários de Lectio Divina com registro das inspirações no Diário Bíblico.',
                    citacao: '“A Palavra de Deus não se belisca como petisco: é refeição para todos os dias!” — Monsenhor Jonas Abib',
                    explicacao: 'Os 5 passos práticos da Cartilha JS: 1. Clame o Espírito Santo; 2. Lectio (leitura atenta do livro sequencial da Bíblia); 3. Meditatio (ruminação da Palavra aplicada à vida); 4. Oratio (oração e resposta a Deus); 5. Escreva no seu Diário Bíblico o que Deus falou e como colocar em prática.'
                },
                {
                    key: 'jejumPenitencia',
                    tipo: 'pedrinha',
                    numero: 4,
                    titulo: 'Jejum & Penitência',
                    subtitulo: 'Arma poderosa de combate espiritual',
                    img: 'img/pedrinhas/jejum.svg',
                    icone: 'ion-fork',
                    cor: '#EF4444',
                    defaultCumpridas: 5,
                    resumo: 'Jejum prescrito pela Igreja às sextas-feiras até às 16h para mortificar a carne e dar espaço ao Espírito.',
                    citacao: '“Quanto a esta espécie de demônio, só se pode expulsar à força de oração e de jejum.” (Mt 17,21)',
                    explicacao: 'O jejum não é barganha com Deus, é uma via de purificação e fortalecimento da alma. Toma-se o café da manhã normalmente e encerra-se às 16h. Formas previstas na Cartilha: Pão e água, Líquidos (sucos/chás), Jejum da Igreja (almoço leve sem lanches nos intervalos) ou Jejum parcial com amor e fidelidade.'
                },
                {
                    key: 'missa',
                    tipo: 'pedrinha',
                    numero: 5,
                    titulo: 'Santa Missa & Confissão',
                    subtitulo: 'Eucaristia frequente e cura pela Confissão sacramental',
                    img: 'img/pedrinhas/missa.svg',
                    icone: 'ion-checkmark-circled',
                    cor: '#10B981',
                    defaultCumpridas: 26,
                    resumo: 'Comunhão diária ou o mais frequente possível (dominical sem falta) e Confissão sacramental mensal.',
                    citacao: '“Se queres muitas graças, visite muitas vezes o Sacrário!” — São João Bosco',
                    explicacao: 'A Eucaristia é a fonte e o ápice da vida cristã. Receber Jesus com fome e sede, fazendo entre 10 e 15 minutos de ação de graças pós-comunhão. Recorrer à Santa Confissão com exame de consciência, sincero arrependimento e absolvição sacerdotal para recuperar e proteger a graça santificante.'
                }
            ];

            var TESOUROS_DEF = [
                {
                    key: 'vidaDeOracao',
                    tipo: 'tesouro',
                    numero: 1,
                    titulo: '1º Tesouro: Vida de Oração',
                    subtitulo: 'O alicerce fundamental de todos os valores JS',
                    img: 'img/pedrinhas/oracao.svg',
                    icone: 'ion-ios-flame',
                    cor: '#003CFF',
                    defaultCumpridas: 15,
                    resumo: 'Rezar no ritmo da vida. Ser filho apaixonado e adorador, e não um ativista empregado.',
                    citacao: '“A vida de oração é o alicerce de todos os outros tesouros. Sem vida de oração, não dá pra ser sarado!” — Pe. Edimilson',
                    explicacao: 'A oração é a fonte de água viva que jorra do fundo do vaso. Sem ela, nos tornamos ativistas vazios e secos. Nossa espiritualidade é carismática, mariana e de profunda adoração: buscar a Deus por quem Ele é, passando tempo na Sua presença a cada dia.'
                },
                {
                    key: 'acolhida',
                    tipo: 'tesouro',
                    numero: 2,
                    titulo: '2º Tesouro: Acolhida',
                    subtitulo: 'A nossa marca registrada na missão',
                    img: 'img/pedrinhas/missa.svg',
                    icone: 'ion-person-stalker',
                    cor: '#10B981',
                    defaultCumpridas: 18,
                    resumo: 'Tratamento VIP aos novos e aos que estão fora da Igreja. Amor gratuito sem preconceitos.',
                    citacao: '“Se a marca dos sarados deve ser a acolhida, a marca da oração dos sarados deve ser a busca adoradora!” — Cartilha JS',
                    explicacao: 'Em obediência ao Papa Francisco, acolhemos cada jovem que chega com abraço fraterno, escuta atenta e olhar de misericórdia. A acolhida cura e restaura as feridas da rejeição, fazendo a pessoa se sentir amada e única para Deus.'
                },
                {
                    key: 'sadiaConvivencia',
                    tipo: 'tesouro',
                    numero: 3,
                    titulo: '3º Tesouro: Sadia Convivência',
                    subtitulo: 'Amizades puras, afetividade curada e castidade',
                    img: 'img/pedrinhas/terco.svg',
                    icone: 'ion-heart',
                    cor: '#EC4899',
                    defaultCumpridas: 16,
                    resumo: 'Amizades segundo o coração de Deus. Fechar brechas para bebidas, drogas e vulgaridade.',
                    citacao: '“Ser jovem sem deixar de ser de Deus! Divertimo-nos com simplicidade na presença da graça.” — Jovens Sarados',
                    explicacao: 'Vivemos a alegria verdadeira em convivências, lares sarados, pizzarias e eventos sem precisar de bebidas alcoólicas ou baladas mundanas. Castidade no olhar, no falar e no vestir, buscando a cura da afetividade através da amizade e da direção espiritual.'
                },
                {
                    key: 'viverReconciliado',
                    tipo: 'tesouro',
                    numero: 4,
                    titulo: '4º Tesouro: Viver Reconciliado',
                    subtitulo: 'Dar o primeiro passo em direção ao perdão',
                    img: 'img/pedrinhas/biblia.svg',
                    icone: 'ion-refresh',
                    cor: '#8B5CF6',
                    defaultCumpridas: 12,
                    resumo: 'Humildade e desprendimento de si. Proteger a boa fama dos irmãos e evitar fofocas.',
                    citacao: '“Quem ama dá o primeiro passo. De gesto em gesto, o amor vencerá!” (1Pd 3,8-9)',
                    explicacao: 'Conflitos surgem no convívio, mas o servo JS não busca ter razão: busca o perdão imediato. Viver reconciliado consigo mesmo, com o passado e com os irmãos, eliminando murmurações e julgamentos.'
                },
                {
                    key: 'radicalidadeEvangelho',
                    tipo: 'tesouro',
                    numero: 5,
                    titulo: '5º Tesouro: Radicalidade do Evangelho',
                    subtitulo: 'Santos ou nada! Coragem de viver e proclamar a Verdade',
                    img: 'img/pedrinhas/jejum.svg',
                    icone: 'ion-flash',
                    cor: '#EF4444',
                    defaultCumpridas: 14,
                    resumo: 'Fidelidade total à Palavra e à Igreja. Não ficar em cima do muro nem se amoldar ao mundo.',
                    citacao: '“Nós existiremos enquanto permanecer em nós essa loucura por salvar almas jovens!” — Pe. Edimilson',
                    explicacao: 'Viver o Evangelho sem concessões ao pecado. Testemunhar a fé na faculdade, no trabalho e na família. O sacrifício de si para que outros conheçam a Jesus, com o ardor de resgatar os jovens perdidos.'
                },
                {
                    key: 'servir',
                    tipo: 'tesouro',
                    numero: 6,
                    titulo: '6º Tesouro: Servir',
                    subtitulo: 'Fazei-me servo por amor',
                    img: 'img/pedrinhas/oracao.svg',
                    icone: 'ion-android-hand',
                    cor: '#F59E0B',
                    defaultCumpridas: 22,
                    resumo: 'Doação generosa e gratuita, sem esperar elogios, méritos ou recompensas humanas.',
                    citacao: '“Lave um prato não para que fique limpo, mas porque você ama a pessoa que vai comer nele.” — Santa Teresa de Calcutá',
                    explicacao: 'Colocar dons e talentos à disposição da missão e dos irmãos. Todo serviço no JS é um ato evangelizador: desde carregar cadeiras, cozinhar nos retiros ou limpar o chão até pregar, cantar e coordenar.'
                },
                {
                    key: 'tau',
                    tipo: 'tesouro',
                    numero: 7,
                    titulo: '7º Tesouro: TAU',
                    subtitulo: 'O sinal do nosso compromisso: Castos, Pobres e Obedientes',
                    img: 'img/pedrinhas/biblia.svg',
                    icone: 'ion-android-star',
                    cor: '#6366F1',
                    defaultCumpridas: 25,
                    resumo: 'Sinal externo de consagração e pertença. Os 3 nós: Pobreza, Castidade e Obediência.',
                    citacao: '“Marca com um TAU a fronte dos que gemem e suspiram.” — Ezequiel 9,4',
                    explicacao: 'O TAU é o sinal da cruz salvífica e da nossa consagração a Deus na obra Jovens Sarados. Os três nós do cordão lembram a pobreza (dependência total da providência divina), a castidade (pureza de corpo e alma) e a obediência à Igreja e à coordenação da missão.'
                }
            ];

            var pedrinhasCacheByEmail = {};

            function getPedrinhasStore(userEmail) {
                var cleanEmail = (userEmail && typeof userEmail === 'string') ? userEmail.trim().toLowerCase() : '';
                var key = cleanEmail ? ('js_pedrinhas_user_' + cleanEmail) : 'js_pedrinhas_storage_v2';
                
                // 1. Checa memória cache
                if (cleanEmail && pedrinhasCacheByEmail[cleanEmail]) {
                    return pedrinhasCacheByEmail[cleanEmail];
                }

                // 2. Checa localStorage
                try {
                    var raw = localStorage.getItem(key);
                    if (raw) {
                        var parsed = JSON.parse(raw);
                        if (cleanEmail) pedrinhasCacheByEmail[cleanEmail] = parsed;
                        return parsed;
                    }
                } catch(e) {}

                // 3. Fallback inteligente: se for Adriana ou André, carregar dados pré-cadastrados
                if (cleanEmail === 'adrianacelestt18@gmail.com') {
                    var adrianaStore = {
                        records: {
                            "2026-10-18": { "oracaoPessoal": true, "terco": true, "missa": true },
                            "2026-10-19": { "oracaoPessoal": true, "biblia": true },
                            "2026-10-20": { "oracaoPessoal": true, "terco": true, "biblia": true, "missa": true },
                            "2026-10-21": { "oracaoPessoal": true, "terco": true }
                        },
                        cumpridas: {
                            oracaoPessoal: 18,
                            terco: 22,
                            biblia: 12,
                            jejumPenitencia: 6,
                            missa: 20
                        }
                    };
                    savePedrinhasStore(adrianaStore, cleanEmail);
                    return adrianaStore;
                }

                if (cleanEmail === 'andre.n1984@gmail.com') {
                    var andreStore = {
                        records: {
                            "2026-10-18": { "oracaoPessoal": true, "terco": true, "missa": true },
                            "2026-10-19": { "oracaoPessoal": true, "terco": true, "biblia": true },
                            "2026-10-20": { "oracaoPessoal": true, "terco": true, "biblia": true, "missa": true },
                            "2026-10-21": { "oracaoPessoal": true, "terco": true, "biblia": true, "missa": true }
                        },
                        cumpridas: {
                            oracaoPessoal: 25,
                            terco: 24,
                            biblia: 19,
                            jejumPenitencia: 8,
                            missa: 28
                        }
                    };
                    savePedrinhasStore(andreStore, cleanEmail);
                    return andreStore;
                }

                return {
                    records: {}, // dateStr (YYYY-MM-DD): { pedrinhaKey: true }
                    cumpridas: {
                        oracaoPessoal: 14,
                        terco: 20,
                        biblia: 11,
                        jejumPenitencia: 5,
                        missa: 26
                    }
                };
            }

            function savePedrinhasStore(store, userEmail) {
                var cleanEmail = (userEmail && typeof userEmail === 'string') ? userEmail.trim().toLowerCase() : '';
                var key = cleanEmail ? ('js_pedrinhas_user_' + cleanEmail) : 'js_pedrinhas_storage_v2';
                if (cleanEmail) pedrinhasCacheByEmail[cleanEmail] = store;
                try {
                    localStorage.setItem(key, JSON.stringify(store));
                    if (!cleanEmail) {
                        localStorage.setItem('js_pedrinhas_storage_v2', JSON.stringify(store));
                    }
                } catch(e) {}

                // Sincroniza em segundo plano com /api/pedrinhas
                if (typeof fetch === 'function') {
                    fetch('/api/pedrinhas', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: cleanEmail || 'geral', store: store })
                    }).catch(function() {});
                }
            }

            function getTodayDateStr() {
                var now = new Date();
                var y = now.getFullYear();
                var m = String(now.getMonth() + 1);
                if (m.length < 2) m = '0' + m;
                var d = String(now.getDate());
                if (d.length < 2) d = '0' + d;
                return y + '-' + m + '-' + d;
            }

            function getWeekDates(offsetWeeks) {
                var now = new Date();
                if (offsetWeeks) {
                    now.setDate(now.getDate() + (offsetWeeks * 7));
                }
                var day = now.getDay(); // 0 is Sunday
                var sunday = new Date(now);
                sunday.setDate(now.getDate() - day);
                sunday.setHours(0, 0, 0, 0);

                var dates = [];
                for (var i = 0; i < 7; i++) {
                    var cd = new Date(sunday);
                    cd.setDate(sunday.getDate() + i);
                    var y = cd.getFullYear();
                    var m = String(cd.getMonth() + 1);
                    if (m.length < 2) m = '0' + m;
                    var d = String(cd.getDate());
                    if (d.length < 2) d = '0' + d;
                    dates.push(y + '-' + m + '-' + d);
                }
                return dates;
            }

            function buildPedrinhasReport(userEmail) {
                var store = getPedrinhasStore(userEmail);
                var todayStr = getTodayDateStr();
                var curWeekDates = getWeekDates(0);
                var lastWeekDates = getWeekDates(-1);

                var res = {
                    pedrinhas: {},
                    tesouros: {},
                    pedrinhasLista: [],
                    tesourosLista: [],
                    pedrinhasDef: PEDRINHAS_DEF,
                    tesourosDef: TESOUROS_DEF
                };

                // 1. Compilar as 5 Pedrinhas
                for (var i = 0; i < PEDRINHAS_DEF.length; i++) {
                    var p = PEDRINHAS_DEF[i];
                    var isDoneToday = !!(store.records && store.records[todayStr] && store.records[todayStr][p.key]);

                    var curWeekReport = {};
                    for (var d = 0; d < 7; d++) {
                        var dateStr = curWeekDates[d];
                        var wasDone = !!(store.records && store.records[dateStr] && store.records[dateStr][p.key]);
                        curWeekReport[d] = { dayWeek: wasDone ? d : -1 };
                    }

                    var lastWeekReport = {};
                    var mockDoneDays = {
                        oracaoPessoal: [1, 2, 3, 4, 5],
                        terco: [0, 1, 3, 5, 6],
                        biblia: [1, 3, 4, 6],
                        jejumPenitencia: [3, 5],
                        missa: [0, 6]
                    };
                    for (var ld = 0; ld < 7; ld++) {
                        var lDateStr = lastWeekDates[ld];
                        var lWasDone = (store.records && store.records[lDateStr]) ? !!store.records[lDateStr][p.key] : (mockDoneDays[p.key] && mockDoneDays[p.key].indexOf(ld) !== -1);
                        lastWeekReport[ld] = { dayWeek: lWasDone ? ld : -1 };
                    }

                    var pItem = {
                        key: p.key,
                        tipo: 'pedrinha',
                        numero: p.numero,
                        titulo: p.titulo,
                        subtitulo: p.subtitulo,
                        imagem: p.img,
                        icone: p.icone,
                        cor: p.cor,
                        resumo: p.resumo,
                        explicacao: p.explicacao,
                        citacao: p.citacao,
                        button: { titulo: p.titulo, imagem: p.img },
                        doneToday: isDoneToday,
                        cumpridas: (store.cumpridas && store.cumpridas[p.key]) ? store.cumpridas[p.key] : p.defaultCumpridas,
                        report: {
                            currentWeek: curWeekReport,
                            lastWeek: lastWeekReport
                        }
                    };

                    res[p.key] = pItem;
                    res.pedrinhas[p.key] = pItem;
                    res.pedrinhasLista.push(pItem);
                }

                // 2. Compilar os 7 Tesouros JS
                if (!store.tesourosCumpridos) store.tesourosCumpridos = {};
                for (var j = 0; j < TESOUROS_DEF.length; j++) {
                    var t = TESOUROS_DEF[j];
                    var tDoneToday = !!(store.records && store.records[todayStr] && store.records[todayStr][t.key]);

                    var tCurWeekReport = {};
                    for (var td = 0; td < 7; td++) {
                        var tDateStr = curWeekDates[td];
                        var tWasDone = !!(store.records && store.records[tDateStr] && store.records[tDateStr][t.key]);
                        tCurWeekReport[td] = { dayWeek: tWasDone ? td : -1 };
                    }

                    var tLastWeekReport = {};
                    var mockDoneTesouros = {
                        vidaDeOracao: [0, 1, 2, 3, 4, 5, 6],
                        acolhida: [0, 2, 4, 6],
                        sadiaConvivencia: [1, 2, 3, 5, 6],
                        viverReconciliado: [1, 3, 5],
                        radicalidadeEvangelho: [0, 1, 4, 6],
                        servir: [0, 2, 4, 5, 6],
                        tau: [0, 1, 2, 3, 4, 5, 6]
                    };
                    for (var tld = 0; tld < 7; tld++) {
                        var tlDateStr = lastWeekDates[tld];
                        var tlWasDone = (store.records && store.records[tlDateStr]) ? !!store.records[tlDateStr][t.key] : (mockDoneTesouros[t.key] && mockDoneTesouros[t.key].indexOf(tld) !== -1);
                        tLastWeekReport[tld] = { dayWeek: tlWasDone ? tld : -1 };
                    }

                    var tItem = {
                        key: t.key,
                        tipo: 'tesouro',
                        numero: t.numero,
                        titulo: t.titulo,
                        subtitulo: t.subtitulo,
                        imagem: t.img,
                        icone: t.icone,
                        cor: t.cor,
                        resumo: t.resumo,
                        explicacao: t.explicacao,
                        citacao: t.citacao,
                        button: { titulo: t.titulo, imagem: t.img },
                        doneToday: tDoneToday,
                        cumpridas: store.tesourosCumpridos[t.key] ? store.tesourosCumpridos[t.key] : t.defaultCumpridas,
                        report: {
                            currentWeek: tCurWeekReport,
                            lastWeek: tLastWeekReport
                        }
                    };

                    res[t.key] = tItem;
                    res.tesouros[t.key] = tItem;
                    res.tesourosLista.push(tItem);
                }

                return res;
            }

            function getLoggedUserEmailClean() {
                try {
                    var uRaw = window.localStorage.getItem('js_user_profile_v1') || window.localStorage.getItem('jsUser') || window.localStorage.getItem('js_user_session');
                    if (uRaw) {
                        var u = JSON.parse(uRaw);
                        if (u && u.email) return u.email.trim().toLowerCase();
                    }
                    var admRaw = window.localStorage.getItem('js_admin_auth_v1');
                    if (admRaw) {
                        var adm = JSON.parse(admRaw);
                        if (adm && adm.email) return adm.email.trim().toLowerCase();
                        return 'admin@jovenssarados.com';
                    }
                } catch(e) {}
                return 'anonimo';
            }

            function getDiarioStorageKey(email) {
                var cleanEmail = (email || getLoggedUserEmailClean()).trim().toLowerCase();
                return 'js_diario_biblico_user_' + cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '_');
            }

            // Remove resquício compartilhado antigo
            try { localStorage.removeItem('js_diario_biblico_v2'); } catch(e) {}

            function getDiarioBiblicoStore(specificEmail) {
                var email = (specificEmail || getLoggedUserEmailClean()).trim().toLowerCase();
                var key = getDiarioStorageKey(email);
                try {
                    var raw = localStorage.getItem(key);
                    if (raw) {
                        var parsed = JSON.parse(raw);
                        if (Array.isArray(parsed)) return parsed;
                    }
                } catch(e) {
                    console.error('[BrowserAdapter] Erro ao ler diario de ' + email, e);
                }
                return [];
            }

            function saveDiarioBiblicoStore(list, specificEmail) {
                var email = (specificEmail || getLoggedUserEmailClean()).trim().toLowerCase();
                var key = getDiarioStorageKey(email);
                try {
                    localStorage.setItem(key, JSON.stringify(list));
                } catch(e) {}

                // Sincroniza em segundo plano com o backend estritamente pessoal /api/diario
                try {
                    if (typeof fetch === 'function') {
                        fetch('/api/diario', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: email, entries: list })
                        }).catch(function() {});
                    }
                } catch(e) {}
            }

            function formatarDataHoraBrasilia(d) {
                d = d || new Date();
                var dia = ('0' + d.getDate()).slice(-2);
                var mes = ('0' + (d.getMonth() + 1)).slice(-2);
                var ano = d.getFullYear();
                var horas = ('0' + d.getHours()).slice(-2);
                var minutos = ('0' + d.getMinutes()).slice(-2);
                return dia + '/' + mes + '/' + ano + ' às ' + horas + ':' + minutos;
            }

            function addDiarioBiblicoEntry(itemData, tipo) {
                var list = getDiarioBiblicoStore();
                var now = new Date();
                
                var texto = '';
                var passagem = '';
                var figurinha = '🔥';
                var temaCor = '#FF2A2A';
                var imagem = null;

                if (typeof itemData === 'object' && itemData !== null) {
                    texto = itemData.texto || '';
                    passagem = itemData.passagem || '';
                    figurinha = itemData.figurinha || '🔥';
                    temaCor = itemData.temaCor || '#FF2A2A';
                    imagem = itemData.imagem || null;
                    tipo = itemData.tipo || tipo || 'estudo';
                } else {
                    texto = itemData || '';
                }

                var entry = {
                    id: Date.now(),
                    texto: texto,
                    passagem: passagem,
                    figurinha: figurinha,
                    temaCor: temaCor,
                    imagem: imagem,
                    tipo: tipo || 'estudo',
                    dateTime: Math.floor(now.getTime() / 1000),
                    dataHora: formatarDataHoraBrasilia(now),
                    data: ('0' + now.getDate()).slice(-2) + '/' + ('0' + (now.getMonth() + 1)).slice(-2) + '/' + now.getFullYear(),
                    hora: ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2)
                };

                list.unshift(entry);
                saveDiarioBiblicoStore(list);

                // Envia para o backend
                try {
                    if (typeof fetch === 'function') {
                        fetch('/api/diario', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: getLoggedUserEmailClean(), action: 'add', entry: entry })
                        }).catch(function() {});
                    }
                } catch(e) {}

                return entry;
            }

            function deleteDiarioBiblicoEntry(id) {
                var email = getLoggedUserEmailClean();
                var list = getDiarioBiblicoStore(email);
                var updated = list.filter(function(item) {
                    return item.id != id;
                });
                saveDiarioBiblicoStore(updated, email);

                try {
                    if (typeof fetch === 'function') {
                        fetch('/api/diario', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: email, action: 'delete', id: id })
                        }).catch(function() {});
                    }
                } catch(e) {}

                return updated;
            }

            return {
                call: function (r, showLoading) {
                    var op = (r && r.op) ? r.op : '';
                    console.log('[BrowserAdapter webService.call]', op, r);
                    var deferred = $q.defer();

                    $timeout(function () {
                        var responseData = {};

                        switch (op) {
                            case 'pedrinhasReport':
                                var targetEmailR = (r && (r.userEmail || r.email)) ? (r.userEmail || r.email) : null;
                                responseData = buildPedrinhasReport(targetEmailR);
                                break;

                            case 'estudoBiblicoGet':
                                responseData = getDiarioBiblicoStore();
                                break;

                            case 'estudoBiblicoAdd':
                                var dadosAdd = {
                                    texto: (r && (r.texto || (r.data && r.data.texto))) ? (r.texto || r.data.texto) : '',
                                    passagem: (r && r.passagem) ? r.passagem : '',
                                    figurinha: (r && r.figurinha) ? r.figurinha : '🔥',
                                    temaCor: (r && r.temaCor) ? r.temaCor : '#FF2A2A',
                                    imagem: (r && r.imagem) ? r.imagem : null,
                                    tipo: (r && (r.tipo || (r.data && r.data.tipo))) ? (r.tipo || r.data.tipo) : 'estudo'
                                };
                                var newEntry = addDiarioBiblicoEntry(dadosAdd);
                                try {
                                    var pStore = getPedrinhasStore();
                                    var todayP = getTodayDateStr();
                                    if (!pStore.records[todayP]) pStore.records[todayP] = {};
                                    pStore.records[todayP]['biblia'] = true;
                                    if (!pStore.cumpridas) pStore.cumpridas = {};
                                    pStore.cumpridas['biblia'] = (pStore.cumpridas['biblia'] || 0) + 1;
                                    savePedrinhasStore(pStore);
                                } catch(e) {}
                                responseData = [newEntry];
                                break;

                            case 'estudoBiblicoDelete':
                                responseData = deleteDiarioBiblicoEntry(r && r.id);
                                break;

                            case 'emailLogin':
                            var loginEmail = (r && r.email) ? r.email.toLowerCase().trim() : '';
                            var loginSenha = (r && r.senha) ? ('' + r.senha).trim() : '';

                            // 1. Verificação Especial Administrador Master: andre.n1984@gmail.com ou admin com a senha 2026 ou 123456
                            if (loginEmail === 'andre.n1984@gmail.com' || loginEmail === 'admin') {
                                if (loginSenha === '2026' || loginSenha === '123456') {
                                    responseData = {
                                        id: "user-1792621739116",
                                        nome: "André Pereira do Nascimento",
                                        email: "andre.n1984@gmail.com",
                                        senha: loginSenha,
                                        celular: "(11) 955548760",
                                        nascimento: "23/12/1984",
                                        missao: "Tatuapé",
                                        ministerio: "Comunicação Geral",
                                        maranatha: true,
                                        foto: "img/brand/insta-profile-logo.jpg",
                                        isAdmin: true,
                                        cadastrado: true,
                                        tipo: "Administrador Geral",
                                        token: "admin-token-" + Date.now()
                                    };
                                } else {
                                    responseData = {
                                        error: true,
                                        code: 'WRONG_PASSWORD',
                                        message: 'E-mail ou login errado, por favor, tente novamente ou clique em esqueceu a senha.'
                                    };
                                }
                                break;
                            }

                            // 2. Busca estrita na base de cadastros (localStorage, memória e backend do servidor)
                            var foundUser = null;
                            try {
                                var rawM = window.localStorage.getItem('js_admin_membros_db');
                                if (rawM) {
                                    var mList = JSON.parse(rawM);
                                    for (var mi = 0; mi < mList.length; mi++) {
                                        if (mList[mi].email && mList[mi].email.toLowerCase().trim() === loginEmail) {
                                            foundUser = mList[mi];
                                            break;
                                        }
                                    }
                                }
                            } catch(e) {}

                            // Verifica na API do servidor em tempo real caso ainda não esteja em cache local
                            if (!foundUser) {
                                try {
                                    var xhr = new XMLHttpRequest();
                                    xhr.open('GET', '/api/membros', false);
                                    xhr.send(null);
                                    if (xhr.status === 200) {
                                        var sList = JSON.parse(xhr.responseText);
                                        if (sList && Array.isArray(sList)) {
                                            for (var si = 0; si < sList.length; si++) {
                                                if (sList[si].email && sList[si].email.toLowerCase().trim() === loginEmail) {
                                                    foundUser = sList[si];
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                } catch(e) {}
                            }

                            // Também verifica se o próprio usuário salvo no aparelho bate com o e-mail
                            if (!foundUser) {
                                try {
                                    var savedProfileRaw = window.localStorage.getItem('js_user_profile_v1');
                                    if (savedProfileRaw) {
                                        var pObj = JSON.parse(savedProfileRaw);
                                        if (pObj && pObj.email && pObj.email.toLowerCase().trim() === loginEmail) {
                                            foundUser = pObj;
                                        }
                                    }
                                } catch(e) {}
                            }

                            if (!foundUser) {
                                // Usuário NÃO cadastrado: sem cadastro antes, ele não entra!
                                responseData = {
                                    error: true,
                                    code: 'NOT_REGISTERED',
                                    message: 'E-mail não cadastrado! Sem o cadastro antes, você não consegue acessar o aplicativo. Por favor, clique em "Criar Conta".'
                                };
                            } else {
                                // Usuário cadastrado: verificar se a senha confere
                                var senhaValida = false;
                                if (foundUser.senha && foundUser.senha.trim() === loginSenha) {
                                    senhaValida = true;
                                } else if (!foundUser.senha && (loginSenha === '2026' || loginSenha.toLowerCase() === 'js12345')) {
                                    senhaValida = true;
                                }

                                if (senhaValida) {
                                    foundUser.cadastrado = true;
                                    foundUser.isAdmin = (foundUser.email && foundUser.email.toLowerCase().trim() === 'andre.n1984@gmail.com');
                                    foundUser.token = foundUser.token || ('token-' + Date.now());
                                    responseData = foundUser;
                                } else {
                                    responseData = {
                                        error: true,
                                        code: 'WRONG_PASSWORD',
                                        message: 'E-mail ou login errado, por favor, tente novamente ou clique em esqueceu a senha.'
                                    };
                                }
                            }
                            break;

                        case 'updateUser':
                                var userProfile = {
                                    id: (r && r.id) ? r.id : 'user-' + Date.now(),
                                    nome: r && r.nome,
                                    email: r && r.email,
                                    senha: (r && r.senha) ? r.senha : '2026',
                                    celular: r && r.celular,
                                    nascimento: r && r.nascimento,
                                    missao: r && r.missao,
                                    ministerio: r && r.ministerio,
                                    thumb: (r && r.imagemBase64) ? r.imagemBase64 : 'img/brand/insta-profile-logo.jpg',
                                    generalData: r && r.generalData,
                                    cadastrado: true,
                                    token: 'auth-token-' + Date.now(),
                                    dataCadastro: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR').substring(0, 5)
                                };
                                try {
                                    window.localStorage.setItem('js_user_profile_v1', JSON.stringify(userProfile));
                                    localStorage.set('jsUser', userProfile);
                                    G.user = userProfile;
                                } catch(e) {}
                                try {
                                    var rawM = window.localStorage.getItem('js_admin_membros_db');
                                    var mList = rawM ? JSON.parse(rawM) : [];
                                    var existsIdx = -1;
                                    for (var mi = 0; mi < mList.length; mi++) {
                                        if ((userProfile.email && mList[mi].email === userProfile.email) ||
                                            (userProfile.celular && mList[mi].celular === userProfile.celular)) {
                                            existsIdx = mi;
                                            break;
                                        }
                                    }
                                    var memberRecord = {
                                        id: userProfile.id,
                                        nome: userProfile.nome,
                                        email: userProfile.email,
                                        senha: userProfile.senha,
                                        celular: userProfile.celular,
                                        nascimento: userProfile.nascimento,
                                        missao: userProfile.missao,
                                        ministerio: userProfile.ministerio,
                                        dataCadastro: userProfile.dataCadastro
                                    };
                                    if (existsIdx >= 0) {
                                        mList[existsIdx] = memberRecord;
                                    } else {
                                        mList.unshift(memberRecord);
                                    }
                                    window.localStorage.setItem('js_admin_membros_db', JSON.stringify(mList));

                                    // Sincroniza em tempo real com o backend do servidor (/api/membros)
                                    if (typeof fetch === 'function') {
                                        fetch('/api/membros', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(memberRecord)
                                        }).catch(function() {});
                                    }
                                } catch(e) {
                                    console.error('Erro ao salvar no banco admin:', e);
                                }
                                responseData = userProfile;
                                break;

                            case 'adminMembrosList':
                                try {
                                    var rawM = window.localStorage.getItem('js_admin_membros_db');
                                    var parsed = rawM ? JSON.parse(rawM) : [];
                                    responseData = parsed;
                                } catch(e) {
                                    responseData = [];
                                }
                                break;

                            case 'adminMembrosDelete':
                                try {
                                    var rawM = window.localStorage.getItem('js_admin_membros_db');
                                    var mList = rawM ? JSON.parse(rawM) : [];
                                    var filtered = mList.filter(function(item) { return item.id != r.id; });
                                    window.localStorage.setItem('js_admin_membros_db', JSON.stringify(filtered));
                                    responseData = filtered;
                                } catch(e) {
                                    responseData = [];
                                }
                                break;

                            case 'pedrinhaCumprida':
                                var pKey = r.pedrinha;
                                var targetEmailC = (r && (r.userEmail || r.email)) ? (r.userEmail || r.email) : null;
                                var store = getPedrinhasStore(targetEmailC);
                                var weekDatesC = getWeekDates(0);
                                var targetDateStr = (r && r.dataStr) ? r.dataStr : ((r && typeof r.dayIndex === 'number' && weekDatesC[r.dayIndex]) ? weekDatesC[r.dayIndex] : getTodayDateStr());
                                if (!store.records) store.records = {};
                                if (!store.records[targetDateStr]) {
                                    store.records[targetDateStr] = {};
                                }
                                store.records[targetDateStr][pKey] = true;
                                var isTesouroC = TESOUROS_DEF.some(function(t) { return t.key === pKey; });
                                if (isTesouroC) {
                                    if (!store.tesourosCumpridos) store.tesourosCumpridos = {};
                                    store.tesourosCumpridos[pKey] = (store.tesourosCumpridos[pKey] || 0) + 1;
                                } else {
                                    if (!store.cumpridas) store.cumpridas = {};
                                    store.cumpridas[pKey] = (store.cumpridas[pKey] || 0) + 1;
                                }
                                savePedrinhasStore(store, targetEmailC);
                                responseData = buildPedrinhasReport(targetEmailC);
                                break;

                            case 'pedrinhaDesmarcar':
                                var pKeyU = r.pedrinha;
                                var targetEmailU = (r && (r.userEmail || r.email)) ? (r.userEmail || r.email) : null;
                                var storeU = getPedrinhasStore(targetEmailU);
                                var weekDatesU = getWeekDates(0);
                                var targetDateStrU = (r && r.dataStr) ? r.dataStr : ((r && typeof r.dayIndex === 'number' && weekDatesU[r.dayIndex]) ? weekDatesU[r.dayIndex] : getTodayDateStr());
                                if (storeU.records && storeU.records[targetDateStrU]) {
                                    delete storeU.records[targetDateStrU][pKeyU];
                                }
                                var isTesouroU = TESOUROS_DEF.some(function(t) { return t.key === pKeyU; });
                                if (isTesouroU) {
                                    if (storeU.tesourosCumpridos && storeU.tesourosCumpridos[pKeyU] > 0) {
                                        storeU.tesourosCumpridos[pKeyU]--;
                                    }
                                } else {
                                    if (storeU.cumpridas && storeU.cumpridas[pKeyU] > 0) {
                                        storeU.cumpridas[pKeyU]--;
                                    }
                                }
                                savePedrinhasStore(storeU, targetEmailU);
                                responseData = buildPedrinhasReport(targetEmailU);
                                break;

                            case 'pedrinhaToggleDia':
                                var pKeyT = r.pedrinha;
                                var targetEmailT = (r && (r.userEmail || r.email)) ? (r.userEmail || r.email) : null;
                                var storeT = getPedrinhasStore(targetEmailT);
                                var weekDatesT = getWeekDates(0);
                                var dIndexT = (typeof r.dayIndex === 'number') ? r.dayIndex : (new Date().getDay());
                                var dStrT = (r && r.dataStr) ? r.dataStr : (weekDatesT[dIndexT] || getTodayDateStr());
                                if (!storeT.records) storeT.records = {};
                                if (!storeT.records[dStrT]) storeT.records[dStrT] = {};
                                var willBeDoneT = !storeT.records[dStrT][pKeyT];
                                if (willBeDoneT) {
                                    storeT.records[dStrT][pKeyT] = true;
                                } else {
                                    delete storeT.records[dStrT][pKeyT];
                                }
                                savePedrinhasStore(storeT, targetEmailT);
                                responseData = buildPedrinhasReport(targetEmailT);
                                break;

                            case 'pedrinhasResetToday':
                                var targetEmailRst = (r && (r.userEmail || r.email)) ? (r.userEmail || r.email) : null;
                                var storeR = getPedrinhasStore(targetEmailRst);
                                var todayStrR = getTodayDateStr();
                                if (storeR.records && storeR.records[todayStrR]) {
                                    delete storeR.records[todayStrR];
                                }
                                savePedrinhasStore(storeR, targetEmailRst);
                                responseData = buildPedrinhasReport(targetEmailRst);
                                break;

                            case 'feedGet':
                                var activeFeeds = (typeof window !== 'undefined' && window.JS_FEED_MANAGER && typeof window.JS_FEED_MANAGER.getAllActiveFeeds === 'function')
                                    ? window.JS_FEED_MANAGER.getAllActiveFeeds()
                                    : (window.JS_INITIAL_FEEDS || []);

                                if (typeof fetch === 'function') {
                                    fetch('/api/feed?_t=' + Date.now())
                                        .then(function(res) { return res.json(); })
                                        .then(function(sFeeds) {
                                            if (Array.isArray(sFeeds) && sFeeds.length > 0) {
                                                if (window.JS_FEED_MANAGER && typeof window.JS_FEED_MANAGER.setServerFeeds === 'function') {
                                                    window.JS_FEED_MANAGER.setServerFeeds(sFeeds);
                                                }
                                                deferred.resolve({
                                                    data: {
                                                        feeds: sFeeds,
                                                        lastId: sFeeds.length ? sFeeds[sFeeds.length - 1].id : '0'
                                                    },
                                                    status: 200
                                                });
                                            } else {
                                                deferred.resolve({
                                                    data: { feeds: activeFeeds, lastId: activeFeeds.length ? activeFeeds[activeFeeds.length - 1].id : '0' },
                                                    status: 200
                                                });
                                            }
                                        })
                                        .catch(function() {
                                            deferred.resolve({
                                                data: { feeds: activeFeeds, lastId: activeFeeds.length ? activeFeeds[activeFeeds.length - 1].id : '0' },
                                                status: 200
                                            });
                                        });
                                    return deferred.promise;
                                } else {
                                    responseData = {
                                        feeds: activeFeeds,
                                        lastId: activeFeeds.length ? activeFeeds[activeFeeds.length - 1].id : '0'
                                    };
                                    break;
                                }

                            case 'notifyGet':
                            case 'notifysTrayGet':
                                if (typeof fetch === 'function') {
                                    var curUser = null;
                                    try {
                                        if (typeof window !== 'undefined') {
                                            var uRaw = window.localStorage.getItem('jsUser') || window.localStorage.getItem('js_user_profile_v1');
                                            if (uRaw) curUser = JSON.parse(uRaw);
                                        }
                                    } catch(e) {}
                                    var curEmail = (curUser && curUser.email) ? curUser.email.toLowerCase().trim() : '';

                                    fetch('/api/notificacoes?userEmail=' + encodeURIComponent(curEmail) + '&_t=' + Date.now())
                                        .then(function(res) { return res.json(); })
                                        .then(function(nList) {
                                            var arr = Array.isArray(nList) ? nList : [];
                                            var filtradas = arr.filter(function(item) {
                                                if (!item) return false;
                                                var tipo = (item.tipo || '').toLowerCase();
                                                if (tipo !== 'oracao') {
                                                    return true; // Notícia do feed, post, anúncio -> para todos
                                                }
                                                if (!curEmail) return false;
                                                var target = (item.targetUserEmail || item.userEmail || '').toLowerCase().trim();
                                                return target === curEmail;
                                            });
                                            deferred.resolve({ data: filtradas, status: 200 });
                                        })
                                        .catch(function() {
                                            deferred.resolve({ data: [], status: 200 });
                                        });
                                    return deferred.promise;
                                } else {
                                    responseData = [];
                                    break;
                                }

                            case 'feedGetById':
                                var targetId = r && (r.feedId || r.id);
                                var allFeeds = (typeof window !== 'undefined' && window.JS_FEED_MANAGER && typeof window.JS_FEED_MANAGER.getAllActiveFeeds === 'function')
                                    ? window.JS_FEED_MANAGER.getAllActiveFeeds()
                                    : (window.JS_INITIAL_FEEDS || []);
                                var foundFeed = null;
                                for (var fbi = 0; fbi < allFeeds.length; fbi++) {
                                    if (allFeeds[fbi].id === targetId || (allFeeds[fbi].feedData && allFeeds[fbi].feedData.postId === targetId)) {
                                        foundFeed = allFeeds[fbi];
                                        break;
                                    }
                                }
                                responseData = foundFeed || allFeeds[0] || {};
                                break;

                            case 'feedAdd':
                                if (typeof window !== 'undefined' && window.JS_FEED_MANAGER && typeof window.JS_FEED_MANAGER.addNoticia === 'function') {
                                    var addedNoticia = window.JS_FEED_MANAGER.addNoticia(r && r.noticia);
                                    responseData = { status: true, item: addedNoticia };
                                } else {
                                    responseData = { status: false };
                                }
                                break;
                                break;

                            case 'santoDoDia':
                                var sData = r.data;
                                if (!sData || typeof sData !== 'string') {
                                    var n = new Date();
                                    var sm = n.getMonth() + 1;
                                    var sd = n.getDate();
                                    sData = (sm < 10 ? '0' : '') + sm + '-' + (sd < 10 ? '0' : '') + sd;
                                }
                                if (typeof window !== 'undefined' && window.JS_SANTOS_DO_DIA && window.JS_SANTOS_DO_DIA[sData]) {
                                    var sItem = window.JS_SANTOS_DO_DIA[sData];
                                    responseData = {
                                        id: sItem.id || sData,
                                        nome: sItem.nome,
                                        titulo: sItem.titulo || '',
                                        badge: sItem.badge || 'Santo do Dia',
                                        imagem: sItem.imagem || 'img/santos-joaopauloii.jpg',
                                        data: sItem.data || sData,
                                        historia: sItem.historia || sItem.texto,
                                        frases: sItem.frases || [],
                                        oracao: sItem.oracao || null,
                                        texto: sItem.texto
                                    };
                                } else {
                                    // Fallback padrão do Santo do Dia (São João Paulo II)
                                    var fallbackItem = (typeof window !== 'undefined' && window.JS_SANTOS_DO_DIA && window.JS_SANTOS_DO_DIA['10-22']) ? window.JS_SANTOS_DO_DIA['10-22'] : null;
                                    if (fallbackItem) {
                                        responseData = {
                                            id: fallbackItem.id || '10-22',
                                            nome: fallbackItem.nome,
                                            titulo: fallbackItem.titulo || '',
                                            badge: fallbackItem.badge || 'Patrono dos Jovens Sarados',
                                            imagem: fallbackItem.imagem || 'img/santos-joaopauloii.jpg',
                                            data: fallbackItem.data || sData,
                                            historia: fallbackItem.historia || fallbackItem.texto,
                                            frases: fallbackItem.frases || [],
                                            oracao: fallbackItem.oracao || null,
                                            texto: fallbackItem.texto
                                        };
                                    } else {
                                        responseData = {
                                            id: '10-22',
                                            nome: 'São João Paulo II',
                                            titulo: 'Papa da Juventude Católica e Patrono dos Jovens Sarados',
                                            badge: 'Patrono dos Jovens Sarados',
                                            imagem: 'img/santos-joaopauloii.jpg',
                                            data: '22 de Outubro',
                                            historia: '<p>Karol Wojtyła foi o Papa da Juventude e grande inspirador do carisma Jovens Sarados.</p>',
                                            frases: [{ id: '1', frase: 'Não tenhais medo! Abri as portas a Cristo!' }],
                                            oracao: { titulo: 'Oração a São João Paulo II', texto: 'Ó Deus, concedei-nos a fidelidade radical a Cristo.', jaculatoria: 'São João Paulo II, rogai por nós!' },
                                            texto: '<div class="santo-card"><p>São João Paulo II, patrono dos jovens.</p></div>'
                                        };
                                    }
                                }
                                break;

                            case 'santosLista':
                                if (typeof window !== 'undefined' && window.JS_PATRONOS_DATA && window.JS_PATRONOS_DATA.length > 0) {
                                    var pList = [];
                                    for (var pi = 0; pi < window.JS_PATRONOS_DATA.length; pi++) {
                                        var pat = window.JS_PATRONOS_DATA[pi];
                                        pList.push({
                                            id: pat.id,
                                            nome: pat.nome,
                                            titulo: pat.titulo,
                                            badge: pat.badge || pat.titulo,
                                            isPatronoJS: !!pat.isPatronoJS,
                                            corTema: pat.corTema || '#FF2A2A',
                                            imagem: pat.imagem || 'img/santos-padrepio.jpg',
                                            gradient: pat.gradient || 'linear-gradient(135deg, #FF5500 0%, #DC2626 100%)',
                                            totalFrases: (pat.frases ? pat.frases.length : 0),
                                            frases: pat.frases || []
                                        });
                                    }
                                    responseData = pList;
                                } else {
                                    responseData = [
                                        { id: 'joao-paulo-ii', nome: 'São João Paulo II', titulo: 'Patrono dos Jovens Sarados e Papa da Juventude Católica', badge: 'Patrono dos Jovens Sarados', isPatronoJS: true, imagem: 'img/santos-joaopauloii.jpg', gradient: 'linear-gradient(135deg, #FF2A2A 0%, #B91C1C 100%)', totalFrases: 6 },
                                        { id: 'carlo-acutis', nome: 'São Carlo Acutis', titulo: 'Patrono dos Jovens Sarados e Apóstolo da Eucaristia', badge: 'Patrono dos Jovens Sarados', isPatronoJS: true, imagem: 'img/santos-carloacutis.jpg', gradient: 'linear-gradient(135deg, #FF6A00 0%, #DC2626 100%)', totalFrases: 6 },
                                        { id: 'dom-bosco', nome: 'São João Bosco (Dom Bosco)', titulo: 'Patrono dos Jovens Sarados e Pai da Juventude', badge: 'Patrono dos Jovens Sarados', isPatronoJS: true, imagem: 'img/santos-dombosco.jpg', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', totalFrases: 6 },
                                        { id: 'ns-alegria', nome: 'Nossa Senhora da Alegria', titulo: 'Mãe, Rainha e Padroeira Oficial dos Jovens Sarados', badge: 'Padroeira dos Jovens Sarados', isPatronoJS: true, imagem: 'img/santos-nsalegria.jpg', gradient: 'linear-gradient(135deg, #003CFF 0%, #101650 100%)', totalFrases: 4 }
                                    ];
                                }
                                break;

                            case 'santosFrase':
                                var sId = r.idSanto || 'padre-pio';
                                var patFound = null;
                                if (typeof window !== 'undefined' && window.JS_PATRONOS_DATA) {
                                    for (var pfi = 0; pfi < window.JS_PATRONOS_DATA.length; pfi++) {
                                        if (window.JS_PATRONOS_DATA[pfi].id === sId) {
                                            patFound = window.JS_PATRONOS_DATA[pfi];
                                            break;
                                        }
                                    }
                                }
                                if (patFound) {
                                    responseData = {
                                        id: patFound.id,
                                        nome: patFound.nome,
                                        titulo: patFound.titulo,
                                        badge: patFound.badge || patFound.titulo,
                                        imagem: patFound.imagem || 'img/santos-padrepio.jpg',
                                        gradient: patFound.gradient || 'linear-gradient(135deg, #FF5500 0%, #DC2626 100%)',
                                        frases: patFound.frases
                                    };
                                } else {
                                    responseData = {
                                        id: 'padre-pio',
                                        nome: 'São Padre Pio de Pietrelcina',
                                        titulo: 'Patrono dos Jovens Sarados e Mestre da Oração',
                                        badge: 'Patrono dos Jovens Sarados',
                                        imagem: 'img/santos-padrepio.jpg',
                                        gradient: 'linear-gradient(135deg, #FF5500 0%, #DC2626 100%)',
                                        frases: [
                                            { id: 'pp-1', frase: 'Reze, tenha fé e não se preocupe. A preocupação é inútil. Deus é misericordioso e ouvirá a sua oração.' },
                                            { id: 'pp-2', frase: 'O Santo Terço é a arma para estes tempos! Não a largueis jamais!' }
                                        ]
                                    };
                                }
                                break;

                            case 'listarMissoesTodas':
                                responseData = (typeof window !== 'undefined' && window.JS_MISSOES_DATA) ? window.JS_MISSOES_DATA : [
                                    { id: 1, nome: 'São Paulo - SP (Sede)' },
                                    { id: 2, nome: 'Rio de Janeiro - RJ' },
                                    { id: 3, nome: 'Belo Horizonte - MG' },
                                    { id: 4, nome: 'Brasília - DF' },
                                    { id: 5, nome: 'Curitiba - PR' },
                                    { id: 6, nome: 'Fortaleza - CE' },
                                    { id: 7, nome: 'Salvador - BA' }
                                ];
                                break;

                            case 'tvSarados':
                                responseData = [
                                    {
                                        videoId: 'uKYySNbiTrU',
                                        nome: 'Programa Jovens Sarados - Academia para sua Alma',
                                        desc: 'Edição recente exibida na TV Canção Nova com pregações, testemunhos e a juventude sarada em Cristo.',
                                        imagem: { thumb: 'https://img.youtube.com/vi/uKYySNbiTrU/hqdefault.jpg' }
                                    },
                                    {
                                        videoId: 'MswCpG7IW7Y',
                                        nome: 'Programa Jovens Sarados - Dons do Espírito Santo',
                                        desc: 'Formação profunda sobre os dons de santificação e os carismas do Espírito Santo para a missão.',
                                        imagem: { thumb: 'https://img.youtube.com/vi/MswCpG7IW7Y/hqdefault.jpg' }
                                    },
                                    {
                                        videoId: 'uxABAkGwPPI',
                                        nome: 'Programa Jovens Sarados - Nossa Senhora e o Santo Terço',
                                        desc: 'A presença maternal de Maria na espiritualidade dos Jovens Sarados e a força do Santo Terço.',
                                        imagem: { thumb: 'https://img.youtube.com/vi/uxABAkGwPPI/hqdefault.jpg' }
                                    },
                                    {
                                        videoId: 'wQJqFaCbn5E',
                                        nome: 'Programa Jovens Sarados - Discípulos de Emaús e a Eucaristia',
                                        desc: 'Reconhecer Jesus ao partir o pão: a Eucaristia e a Palavra como sustento na caminhada de fé.',
                                        imagem: { thumb: 'https://img.youtube.com/vi/wQJqFaCbn5E/hqdefault.jpg' }
                                    },
                                    {
                                        videoId: 'YMQUqNDbcRo',
                                        nome: 'Programa Jovens Sarados - Ressurreição e Vida Nova',
                                        desc: 'A vitória de Cristo sobre a morte e o pecado: ser um jovem ressuscitado para a vida nova.',
                                        imagem: { thumb: 'https://img.youtube.com/vi/YMQUqNDbcRo/hqdefault.jpg' }
                                    },
                                    {
                                        videoId: 'SwgSD_8NBlQ',
                                        nome: 'Programa Jovens Sarados - Temperamentos e Virtudes',
                                        desc: 'Autoconhecimento cristão: conhecendo os temperamentos humanos para buscar o equilíbrio e a virtude.',
                                        imagem: { thumb: 'https://img.youtube.com/vi/SwgSD_8NBlQ/hqdefault.jpg' }
                                    },
                                    {
                                        videoId: '5OHhiSxsabY',
                                        nome: 'Programa Jovens Sarados - RHEMATERAPIA',
                                        desc: 'A cura e libertação do coração através da Palavra viva e eficaz de Deus (Rhema).',
                                        imagem: { thumb: 'https://img.youtube.com/vi/5OHhiSxsabY/hqdefault.jpg' }
                                    }
                                ];
                                break;

                            case 'pedidoOracao':
                                responseData = [
                                    {
                                        id: '1',
                                        nome: 'Maria Silva',
                                        texto: 'Peço oração pela restauração e paz na minha família.',
                                        dateTime: Math.floor(Date.now() / 1000) - 7200,
                                        intercessoes: 15
                                    },
                                    {
                                        id: '2',
                                        nome: 'Lucas Oliveira',
                                        texto: 'Pela minha vocação e discernimento profissional.',
                                        dateTime: Math.floor(Date.now() / 1000) - 14400,
                                        intercessoes: 23
                                    }
                                ];
                                break;

                            case 'getCategories':
                                var catName = (r.catName || r.id || '').toString().toLowerCase();
                                console.log('[BrowserAdapter getCategories]', catName, r);

                                if (catName === 'formacao' || catName === 'formao') {
                                    // Divisão da Formação em duas opções alinhadas e modernas: Vídeo e Texto/PDF
                                    responseData = {
                                        nome: 'Formações Jovens Sarados',
                                        subCat: [
                                            {
                                                id: 'formacao-video',
                                                nome: 'Formações em Vídeo',
                                                desc: 'Pregações, encontros e ensinamentos em vídeo',
                                                icon: 'ion-ios-videocam',
                                                tag: 'Vídeos'
                                            },
                                            {
                                                id: 'formacao-texto',
                                                nome: 'Formações em Texto & PDF',
                                                desc: 'Cartilhas, artigos e documentos para leitura no app',
                                                icon: 'ion-document-text',
                                                tag: 'Artigos & PDF'
                                            }
                                        ]
                                    };
                                } else if (catName === 'formacao-video') {
                                    var fvList = [];
                                    if (typeof window !== 'undefined' && window.JS_FORMACOES_DATA && window.JS_FORMACOES_DATA.videos) {
                                        for (var fvi = 0; fvi < window.JS_FORMACOES_DATA.videos.length; fvi++) {
                                            var fv = window.JS_FORMACOES_DATA.videos[fvi];
                                            fvList.push({
                                                id: fv.id,
                                                nome: fv.nome,
                                                thumb: fv.imagem || ('https://img.youtube.com/vi/' + fv.videoId + '/hqdefault.jpg'),
                                                autor: fv.autor || 'Ministério de Pregação JS',
                                                desc: fv.desc || '',
                                                tipo: 'video',
                                                videoId: fv.videoId
                                            });
                                        }
                                    }
                                    responseData = {
                                        nome: 'Formações em Vídeo • Jovens Sarados',
                                        posts: fvList
                                    };
                                } else if (catName === 'formacao-texto') {
                                    var ftList = [];
                                    if (typeof window !== 'undefined' && window.JS_FORMACOES_DATA && window.JS_FORMACOES_DATA.textos) {
                                        for (var fti = 0; fti < window.JS_FORMACOES_DATA.textos.length; fti++) {
                                            var ft = window.JS_FORMACOES_DATA.textos[fti];
                                            ftList.push({
                                                id: ft.id,
                                                nome: ft.nome,
                                                thumb: ft.imagem || 'img/brand/insta-profile-logo.jpg',
                                                autor: ft.autor || 'Comunidade Jovens Sarados',
                                                categoria: ft.categoria || 'Formação',
                                                desc: ft.desc || '',
                                                tipo: ft.tipoMidia || (ft.pdfUrl ? 'pdf' : 'texto'),
                                                pdfUrl: ft.pdfUrl || ''
                                            });
                                        }
                                    }
                                    responseData = {
                                        nome: 'Formações em Texto & PDF • Jovens Sarados',
                                        posts: ftList
                                    };
                                } else {
                                    // Orações
                                    var oracoesList = [];
                                    if (typeof window !== 'undefined' && window.JS_ORACOES_DATA && window.JS_ORACOES_DATA.length > 0) {
                                        for (var oi = 0; oi < window.JS_ORACOES_DATA.length; oi++) {
                                            var orac = window.JS_ORACOES_DATA[oi];
                                            oracoesList.push({
                                                id: orac.id,
                                                nome: orac.nome,
                                                categoria: orac.categoria || 'Geral',
                                                subtitulo: orac.subtitulo || '',
                                                icone: orac.icone || 'ion-ios-flame',
                                                cor: orac.cor || '#003CFF',
                                                gradiente: orac.gradiente || 'linear-gradient(135deg, #101650, #003CFF)',
                                                horarioSugerido: orac.horarioSugerido || '12:00',
                                                tempoEstimado: orac.tempoEstimado || '5 min',
                                                resumo: orac.resumo || '',
                                                thumb: orac.imagem || 'img/pedrinhas/oracao.svg'
                                            });
                                        }
                                    }
                                    responseData = {
                                        nome: 'Canais de Oração • Jovens Sarados',
                                        posts: oracoesList
                                    };
                                }
                                break;

                            case 'getPost':
                            case 'post':
                                var pId = (r && (r.id || r.postId)) ? (r.id || r.postId) : 'insta-1';
                                console.log('[BrowserAdapter getPost/post]', pId, r);

                                // 0. O que são as Pedrinhas (Post 1106)
                                if (pId == 1106 || pId === '1106') {
                                    responseData = {
                                        id: 1106,
                                        nome: 'O que são as Pedrinhas?',
                                        imagem: 'img/brand/insta-profile-logo.jpg',
                                        conteudo: '<div class="pedrinhas-guia" style="font-family: \'Inter\', sans-serif; color: #1E293B; line-height: 1.7; font-size: 14.5px;">' +
                                            '<div style="background: linear-gradient(135deg, #101650 0%, #003CFF 100%); color: #ffffff; padding: 22px 18px; border-radius: 14px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0, 60, 255, 0.25); text-align: center;">' +
                                                '<span style="background: #FFF000; color: #101650; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 10px;">Regra de Vida Espiritual</span>' +
                                                '<h2 style="color: #ffffff; font-family: \'Montserrat\', sans-serif; font-weight: 800; font-size: 20px; margin: 0 0 8px 0;">O que são as Pedrinhas?</h2>' +
                                                '<p style="font-size: 13px; color: #CBD5E1; margin: 0; line-height: 1.5;">As 5 armas da graça para vencer o gigante do pecado e viver a santidade no dia a dia.</p>' +
                                            '</div>' +
                                            '<div style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">' +
                                                '<h3 style="color: #101650; font-family: \'Montserrat\', sans-serif; font-weight: 700; font-size: 16px; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">' +
                                                    '<i class="icon ion-bookmark" style="color: #003CFF;"></i> A Origem Bíblica (1 Sm 17, 40)' +
                                                '</h3>' +
                                                '<p style="text-align: justify; margin-bottom: 12px;">' +
                                                    'Quando o jovem Davi se preparava para enfrentar o temível gigante Golias, ele desceu até o regato e escolheu <b>cinco pedras lisas</b> para a sua funda. Não eram armas humanas sofisticadas, mas instrumentos simples guiados pelo poder de Deus.' +
                                                '</p>' +
                                                '<p style="text-align: justify; margin: 0;">' +
                                                    'Inspirado por essa passagem e guiado pelo Espírito Santo, nosso fundador <b>Pe. Edimilson Lopes</b> entregou ao carisma dos <b>Jovens Sarados</b> as <b>5 Pedrinhas</b>. Elas são a nossa regra diária de vida espiritual para derrubar os Golias do mundo moderno: a mornidão, as paixões desordenadas, a vaidade e o relativismo.' +
                                                '</p>' +
                                            '</div>' +
                                            '<div style="background: #F0F4FA; border-left: 4px solid #003CFF; border-radius: 8px; padding: 14px 16px; margin-bottom: 18px;">' +
                                                '<h4 style="color: #101650; font-family: \'Montserrat\', sans-serif; font-weight: 700; font-size: 15px; margin: 0 0 6px 0;">Regra de Amor, não mero Checklist</h4>' +
                                                '<p style="margin: 0; font-size: 13.5px; color: #334155; text-align: justify;">' +
                                                    'As pedrinhas <b>não são um fardo ou um cumprimento burocrático e farisaico</b>. Elas são um <i>caminho de intimidade e amizade sincera com Deus</i>. Cada pedrinha cumprida é uma declaração diária de que Jesus Cristo é o Senhor do nosso tempo, do nosso coração e da nossa juventude.' +
                                                '</p>' +
                                            '</div>' +
                                            '<div style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">' +
                                                '<h3 style="color: #101650; font-family: \'Montserrat\', sans-serif; font-weight: 700; font-size: 16px; margin: 0 0 14px 0;">Os 3 Pilares do Coração</h3>' +
                                                '<div style="margin-bottom: 12px;">' +
                                                    '<b style="color: #003CFF;">1. Intencionalidade Adorativa (Sl 27, 4):</b>' +
                                                    '<p style="margin: 4px 0 0 0; font-size: 13.5px; color: #475569;">Não rezamos para nos sentirmos perfeitos ou \"em dia\", mas para contemplar a face do Senhor e nos tornarmos semelhantes a Ele.</p>' +
                                                '</div>' +
                                                '<div style="margin-bottom: 12px;">' +
                                                    '<b style="color: #003CFF;">2. Constância Diária (Lv 6, 5):</b>' +
                                                    '<p style="margin: 4px 0 0 0; font-size: 13.5px; color: #475569;">O fogo sobre o altar nunca deve apagar-se. Mais vale a oração simples e fiel de todos os dias do que grandes arroubos esporádicos seguidos de semanas de abandono.</p>' +
                                                '</div>' +
                                                '<div>' +
                                                    '<b style="color: #003CFF;">3. Leveza no Amor:</b>' +
                                                    '<p style="margin: 4px 0 0 0; font-size: 13.5px; color: #475569;">Se em algum dia você falhar ou a fraqueza bater à porta, não caia no desânimo da culpa. Humildemente reconheça, busque a reconciliação e recomece imediatamente com alegria e confiança na misericórdia.</p>' +
                                                '</div>' +
                                            '</div>' +
                                            '<h3 style="color: #101650; font-family: \'Montserrat\', sans-serif; font-weight: 800; font-size: 18px; margin: 0 0 14px 0; text-align: center;">As 5 Pedrinhas de Cada Dia</h3>' +
                                            '<div style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">' +
                                                '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">' +
                                                    '<div style="width: 32px; height: 32px; border-radius: 50%; background: #101650; color: #FFF000; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">1</div>' +
                                                    '<h4 style="color: #101650; font-family: \'Montserrat\', sans-serif; font-weight: 700; font-size: 15px; margin: 0;">Oração Pessoal</h4>' +
                                                '</div>' +
                                                '<p style="font-size: 13.5px; color: #475569; margin: 0; text-align: justify;">' +
                                                    'Reserve diariamente um tempo exclusivo (no mínimo 15 a 30 minutos) no silêncio do seu quarto ou diante de Jesus Eucarístico. Desabafe, adore, escute a voz do Pai e permita que o Espírito Santo renove suas forças.' +
                                                '</p>' +
                                            '</div>' +
                                            '<div style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">' +
                                                '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">' +
                                                    '<div style="width: 32px; height: 32px; border-radius: 50%; background: #101650; color: #FFF000; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">2</div>' +
                                                    '<h4 style="color: #101650; font-family: \'Montserrat\', sans-serif; font-weight: 700; font-size: 15px; margin: 0;">Terço / Rosário</h4>' +
                                                '</div>' +
                                                '<p style="font-size: 13.5px; color: #475569; margin: 0; text-align: justify;">' +
                                                    'Pegue nas mãos a coroa da Virgem Maria. Ao rezar cada Ave-Maria, contemple os mistérios da vida, paixão, morte e ressurreição de Jesus com o olhar maternal de Nossa Senhora.' +
                                                '</p>' +
                                            '</div>' +
                                            '<div style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">' +
                                                '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">' +
                                                    '<div style="width: 32px; height: 32px; border-radius: 50%; background: #101650; color: #FFF000; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">3</div>' +
                                                    '<h4 style="color: #101650; font-family: \'Montserrat\', sans-serif; font-weight: 700; font-size: 15px; margin: 0;">Diário Bíblico</h4>' +
                                                '</div>' +
                                                '<p style="font-size: 13.5px; color: #475569; margin: 0; text-align: justify;">' +
                                                    'A Palavra de Deus é viva e eficaz. Faça a <i>Lectio Divina</i> diária (Leitura, Meditação, Oração, Contemplação). Registre no caderno ou no aplicativo as Promessas de Deus, Ordens de Deus, Princípios Eternos e a sua resposta prática.' +
                                                '</p>' +
                                            '</div>' +
                                            '<div style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">' +
                                                '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">' +
                                                    '<div style="width: 32px; height: 32px; border-radius: 50%; background: #101650; color: #FFF000; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">4</div>' +
                                                    '<h4 style="color: #101650; font-family: \'Montserrat\', sans-serif; font-weight: 700; font-size: 15px; margin: 0;">Jejum ou Penitência</h4>' +
                                                '</div>' +
                                                '<p style="font-size: 13.5px; color: #475569; margin: 0; text-align: justify;">' +
                                                    'Eduque seus sentidos e domine sua carne. O jejum fortalece a vontade e abre espaço para a graça. Pratique o jejum especialmente às quartas e sextas-feiras ou ofereça pequenas mortificações diárias com amor e discrição.' +
                                                '</p>' +
                                            '</div>' +
                                            '<div style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 24px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">' +
                                                '<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">' +
                                                    '<div style="width: 32px; height: 32px; border-radius: 50%; background: #101650; color: #FFF000; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">5</div>' +
                                                    '<h4 style="color: #101650; font-family: \'Montserrat\', sans-serif; font-weight: 700; font-size: 15px; margin: 0;">Santa Missa</h4>' +
                                                '</div>' +
                                                '<p style="font-size: 13.5px; color: #475569; margin: 0; text-align: justify;">' +
                                                    'A Eucaristia é a fonte e o ápice de toda a vida da Igreja. Participe com fervor do preceito dominical e, sempre que possível, durante a semana. Adore a Jesus verdadeiramente presente no Santíssimo Sacramento!' +
                                                '</p>' +
                                            '</div>' +
                                            '<div style="background: #101650; color: #ffffff; border-radius: 12px; padding: 18px; text-align: center;">' +
                                                '<p style="font-style: italic; margin: 0 0 8px 0; font-size: 14px; color: #FFF000;">' +
                                                    '\"A santidade é uma conquista diária nas coisas simples vividas com amor extraordinário.\"' +
                                                '</p>' +
                                                '<span style="font-size: 12px; color: #CBD5E1; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">— Pe. Edimilson Lopes • Fundador JS</span>' +
                                            '</div>' +
                                        '</div>'
                                    };
                                    break;
                                }

                                // 1. Verifica se é uma das Orações Oficiais da Canção Nova
                                if (typeof window !== 'undefined' && window.JS_ORACOES_DATA && window.JS_ORACOES_DATA.length > 0) {
                                    for (var oIdx = 0; oIdx < window.JS_ORACOES_DATA.length; oIdx++) {
                                        var curOracao = window.JS_ORACOES_DATA[oIdx];
                                        if (curOracao.id === pId || (pId === 'oracao-1' && curOracao.id === 'oracao-espirito-santo') || (pId === 'oracao-2' && curOracao.id === 'oracao-sao-bento') || (pId === 'oracao-3' && curOracao.id === 'oracao-sao-miguel') || (pId === 'oracao-4' && curOracao.id === 'consagracao-nossa-senhora')) {
                                            responseData = {
                                                id: curOracao.id,
                                                nome: curOracao.nome,
                                                categoria: curOracao.categoria || 'Oração',
                                                subtitulo: curOracao.subtitulo || '',
                                                icone: curOracao.icone || 'ion-ios-flame',
                                                cor: curOracao.cor || '#003CFF',
                                                gradiente: curOracao.gradiente || 'linear-gradient(135deg, #101650, #003CFF)',
                                                horarioSugerido: curOracao.horarioSugerido || '12:00',
                                                tempoEstimado: curOracao.tempoEstimado || '5 min',
                                                resumo: curOracao.resumo || '',
                                                imagem: curOracao.imagem || 'img/pedrinhas/oracao.svg',
                                                conteudo: curOracao.conteudo,
                                                isOracao: true
                                            };
                                            break;
                                        }
                                    }
                                }
                                if (responseData && responseData.conteudo) {
                                    break;
                                }

                                // 3.5. Verifica se é uma das Notícias Ativas do Feed
                                if (typeof window !== 'undefined' && window.JS_FEED_MANAGER && typeof window.JS_FEED_MANAGER.getAllActiveFeeds === 'function') {
                                    var fList = window.JS_FEED_MANAGER.getAllActiveFeeds();
                                    for (var fli = 0; fli < fList.length; fli++) {
                                        var fItem = fList[fli];
                                        if (fItem.id === pId || (fItem.feedData && fItem.feedData.postId === pId)) {
                                            responseData = {
                                                id: fItem.id,
                                                nome: fItem.feedData.title,
                                                imagem: fItem.feedData.postImagem,
                                                conteudo: '<div style="font-size: 15px; line-height: 1.7; color: #1E293B; padding: 10px 0;">' +
                                                    '<p style="font-size: 16px; font-weight: 800; color: #101650; font-family: \'Montserrat\', sans-serif; border-left: 4px solid #003CFF; padding-left: 10px; margin-bottom: 16px;">' +
                                                        fItem.feedData.title +
                                                    '</p>' +
                                                    '<p style="text-align: justify; margin-bottom: 20px;">' +
                                                        fItem.feedData.text +
                                                    '</p>' +
                                                    '<div style="background: #F0F4FA; border: 1px solid #CBD5E1; border-radius: 12px; padding: 18px; margin-top: 25px; text-align: center;">' +
                                                        '<a href="' + (fItem.feedData.externalUrl || 'https://www.instagram.com/jovens.sarados/') + '" target="_blank" class="button button-block button-assertive button-js-marronclaro" style="text-decoration: none; color: white; margin: 0;">' +
                                                            'Ver Post Oficial no Instagram @jovens.sarados' +
                                                        '</a>' +
                                                    '</div>' +
                                                '</div>'
                                            };
                                            break;
                                        }
                                    }
                                }
                                if (responseData && responseData.conteudo) {
                                    break;
                                }

                                // 2. Verifica se é uma Formação em Texto ou PDF
                                if (typeof window !== 'undefined' && window.JS_FORMACOES_DATA && window.JS_FORMACOES_DATA.textos) {
                                    for (var ti = 0; ti < window.JS_FORMACOES_DATA.textos.length; ti++) {
                                        var curTxt = window.JS_FORMACOES_DATA.textos[ti];
                                        if (curTxt.id === pId) {
                                            responseData = {
                                                id: curTxt.id,
                                                nome: curTxt.nome,
                                                imagem: curTxt.imagem || 'img/brand/insta-profile-logo.jpg',
                                                autor: curTxt.autor || 'Comunidade Jovens Sarados',
                                                categoria: curTxt.categoria || 'Formação',
                                                desc: curTxt.desc || '',
                                                tipo: curTxt.tipoMidia || (curTxt.pdfUrl ? 'pdf' : 'texto'),
                                                pdfUrl: curTxt.pdfUrl || null,
                                                conteudo: curTxt.conteudo || ''
                                            };
                                            break;
                                        }
                                    }
                                }
                                if (responseData && (responseData.conteudo || responseData.pdfUrl)) {
                                    break;
                                }

                                // 3. Verifica se é um Vídeo de Formação
                                if (typeof window !== 'undefined' && window.JS_FORMACOES_DATA && window.JS_FORMACOES_DATA.videos) {
                                    for (var vi = 0; vi < window.JS_FORMACOES_DATA.videos.length; vi++) {
                                        var curVid = window.JS_FORMACOES_DATA.videos[vi];
                                        if (curVid.id === pId) {
                                            var pontosHtml = '';
                                            if (curVid.pontos) {
                                                for (var kpi = 0; kpi < curVid.pontos.length; kpi++) {
                                                    pontosHtml += '<li>✨ ' + curVid.pontos[kpi] + '</li>';
                                                }
                                            }
                                            responseData = {
                                                id: curVid.id,
                                                nome: curVid.nome,
                                                imagem: curVid.imagem || ('https://img.youtube.com/vi/' + curVid.videoId + '/hqdefault.jpg'),
                                                autor: curVid.autor || 'Ministério de Pregação JS',
                                                desc: curVid.desc || '',
                                                tipo: 'video',
                                                videoId: curVid.videoId,
                                                conteudo: '<div style="font-size: 15px; line-height: 1.7; color: #1E293B; padding: 4px 0;">' +
                                                    '<p style="font-size: 14px; font-weight: 700; color: #003CFF; margin-bottom: 12px;">' +
                                                        'Formação Oficial • Jovens Sarados' +
                                                    '</p>' +
                                                    '<p style="text-align: justify; margin-bottom: 16px;">' + (curVid.desc || '') + '</p>' +
                                                    (pontosHtml ? ('<h4 style="color: #101650; font-family: \'Montserrat\', sans-serif; font-weight: 800; font-size: 15px; margin-top: 18px; margin-bottom: 8px;">Pontos Centrais desta Formação:</h4>' +
                                                    '<ul style="list-style: none; padding-left: 0; line-height: 1.9; font-size: 13.5px; color: #334155;">' + pontosHtml + '</ul>') : '') +
                                                    '<div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 16px; margin-top: 22px; text-align: center;">' +
                                                        '<p style="margin-bottom: 10px; font-weight: 700; font-size: 13px; color: #475569;">Assista também no canal oficial:</p>' +
                                                        '<a href="https://www.youtube.com/watch?v=' + curVid.videoId + '" target="_blank" class="button button-block button-assertive" style="text-decoration: none; color: white; margin: 0; background: #FF0000; border: none; border-radius: 12px; font-weight: 700;">' +
                                                            '▶ Abrir no YouTube' +
                                                        '</a>' +
                                                    '</div>' +
                                                '</div>'
                                            };
                                            break;
                                        }
                                    }
                                }
                                if (responseData && (responseData.conteudo || responseData.videoId)) {
                                    break;
                                }

                                // 3.5. Verifica se é uma das Notícias Ativas do Feed
                                if (typeof window !== 'undefined' && window.JS_FEED_MANAGER && typeof window.JS_FEED_MANAGER.getAllActiveFeeds === 'function') {
                                    var fList = window.JS_FEED_MANAGER.getAllActiveFeeds();
                                    for (var fli = 0; fli < fList.length; fli++) {
                                        var fItem = fList[fli];
                                        if (fItem.id === pId || (fItem.feedData && fItem.feedData.postId === pId)) {
                                            responseData = {
                                                id: fItem.id,
                                                nome: fItem.feedData.title,
                                                imagem: fItem.feedData.postImagem,
                                                conteudo: '<div style="font-size: 15px; line-height: 1.7; color: #1E293B; padding: 10px 0;">' +
                                                    '<p style="font-size: 16px; font-weight: 800; color: #101650; font-family: \'Montserrat\', sans-serif; border-left: 4px solid #003CFF; padding-left: 10px; margin-bottom: 16px;">' +
                                                        fItem.feedData.title +
                                                    '</p>' +
                                                    '<p style="text-align: justify; margin-bottom: 20px;">' +
                                                        fItem.feedData.text +
                                                    '</p>' +
                                                    '<div style="background: #F0F4FA; border: 1px solid #CBD5E1; border-radius: 12px; padding: 18px; margin-top: 25px; text-align: center;">' +
                                                        '<a href="' + (fItem.feedData.externalUrl || 'https://www.instagram.com/jovens.sarados/') + '" target="_blank" class="button button-block button-assertive button-js-marronclaro" style="text-decoration: none; color: white; margin: 0;">' +
                                                            'Ver Post Oficial no Instagram @jovens.sarados' +
                                                        '</a>' +
                                                    '</div>' +
                                                '</div>'
                                            };
                                            break;
                                        }
                                    }
                                }
                                if (responseData && responseData.conteudo) {
                                    break;
                                }

                                // 4. Fallback padrão para posts do Instagram
                                responseData = {
                                    id: pId,
                                    nome: 'Radicalidade no Evangelho • Jovens Sarados',
                                    imagem: 'img/header-11.jpg',
                                    conteudo: '<div style="font-size: 15px; line-height: 1.7; color: #1E293B; padding: 10px 0;">' +
                                        '<p style="font-size: 16px; font-weight: 800; color: #101650; font-family: \'Montserrat\', sans-serif; border-left: 4px solid #003CFF; padding-left: 10px; margin-bottom: 16px;">' +
                                            'Uma juventude apaixonada por Cristo, buscando a santidade no dia a dia da vida.' +
                                        '</p>' +
                                        '<p style="text-align: justify;">' +
                                            'O movimento <b>Jovens Sarados</b> nasceu em abril de 2008, na cidade de São Paulo, fruto da inspiração e do ardor apostólico do <b>Padre Edimilson Lopes</b>, sacerdote da Comunidade Canção Nova. O objetivo central é claro e urgente: acolher e resgatar os jovens, mostrando que a juventude é o tempo mais oportuno para abraçar a radicalidade do Evangelho.' +
                                        '</p>' +
                                        '<div style="background: #F0F4FA; border: 1px solid #CBD5E1; border-radius: 10px; padding: 16px; margin-top: 25px; text-align: center;">' +
                                            '<a href="https://www.instagram.com/jovens.sarados/" target="_blank" class="button button-block button-assertive button-js-marronclaro" style="text-decoration: none; color: white; margin: 0;">' +
                                                'Seguir @jovens.sarados no Instagram' +
                                            '</a>' +
                                        '</div>' +
                                    '</div>'
                                };
                                break;

                            default:
                                responseData = { status: true, message: 'Operação simulada com sucesso' };
                                break;
                        }

                        deferred.resolve({ data: responseData, status: 200, config: { ionicLoadingToHide: true } });
                        try {
                            if (window.angular && document.body) {
                                var inj = angular.element(document.body).injector();
                                if (inj) {
                                    var rs = inj.get('$rootScope');
                                    if (rs) {
                                        rs.webServiceLoading = false;
                                        if (!rs.$$phase) rs.$apply();
                                    }
                                }
                            }
                        } catch(e) {}
                    }, 0);

                    return deferred.promise;
                }
            };
        });

})();
