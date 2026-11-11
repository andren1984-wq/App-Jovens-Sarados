var db = null;

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova', 'ngMessages', 'onezone-datepicker', 'angularMoment', 'chart.js'])

.constant('CONF', {
	appVersionNumber: '1.2.5',
	FACEBOOK_APP_ID: '178070482535498',
	webServiceUrl: 'https://app.jovenssarados.com/js-service/service.php',
	browserServiceUrl: 'https://app.jovenssarados.com/js-service/service-browser.php',
	domainUrl: 'https://app.jovenssarados.com/'
})

.constant('G', {
	__appVarsDefault: {
		canais: [{
			nome: 'Quem Somos',
			'icone': 'ion-fireball',
			'acao': {
				'type': '$state.go',
				data: ['app.quemSomos']
			}
		}, {
			nome: 'Liturgia Diária',
			'icone': 'ion-ios-bookmarks',
			'acao': {
				'type': '$state.go',
				data: ['app.liturgiaDiaria']
			}
		}, {
			nome: 'Formações',
			'icone': 'ion-university',
			'acao': {
				'type': '$state.go',
				data: ['app.posts', {catId: 'formacao', listType: 'thumb', pageTitle: 'Formações'}],
			}
		}, {
			nome: 'Orações',
			'icone': 'ion-ios-flame',
			'acao': {
				'type': '$state.go',
				data: ['app.posts', {catId: 'oracoes', pageTitle: 'Orações'}],
				pageTitle: 'Orações'
			}
		}, {
			nome: 'Pedido de Oração',
			'icone': 'ion-ios-people',
			'acao': {
				'type': '$state.go',
				data: ['app.pedidoOracao']
			}
		}, {
			nome: 'Frases dos Santos',
			'icone': 'ion-android-sunny',
			'acao': {
				'type': '$state.go',
				data: ['app.frasesSantos']
			}
		}, {
			nome: 'Santo do Dia',
			'icone': 'ion-android-happy',
			'acao': {
				'type': '$state.go',
				data: ['app.santoDoDia']
			}
		},{
			nome: 'Tv Sarados',
			'icone': 'ion-film-marker',
			'acao': {
				'type': '$state.go',
				data: ['app.tvSarados']
			}
		}, {
			nome: 'Diário Bíblico',
			'icone': 'ion-android-textsms',
			'acao': {
				'type': '$state.go',
				data: ['app.diarioBiblico']
			}
		}, {
			nome: 'Missões',
			'icone': 'ion-android-pin',
			'acao': {
				'type': '$state.go',
				data: ['app.missoes']
			}
		}, {
			nome: 'Músicas',
			'icone': 'ion-music-note',
			'acao': {
				'type': '$state.go',
				data: ['app.musicas']
			}
		}/*, {
			nome: 'Escola JS',
			'icone': 'ion-university',
			'acao': {
				'type': 'inAppBrowser',
				data: [{op: 'escolaJS'}]
			}
		}*/, {
			nome: 'Entre em Contato',
			'icone': 'ion-ios-email',
			'acao': {
				'type': '$state.go',
				data: ['app.contato']
			}
		}/*,{
			nome: 'Blogs',
			'icone': 'ion-chatbox-working',
			'acao': {
				'type': '$state.go',
				data: ['app.liturgiaDiaria']
			}
		}, {
			nome: 'Quem Somos',
			'icone': 'ion-chatbox-working',
			'acao': {
				'type': '$state.go',
				data: ['app.liturgiaDiaria']
			}
		}, {
			nome: 'Onde Estamos',
			'icone': 'ion-chatbox-working',
			'acao': {
				'type': '$state.go',
				data: ['app.liturgiaDiaria']
			}
		}*/]
	},
	santos:[
		{nome: 'São Padre Pio', img: 'img/santos-padrepio.jpg'},
		{nome: 'Santa Teresinha', img: 'img/santos-teresinha.jpg'},
		{nome: 'São João Paulo II', img: 'img/santos-joaopauloii.jpg'}
	],
	vars: {}
})

.config(function($httpProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider, CONF, G) {	

	$httpProvider.interceptors.push(function($rootScope) {
		return {
			response: function(r) {

				if (r && r.config && r.config.url && r.config.url == CONF.webServiceUrl) {

					if(
						r.config.data && r.config.data.op && 
						(r.config.data.op == 'pedrinhaCumprida' || r.config.data.op == 'estudoBiblicoAdd')
					) {
							if(r.config.data.pedrinha && r.config.data.pedrinha != 'jejumPenintencia') {
								$rootScope.compartilharPedrinha({pedrinha: (r.config.data.op == 'pedrinhaCumprida') ? r.config.data.pedrinha : 'biblia'});
							}
					}

					if (r.config.ionicLoadingToHide && r.config.ionicLoadingToHide == true) {

						$rootScope.webServiceLoading = false;
					}



					if (r && r.data && r.data.__appVarsToUpdate && r.data.__appVarsToUpdate.time && typeof(r.data.__appVarsToUpdate.vars) == 'object' && G && typeof(G.localStorage) == 'object') {

						var timeUpdated = G.localStorage.get('__appVarsTime');

						if (timeUpdated == false) {
							timeUpdated = 0;
						}

						if ((parseInt(timeUpdated) < parseInt(r.data.__appVarsToUpdate.time)) && parseInt(r.data.__appVarsToUpdate.time) > 0) {

							G.localStorage.set('__appVarsTime', parseInt(r.data.__appVarsToUpdate.time));
							G.localStorage.set('__appVarsVars', r.data.__appVarsToUpdate.vars);

							for (var i in r.data.__appVarsToUpdate.vars) {

								G.vars[i] = r.data.__appVarsToUpdate.vars[i];

								//console.log('GVarsUpdate ->', i, r.data.__appVarsToUpdate.vars[i], G.vars[i])
							}

						}
					}
				}

				if (r && r.data && r.data.__appVarsToUpdate) {
					delete r.data.__appVarsToUpdate;
				}

				//$rootScope.$broadcast('loading:hide')
				return r;
			}
		};
	});

	if (!ionic.Platform.isIOS() && window && window.location && window.location.origin && window.location.origin.substr(0, 7) == 'http://') {
		CONF.webServiceUrl = '/js-service/service.php';
		console.log('ionic live: ' + window.location.origin);
	} else {
		console.log('ionic device: ' + window.location.origin);
	}

	//$ionicConfigProvider.views.transition('android');

	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|data):|data:image\//);

	$ionicConfigProvider.backButton.previousTitleText(false);
	$ionicConfigProvider.backButton.text('');
	$ionicConfigProvider.scrolling.jsScrolling(false);

	if (ionic.Platform.isAndroid()) {
		//		
	}

	$stateProvider
		.state('app', {
			url: "/app",
			abstract: true,
			templateUrl: "templates/menu.html",
			controller: 'AppCtrl'
		})
		.state('login', {
			url: "/login",
			templateUrl: "templates/login.html",
			controller: 'LoginCtrl',
			data: {
				authenticate: false
			}
		})
		.state('criarconta', {
			url: "/criarconta",
			templateUrl: "templates/criarconta.html",
			controller: 'criarcontaCtrl',
			data: {
				authenticate: false
			}
		})
		.state('app.pedidoOracao', {
			cache: false,
			url: "/pedidoOracao",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/pedidoOracao.html",
					controller: 'pedidoOracaoCtrl'
				}
			},
			data: {
				authenticate: true
			}
		})
		.state('app.diarioBiblico', {
			cache: false,
			url: "/diarioBiblico",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/diarioBiblico.html",
					controller: 'diarioBiblicoCtrl'
				}
			},
			data: {
				authenticate: true
			}
		})
		.state('app.feed', {
			url: "/feed/{feedId}/{feedIdTop}",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/feed.html",
					controller: 'feedCtrl'
				}
			},
			data: {
				authenticate: false
			}
		})
		.state('app.canais', {
			url: "/canais/:id",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/canais.html",
					controller: 'canaisCtrl'
				}
			},
			data: {
				authenticate: false
			}
		})
		.state('app.missoes', {
			cache: false,
			url: "/missoes",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/missoes.html",
					controller: 'missoesCtrl'
				}
			},
			data: {
				authenticate: false
			}
		})
		.state('app.musicas', {
			cache: false,
			url: "/musicas",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/musicas.html",
					controller: 'musicasCtrl'
				}
			},
			data: {
				authenticate: false
			}
		})
		.state('app.tvSarados', {
			url: "/tvSarados/{catId}/{post}",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/tvSarados.html",
					controller: 'tvSaradosCtrl'
				}
			},
			data: {
				authenticate: false
			}
		})
		.state('app.liturgiaDiaria', {
			url: "/liturgiaDiaria",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/liturgiaDiaria.html",
					controller: 'liturgiaDiariaCtrl'
				}
			},
			data: {
				authenticate: false
			}
		}).state('app.escolaJs', {
			cache: false,
			url: "/escolaJs",
			views: {
				'mainContainerAppJs': {
					//templateUrl: "templates/liturgiaDiaria.html",
					controller: 'escolaJsCtrl'
				}
			},
			data: {
				authenticate: false
			}
		}).state('app.posts', {
			url: "/posts/{pageTitle}/{catId}/{post}/{listType}",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/posts.html",
					controller: 'postsCtrl'
				}
			},
			data: {
				authenticate: false
			}
		}).state('app.post', {
			url: "/post/{postId}",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/post.html",
					controller: 'postCtrl'
				}
			},
			data: {
				authenticate: false
			}
		}).state('app.pedrinhas', {
			cache: false,
			url: "/pedrinhas",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/pedrinhas.html",
					controller: 'pedrinhasCtrl'
				}
			},
			data: {
				authenticate: false
			}
		}).state('app.editarConta', {
			url: "/editarConta?onlyLack",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/editarConta.html",
					controller: 'editarContaCtrl'
				}
			},
			data: {
				authenticate: false
			}
		}).state('app.frasesSantos', {
			url: "/frasesSantos",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/frasesSantos.html",
					controller: 'frasesSantosCtrl'
				}
			},
			data: {
				authenticate: false
			}
		}).state('app.frasesSantosDetalhe', {
			url: "/frasesSantos/{idSanto}",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/frasesSantos.html",
					controller: 'frasesSantosCtrl'
				}
			},
			data: {
				authenticate: false
			}
		}).state('app.santoDoDia', {
			url: "/santoDoDia",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/santoDoDia.html",
					controller: 'santoDoDiaCtrl'
				}
			},
			data: {
				authenticate: false
			}
		}).state('app.quemSomos', {
			url: "/quemSomos",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/quemSomos.html",
					controller: 'quemSomosCtrl'
				}
			},
			data: {
				authenticate: false
			}
		}).state('app.contato', {
			url: "/contato",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/contato.html",
					controller: 'contatoCtrl'
				}
			},
			data: {
				authenticate: false
			}
		}).state('app.chat', {
		cache: false,
		url: "/chat",
		views: {
			'mainContainerAppJs': {
				templateUrl: "templates/chat.html",
				controller: 'chatCtrl'
			}
		},
		data: {
			authenticate: false
		}
	}).state('app.calendario', {
		cache: false,
		url: "/calendario",
		views: {
			'mainContainerAppJs': {
				templateUrl: "templates/calendario.html",
				controller: 'calendarioCtrl'
			}
		},
		data: {
			authenticate: false
		}
	}).state('app.painelAdmin', {
			url: "/painelAdmin",
			views: {
				'mainContainerAppJs': {
					templateUrl: "templates/painelAdmin.html",
					controller: 'painelAdminCtrl'
				}
			},
			data: {
				authenticate: false
			}
		});

	$urlRouterProvider.otherwise('/app/feed//');
})

.run(function(CONF, localStorage, $window, $cordovaNetwork, $ionicPlatform, $rootScope, $ionicPopup, $state, $ionicLoading, $cordovaSQLite, $cordovaToast, $location, $cordovaAppVersion, $cordovaStatusbar, $ionicHistory, $ionicModal, $timeout, jsUser, DB, G, webService, jsNotify, localStorage) {
	
	$ionicHistory.nextViewOptions({
	  disableBack: true
	});
	
	console.log('RUN');

	////////////////////////////////////////////////////////////
	//START VARS
	////////////////////////////////////////////////////////////
	G.localStorage = localStorage;

	var globalVarsToSet = localStorage.get('__appVarsVars');

	if (typeof(globalVarsToSet) == 'object') {

		for (var i in globalVarsToSet) {
			G.vars[i] = globalVarsToSet[i];
		}
	}

	for (var i in G.__appVarsDefault) {

		if (typeof(G.vars[i]) == 'undefined') {
			G.vars[i] = G.__appVarsDefault[i];
		}
	}
	////////////////////////////////////////////////////////////
	// END START VARS
	////////////////////////////////////////////////////////////


	////////////////////////////////////////////////////////////
	// YOUTUBE
	////////////////////////////////////////////////////////////

	$rootScope.innerHeight = $window.innerHeight;

	$ionicModal.fromTemplateUrl('templates/modal-youtubePlayer.html', {
		scope: $rootScope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$rootScope.youTubePlayerModal = modal;
	});

	window.addEventListener('resize', function() {
		if (document.getElementById('youTubePlayer')) {
			document.getElementById('youTubePlayer').height = $window.innerHeight;
		}
	}, false);

	$rootScope.youTubePlayer = function(videoId) {

		if (screen && screen.lockOrientation) {
			//screen.lockOrientation('landscape');
		}

		if (!window.onYouTubeIframeAPIReady) {

			window.onYouTubeIframeAPIReady = function() {

				window.youTubePlayer = new YT.Player('youTubePlayer', {
					width: '100%',
					height: $window.innerHeight,
					videoId: videoId,
					events: {
						'onReady': function(e) {
							e.target.playVideo();
							document.getElementById('youTubePlayerLoading').style.display = "none";
						},
						'onStateChange': function(e) {
							if (e.data == 0) {
								$rootScope.youTubePlayerClose();
							}
						},
						/*'onError': YoutubeonPlayerError*/
					}
				});
			};

		} else {
			window.youTubePlayer.loadVideoById(videoId, 1);
		}

		if (typeof(YT) == 'undefined') {
			var s = document.createElement('script');
			s.type = 'text/javascript';
			s.src = 'https://www.youtube.com/iframe_api';
			document.body.appendChild(s);
		}

		if (ionic.Platform.isAndroid()) {
			//ionic.Platform.fullScreen(true, false);
		}		

		$rootScope.youTubePlayerModal.show();
	};

	$rootScope.youTubePlayerClose = function() {

		$rootScope.youTubePlayerModal.hide();
	};

	$rootScope.$on('modal.hidden', function() {

		if (screen && screen.lockOrientation) {
			//screen.lockOrientation('portrait');
		}

		if (ionic.Platform.isAndroid()) {
			//ionic.Platform.fullScreen(false, true);
		}

		if (window.youTubePlayer) {
			window.youTubePlayer.stopVideo();
		}

	});
	////////////////////////////////////////////////////////////
	// END YOUTUBE PLAYER
	////////////////////////////////////////////////////////////


	$rootScope.$on('ionicLoading:hide', function() {
		$ionicLoading.hide();
	});

	$rootScope.goPage = function(h) {
		$location.path(h);
	};

	// Background scheduler para checagem da Agenda de Orações a cada 30 segundos
	// REGRA ESTRITA: O lembrete de oração é particular de cada usuário cadastrado!
	// Administradores e outros membros NÃO recebem avisos de outras pessoas.
	var ultimasNotificadas = {};
	setInterval(function() {
		try {
			var currentUser = null;
			try {
				var uRaw = window.localStorage.getItem('jsUser') || window.localStorage.getItem('js_user_profile_v1');
				if (uRaw) currentUser = JSON.parse(uRaw);
			} catch(e) {}

			// Se não há usuário autenticado no dispositivo, não dispara
			if (!currentUser || !currentUser.email) return;

			var curEmail = currentUser.email.toLowerCase().trim();
			var userKey = 'js_oracoes_agenda_v1_' + curEmail.replace(/[^a-z0-9]/g, '_');
			var raw = window.localStorage.getItem(userKey) || window.localStorage.getItem('js_oracoes_agenda_v1');
			if (!raw) return;

			var agenda = JSON.parse(raw);
			if (!Array.isArray(agenda) || agenda.length === 0) return;

			var now = new Date();
			var curH = ('0' + now.getHours()).slice(-2);
			var curM = ('0' + now.getMinutes()).slice(-2);
			var curTimeStr = curH + ':' + curM;
			var todayStr = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);

			for (var i = 0; i < agenda.length; i++) {
				var item = agenda[i];
				if (!item || !item.ativo) continue;

				// Se o item estiver marcado com email e for diferente do usuário logado, pula!
				var itemEmail = (item.userEmail || '').toLowerCase().trim();
				if (itemEmail && itemEmail !== curEmail) continue;

				if (item.horario === curTimeStr) {
					var notifKey = curEmail + '_' + item.oracaoId + '_' + todayStr + '_' + curTimeStr;
					if (!ultimasNotificadas[notifKey]) {
						ultimasNotificadas[notifKey] = true;
						console.log('[Agenda Oração Particular Disparada]', curEmail, item.nomeOracao, curTimeStr);

						// 1. Notificação Nativa no Celular (apenas para o usuário cadastrado no aparelho)
						if ('Notification' in window && Notification.permission === 'granted') {
							try {
								new Notification('⏰ Jovens Sarados • Hora da Oração', {
									body: 'Está na hora de rezar: ' + (item.nomeOracao || 'Oração Diária') + '! Pare 5 minutinhos para elevar o coração a Deus.',
									icon: 'img/brand/insta-profile-logo.jpg',
									badge: 'img/brand/insta-profile-logo.jpg',
									tag: 'agenda-' + item.oracaoId
								});
							} catch(e) {}
						}

						// 2. Notificação no Sininho do App (exclusiva para este usuário cadastrado)
						var notifItem = {
							id: 'notify-oracao-' + Date.now(),
							tipo: 'oracao',
							badge: 'Lembrete de Oração',
							oracaoId: item.oracaoId,
							targetUserEmail: curEmail,
							targetUserId: currentUser.id || null,
							title: '⏰ Hora da Oração! • Jovens Sarados',
							titleInt: 'Hora de Rezar: ' + item.nomeOracao,
							body: 'Alerta diário das ' + item.horario + ': Faça uma pausa no seu dia e reze com o carisma Jovens Sarados.',
							imgThumb: 'img/pedrinhas/oracao.svg',
							dateTime: Math.floor(Date.now() / 1000),
							isViewed: 0,
							url: '#/app/posts?catId=oracoes&post=' + item.oracaoId
						};

						if (typeof fetch === 'function') {
							fetch('/api/notificacoes', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify(notifItem)
							}).catch(function(){});
						}

						if ($rootScope.notifyTray) {
							$rootScope.notifyTray.unshift(notifItem);
							$rootScope.temNoticiaNova = true;
							$rootScope.notifyTrayNumber = ($rootScope.notifyTray.length > 9 ? '9+' : $rootScope.notifyTray.length);
							if (!$rootScope.$$phase) $rootScope.$apply();
						}
					}
				}
			}
		} catch(e) {}
	}, 30000);

	$rootScope.goState = function(a, b) {
		$state.go(a, b);
	};

	$rootScope.isUserAdminMaster = function() {
		if ($rootScope.isAdmin || $rootScope.userIsAdmin || $rootScope.isMaster) return true;
		try {
			var u = JSON.parse(window.localStorage.getItem('js_user_profile_v1') || '{}');
			if (u && (u.isAdmin || (u.email && u.email.toLowerCase() === 'andre.n1984@gmail.com'))) return true;
		} catch(e) {}
		try {
			var s = JSON.parse(window.localStorage.getItem('js_user_session') || '{}');
			if (s && (s.isAdmin || (s.email && s.email.toLowerCase() === 'andre.n1984@gmail.com'))) return true;
		} catch(e) {}
		return false;
	};


	$rootScope.compartilharPedrinha = function(data) {
		
		$ionicPopup.confirm({
			title: 'Pedrinha Cumprida com Sucesso!',
			content: 'Compartilhe agora mesmo no Facebook e dê seu testemunho 😄',
			okText: 'Compartilhar', 
			cancelText: 'Cancelar'
		}).then(function(r) {
			if(r) {
				$rootScope.share({pedrinha: data.pedrinha});
			}
		});

	};

	if (!window.cordova && !window.FB) {
		var s = document.createElement('div');
		s.id = 'fb-root';
		document.body.appendChild(s);

		s = document.createElement('script');
		s.type = 'text/javascript';
		s.src = 'js/facebookConnectPlugin.js';
		document.body.appendChild(s);		
	}

	$rootScope.share = function(data) { console.log('data', data);

		var href = '';

		if(data.feedShareLink) {
			href = data.feedShareLink;
		}else if(data.hrefUrl) {
			href = CONF.domainUrl+'js-post.php/'+data.hrefUrl;
		}else if(data.pedrinha) {
			href = CONF.domainUrl+'js-post.php/pedrinha/'+btoa(JSON.stringify({pedrinha: data.pedrinha, id: jsUser.getUser().id}));
		}else if(data.typePost) {
			href = data.typePost;
			delete data.typePost;
			data.userId = jsUser.getUser().id;
			href = CONF.domainUrl+'js-post.php/'+href+'/'+btoa(JSON.stringify(data));
		}else if(data.videoId) {
			href = 'https://youtu.be/'+data.videoId;
		}else if(data.postId) {
			href = CONF.domainUrl+'?p='+data.postId;
		}else if(data.imagem) {
			href = CONF.domainUrl+'js-post.php/img/'+btoa(data.imagem);
		}else if(data.id) {
			href = CONF.domainUrl+'js-post.php/'+data.id;
		} else {
			return false;
		}

		console.log(href);


		if (!window.cordova) {
			facebookConnectPlugin.browserInit(CONF.FACEBOOK_APP_ID);
		}

		facebookConnectPlugin.showDialog({
				method: 'share',
				href: href,				
			}, function(response) {
				console.log('facebookConnectPlugin', response);
			}, function(response) {
				//Error
		});
	};

	$rootScope.getReportPedrinhas = function(customEmail) {
		var targetEmail = customEmail || ($rootScope.membroPedrinhasInspecionado ? $rootScope.membroPedrinhasInspecionado.email : null);
		webService.call({op: 'pedrinhasReport', userEmail: targetEmail}, true).then(function(r){
			$rootScope.pedrinhas = r.data;
		});
	};

	$rootScope.abrirMinhasPedrinhas = function() {
		$rootScope.membroPedrinhasInspecionado = null;
		$rootScope.getReportPedrinhas();
		$state.go('app.pedrinhas', { inspect: null }, { reload: true });
	};

	$rootScope.abrirMeuDiario = function() {
		$rootScope.membroPedrinhasInspecionado = null;
		$state.go('app.diarioBiblico', {}, { reload: true });
	};

	$rootScope.abrirDiarioAdmin = function() {
		$rootScope.membroPedrinhasInspecionado = null;
		try {
			var admRaw = window.localStorage.getItem('js_admin_auth_v1');
			if (admRaw) {
				var adm = JSON.parse(admRaw);
				window.localStorage.setItem('js_user_profile_v1', JSON.stringify(adm));
				window.localStorage.setItem('jsUser', JSON.stringify(adm));
				window.localStorage.setItem('js_user_session', JSON.stringify(adm));
			} else {
				var defaultAdmin = {
					id: 'admin-master',
					nome: 'André Pereira do Nascimento (Admin)',
					email: 'andre.n1984@gmail.com',
					telefone: '(11) 98765-4321',
					cadastrado: true,
					isCadastrado: true,
					isAdmin: true
				};
				window.localStorage.setItem('js_admin_auth_v1', JSON.stringify(defaultAdmin));
				window.localStorage.setItem('js_user_profile_v1', JSON.stringify(defaultAdmin));
				window.localStorage.setItem('jsUser', JSON.stringify(defaultAdmin));
				window.localStorage.setItem('js_user_session', JSON.stringify(defaultAdmin));
			}
		} catch(e) {}
		$state.go('app.diarioBiblico', {}, { reload: true });
	};

	$rootScope.alternarPerfilTeste = function(modo) {
		if (modo === 'admin') {
			var adminUser = {
				id: 'admin-master',
				nome: 'André Pereira do Nascimento (Admin)',
				email: 'andre.n1984@gmail.com',
				telefone: '(11) 98765-4321',
				cadastrado: true,
				isCadastrado: true,
				isAdmin: true
			};
			window.localStorage.setItem('js_admin_auth_v1', JSON.stringify(adminUser));
			window.localStorage.setItem('js_user_profile_v1', JSON.stringify(adminUser));
			window.localStorage.setItem('jsUser', JSON.stringify(adminUser));
			window.localStorage.setItem('js_user_session', JSON.stringify(adminUser));
			$rootScope.isAdmin = true;
			$rootScope.membroPedrinhasInspecionado = null;
			$state.go('app.painelAdmin', {}, { reload: true });
		} else if (modo === 'colaborador') {
			var colabUser = {
				id: 'user-adriana',
				nome: 'Adriana Silva (Colaboradora)',
				email: 'adriana@teste.com',
				celular: '(11) 99999-8888',
				cadastrado: true,
				isCadastrado: true,
				isAdmin: false
			};
			window.localStorage.removeItem('js_admin_auth_v1');
			window.localStorage.setItem('js_user_profile_v1', JSON.stringify(colabUser));
			window.localStorage.setItem('jsUser', JSON.stringify(colabUser));
			window.localStorage.setItem('js_user_session', JSON.stringify(colabUser));
			$rootScope.isAdmin = false;
			$rootScope.membroPedrinhasInspecionado = null;
			$state.go('app.diarioBiblico', {}, { reload: true });
		}
	};

	$rootScope.getPrimeiroNome = function() {
		var u = null;
		try {
			if (typeof window !== 'undefined' && window.localStorage) {
				var raw = window.localStorage.getItem('js_user_profile_v1');
				if (raw) u = JSON.parse(raw);
			}
		} catch(e) {}
		if (!u && jsUser && typeof jsUser.getUser === 'function') {
			u = jsUser.getUser();
		}
		var n = (u && u.nome) ? u.nome.trim() : 'Membro';
		if (!n || n === 'Jovem Sarado') return 'Membro';
		return n.split(' ')[0];
	};

	$rootScope.isAdminUser = function() {
		var u = null;
		try {
			if (typeof window !== 'undefined' && window.localStorage) {
				var admRaw = window.localStorage.getItem('js_admin_auth_v1');
				if (admRaw) {
					var admObj = JSON.parse(admRaw);
					if (admObj && (admObj.isAdmin === true || admObj.email === 'andre.n1984@gmail.com' || admObj.email === 'admin')) return true;
				}
				var raw = window.localStorage.getItem('js_user_profile_v1');
				if (raw) u = JSON.parse(raw);
			}
		} catch(e) {}
		if (!u && jsUser && typeof jsUser.getUser === 'function') {
			u = jsUser.getUser();
		}
		if (!u) return false;
		var email = (u.email || '').toLowerCase().trim();
		return (u.isAdmin === true || email === 'andre.n1984@gmail.com' || email === 'admin');
	};

	$rootScope.isLoggedIn = function() {
		try {
			if ($rootScope.isAdminUser && $rootScope.isAdminUser()) return true;
			if (typeof jsUser !== 'undefined' && jsUser && typeof jsUser.isLogged === 'function' && jsUser.isLogged()) return true;
			if (typeof window !== 'undefined' && window.localStorage) {
				var adm = window.localStorage.getItem('js_admin_auth_v1');
				if (adm) return true;
				var prof = window.localStorage.getItem('js_user_profile_v1');
				if (prof) {
					var p = JSON.parse(prof);
					if (p && (p.email || p.nome || p.cadastrado)) return true;
				}
			}
		} catch(e) {}
		return false;
	};

	$rootScope.checkUserRegister = function() {
		if (typeof $rootScope.isMasterLogado === 'function' && $rootScope.isMasterLogado()) return;
		try {
			var p = JSON.parse(window.localStorage.getItem('js_user_profile_v1') || '{}');
			if (p && (p.cadastrado || p.isCadastrado || p.email)) return;
			var adm = JSON.parse(window.localStorage.getItem('js_admin_auth_v1') || '{}');
			if (adm && adm.isAdmin) return;
		} catch(e) {}

		if (jsUser.isLogged() == false) {			
			var confirmPopup = $ionicPopup.confirm({		
				cssClass: 'checkUserRegister',
				subTitle : 'É super rápido e fácil. Crie agora!',
				title: 'Crie sua conta rapidamente para usar essa e todas as funcionalidades 😃', 
				cssClass: 'button-assertive',
				okText: 'Entrar Agora Mesmo',
				cancelText: 'Não'
			}).then(function(r) {					
				
				if (r) {
					$state.go('login');
				}
			});

			//$state.go('login');
		}

	}

	$rootScope.aoSelecionarFotoDiario = function(input) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function(e) {
				$rootScope.$apply(function() {
					$rootScope.estudoBiblico.imagem = e.target.result;
				});
			};
			reader.readAsDataURL(input.files[0]);
		}
	};

	$rootScope.removerFotoDiario = function() {
		$rootScope.estudoBiblico.imagem = null;
		var inp = document.getElementById('diarioImgInputFile');
		if (inp) inp.value = '';
	};

	$rootScope.estudoBiblicoAdd = function() {	

		$rootScope.estudoBiblico = {
			passagem: '',
			texto: '',
			figurinha: '🔥 Fogo',
			temaCor: '#FF2A2A',
			imagem: null
		};

		var myPopup = $ionicPopup.show({
				templateUrl: 'templates/popupEstudoBiblico.html',
				title: '📖 Meu Diário Bíblico • Nova Anotação',
				subTitle: 'Guarde o que Deus falou intimamente com você hoje',
				scope: $rootScope,
				buttons: [{
					text: 'Cancelar'
				}, {
					text: '<b>Salvar Anotação</b>',
					type: 'button-assertive',
					onTap: function(e) {
						var txt = $rootScope.estudoBiblico.texto;
						if (!txt || txt.trim() === '') {
							alert('Por favor, escreva o que Deus falou ao seu coração antes de guardar.');
							e.preventDefault();
							return;
						}

						var payload = {
							op: 'estudoBiblicoAdd',
							texto: txt,
							passagem: $rootScope.estudoBiblico.passagem || '',
							figurinha: $rootScope.estudoBiblico.figurinha || '🔥 Fogo',
							temaCor: $rootScope.estudoBiblico.temaCor || '#FF2A2A',
							imagem: $rootScope.estudoBiblico.imagem || null
						};

						webService.call(payload).then(function(r){
							if($rootScope.pedrinhas && $rootScope.pedrinhas['biblia']) {
								$rootScope.pedrinhas['biblia'].doneToday = true;
							}
							
							if(window.plugins && window.plugins.toast) {
								$cordovaToast.show('Reflexão guardada no seu diário com total sigilo! 😄', 'long', 'bottom');
							}

							$rootScope.$broadcast('diarioBiblico.getFeed');

							if (typeof $rootScope.getReportPedrinhas === 'function') {
								$rootScope.getReportPedrinhas();
							}
						});
					}
			}]
		});
	};

	$rootScope.popupEditarConta = function() {	

		$rootScope.estudoBiblico = {};

		var myPopup = $ionicPopup.show({
				templateUrl: 'templates/popupEditarConta.html',
				title: 'Guarde o que Deus lhe falou!',
				scope: $rootScope,
				buttons: [{
					text: 'Cancelar'
				}, {
					text: '<b>Guardar</b>',
					type: 'button-positive',
					onTap: function(e) {
						var txt = $rootScope.estudoBiblico.texto;
						if (!txt || txt.trim() === '') {
							alert('Por favor, escreva sua anotação antes de guardar.');
							e.preventDefault();
							return;
						}

						webService.call({op: 'estudoBiblicoAdd', texto: txt}).then(function(r){
							if($rootScope.pedrinhas && $rootScope.pedrinhas['biblia']) {
								$rootScope.pedrinhas['biblia'].doneToday = true;
							}
							
							if(window.plugins && window.plugins.toast) {
								$cordovaToast.show('Reflexão guardada no diário! 😄', 'long', 'bottom');
							}

							$rootScope.$broadcast('diarioBiblico.getFeed');

							if (typeof $rootScope.getReportPedrinhas === 'function') {
								$rootScope.getReportPedrinhas();
							}
						});
					}
			}]
		});
	};

	if(window.StatusBar) {
		StatusBar.overlaysWebView(false);
	}

	$ionicPlatform.ready(function() {

		document.addEventListener("deviceready", function () {

			$rootScope.$on('$cordovaNetwork:offline', function(event, networkState){

				var currentUnixTime = Date.now() / 1000 | 0;

				var noInternetTime = localStorage.get('noInternetTime');

				if(!noInternetTime || noInternetTime < currentUnixTime - (60*5)) {

					localStorage.set('noInternetTime', currentUnixTime);
				   
					$rootScope.networkConnPopup = $ionicPopup.alert({
						title: 'Sem Internet',
						content: 'Você está sem Internet, mas você pode usar a Liturgia Diária.',
						okText: 'Acessar Liturgia'
					});

					$rootScope.networkConnPopup.then(function(r) {
						if(r) {
							$rootScope.goState('app.liturgiaDiaria');
						}
					});
				}

			});	

			$rootScope.$on('$cordovaNetwork:online', function(event, networkState){				
				$rootScope.networkConnPopup.close();
			});

			if($cordovaNetwork.isOffline()) {
				$rootScope.$broadcast('$cordovaNetwork:offline');
			}			

		}, false);

		if(window.MobileAccessibility) {	
			MobileAccessibility.setTextZoom(100);
		}

		if (ionic.Platform.isIOS()) {
			ionic.Platform.fullScreen();
		}

		if (navigator && navigator.splashscreen) {			
			navigator.splashscreen.hide();			
		}

		if(window.StatusBar) {
			ionic.Platform.fullScreen(true, true);
			StatusBar.styleLightContent();
			StatusBar.overlaysWebView(false);
		}

	});

	$rootScope.$on('$ionicView.loaded', function() {
	});

	$ionicPlatform.on("deviceready", function() {

		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}

		if(cordova && cordova.InAppBrowser && cordova.InAppBrowser.open){
			window.open = cordova.InAppBrowser.open;
		}
	});

	$ionicPlatform.on("resume", function() {

	});

	$rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) { 

		// Verificação obrigatória de cadastro de novos membros ou administrador
		var profileRaw = window.localStorage.getItem('js_user_profile_v1');
		var adminRaw = window.localStorage.getItem('js_admin_auth_v1');
		var isCadastrado = false;
		try {
			if (profileRaw) {
				var pObj = JSON.parse(profileRaw);
				if (pObj && (pObj.cadastrado === true || pObj.isCadastrado === true) && pObj.email) {
					isCadastrado = true;
				}
			}
			if (!isCadastrado && adminRaw) {
				var aObj = JSON.parse(adminRaw);
				if (aObj && aObj.isAdmin === true) {
					isCadastrado = true;
				}
			}
		} catch(e) {}

		$ionicPlatform.ready(function() {

			if(!jsUser.getUser()) {
				webService.call({op: 'registerUser'}).then(function(r){				
					var setUser = jsUser.setUser(r.data);
				});
			}

			// Rotas de evangelização e leitura pública (Frases dos Santos, Orações, Santo do Dia, Painel Admin, Criação de Conta)
			var rotasAbertas = ['login', 'criarconta', 'app.editarConta', 'app.painelAdmin', 'app.frasesSantos', 'app.frasesSantosDetalhe', 'app.santoDoDia', 'app.posts', 'app.canais', 'app.feed', 'app.calendario', 'app.chat'];
			if (!isCadastrado && rotasAbertas.indexOf(toState.name) === -1) {
				event.preventDefault();
				$state.go('login');
				return;
			}

			if (toState.name != 'login' && toState.name != 'criarconta') {			
				DB.start();
				jsNotify.start();				

				if(jsUser.isLogged()) {

					var userData = jsUser.getUser();

					var currentUnixTime = Date.now() / 1000 | 0;

					var lastCheckUserData = localStorage.get('lastCheckUserData6');

					if((!lastCheckUserData || lastCheckUserData < currentUnixTime - (3600*48))) {
						
						localStorage.set('lastCheckUserData6', currentUnixTime);

// Legacy alert removed in favor of modern onboarding
					}
				}		
			}
		});

		if (toState.data && toState.data.authenticate) {
			if (toState.name !== 'app.editarConta' && toState.name !== 'app.painelAdmin') {
				if (jsUser.isLogged() == false && !isCadastrado) {
					event.preventDefault();
					$rootScope.checkUserRegister();
				}
			}
		}

	});

	$rootScope.voltarHistorico = function() {
		var curState = ($state.current && $state.current.name) ? $state.current.name : '';
		
		// 1. Se estiver visualizando o conteúdo de uma oração/formação, volta para a lista
		var pEl = document.querySelector('.posts-conteudo') || document.querySelector('.posts');
		if (pEl && window.angular) {
			var pScope = angular.element(pEl).scope();
			if (pScope && pScope.conteudo && typeof pScope.voltarLista === 'function') {
				pScope.voltarLista();
				return;
			}
		}

		// 2. Se estiver na lista de posts/orações, volta para Canais
		if (curState === 'app.posts') {
			$state.go('app.canais');
			return;
		}

		// 3. Se estiver em Liturgia, Pedidos ou Frases, volta para Canais
		if (curState === 'app.liturgiaDiaria' || curState === 'app.pedidoOracao' || curState === 'app.frasesSantos') {
			$state.go('app.canais');
			return;
		}

		// 4. Se estiver em Canais ou Painel Admin, volta para o Feed
		if (curState === 'app.canais' || curState === 'app.painelAdmin') {
			$state.go('app.feed');
			return;
		}

		// 5. Fallback histórico
		if (window.history && window.history.length > 1) {
			window.history.back();
		} else {
			$state.go('app.feed');
		}
	};

	$rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
		console.log('$stateChangeSuccess', event);
		$rootScope.currentState = (toState && toState.name) ? toState.name : 'app.feed';
	$rootScope.dispararCompartilhamentoWhatsApp = function(texto) {
		var encoded = encodeURIComponent(texto || '');
		var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
		if (isMobile) {
			window.location.href = 'whatsapp://send?text=' + encoded;
			setTimeout(function() {
				window.open('https://api.whatsapp.com/send?text=' + encoded, '_blank');
			}, 600);
		} else {
			window.open('https://api.whatsapp.com/send?text=' + encoded, '_blank');
		}
	};

	$rootScope.dispararCompartilhamentoInstagram = function(texto) {
		if (texto && navigator && navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(texto);
		}
		var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
		if (isMobile) {
			window.location.href = 'instagram://app';
			setTimeout(function() {
				window.open('https://www.instagram.com/', '_blank');
			}, 700);
		} else {
			window.open('https://www.instagram.com/', '_blank');
		}
	};

		
		//TMP
		if( ! $rootScope.timeoutPromisse) {

			$rootScope.timeoutPromisse = $timeout(function() {				

				
				if(!$rootScope.lastStateName) {
					$rootScope.headerClassNum = 0;
					$rootScope.headerClass = 'background'+$rootScope.headerClassNum;
					$rootScope.lastStateName = toState.name;
				}

				if(toState.name != $rootScope.lastStateName) {

					$rootScope.lastStateName = toState.name;
					var headerClassRandNum = 0;
					
					while(true) {
						
						var headerClassRandNum = (Math.floor(Math.random() * (6 - 0 + 1)) + 0);
						
						if($rootScope.headerClassNum != headerClassRandNum) {
							$rootScope.headerClassNum = headerClassRandNum;
							break;
						}
					}
					
					$rootScope.headerClass = 'background'+$rootScope.headerClassNum;
				}

				$timeout.cancel($rootScope.timeoutPromisse);
				
				//$ionicLoading.show({template: ' ', duration: 1100, noBackdrop: true});

				$timeout(function() {
					delete $rootScope.timeoutPromisse;
				}, 1000);
			
			}, 1000);
		}
		//TMP end
	});

	//$timeout(function() { $state.go('app.profile');}, 5000); 
})
.directive('compile', ['$compile', function ($compile) {
	
	return function(scope, element, attrs) {
		scope.$watch(
			function(scope) {
				return scope.$eval(attrs.compile);
			},
			function(value) {
				element.html(value);
				$compile(element.contents())(scope);
			}
		);
	};

}])
.directive('headertemplate', function() {
	return {
		templateUrl: 'templates/modal-notify.html'
	};
});

function jsAddClass(target, className) {
	target.className += ' ' + className;
}
